import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../db';

const supplyRouter = Router();

function calculateStatus(expirationDate: Date): string {
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  console.log('--- calculateStatus ---');
  console.log('expirationDate:', expirationDate);
  console.log('now:', now);
  console.log('diffTime:', diffTime);
  console.log('diffDays:', diffDays);

  if (diffDays <= 0) return 'Expired';
  if (diffDays <= 30) return 'NextExpiration';
  return 'Current';
}

supplyRouter.get('/supplies', async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.supplies.findMany();
    return res.status(200).json(inventory);
  } catch {
    return res.status(500).json({ error: "Unable to fetch inventory." });
  }
});

supplyRouter.get('/supplies/quantity-thresholds/:maxQuantity', async (req: Request, res: Response) => {
  try {
    const maxQuantity = parseInt(String(req.params.maxQuantity), 10);
    if (isNaN(maxQuantity)) {
      return res.status(400).json({ error: "Invalid maximum quantity format." });
    }
    const filteredSupplies = await prisma.supplies.findMany({
      where: {
        quantity: {
          lte: maxQuantity,
        },
      },
    });
    return res.status(200).json(filteredSupplies);
  } catch {
    return res.status(500).json({ error: "Database error while filtering supply quantities." });
  }
});

supplyRouter.get('/supplies/statuses/:statusValue', async (req: Request, res: Response) => {
  try {
    const statusValue = String(req.params.statusValue);
    if (statusValue !== 'Expired' && statusValue !== 'NextExpiration' && statusValue !== 'Current') {
      return res.status(400).json({ error: "Provided status value does not exist." });
    }
    const filteredSupplies = await prisma.supplies.findMany({
      where: {
        status: statusValue,
      },
    });
    return res.status(200).json(filteredSupplies);
  } catch {
    return res.status(500).json({ error: "Database error while filtering supply statuses." });
  }
});

supplyRouter.post('/supply', async (req: Request, res: Response) => {
  try {
    const { supplyName, quantity, unitCost, orderDate, expirationDate } = req.body;
    if (!supplyName || quantity === undefined || unitCost === undefined || !orderDate || !expirationDate) {
      return res.status(400).json({ error: "Missing supply data." });
    }
    const ordDate = new Date(orderDate);
    const expDate = new Date(expirationDate);
    const parsedQuantity = parseInt(quantity, 10);
    const parsedUnitCost = Number(unitCost);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0." });
    }
    if (isNaN(parsedUnitCost) || parsedUnitCost < 0) {
      return res.status(400).json({ error: "Unit cost cannot be negative." });
    }
    if (expDate < ordDate) {
      return res.status(400).json({ error: "Expiration date cannot be before order date." });
    }

    const statusCalc = calculateStatus(expDate);
    await prisma.supplies.create({
      data: {
        supplyName,
        quantity: parsedQuantity,
        unitCost: new Prisma.Decimal(unitCost),
        orderDate: ordDate,
        expirationDate: expDate,
        status: statusCalc,
      },
    });
    return res.status(201).json({ success: true, message: "Supply added", debug: { statusCalc, expDate, ordDate } });
  } catch (err: any) {
    return res.status(500).json({ error: "Could not add supply.", details: err.message });
  }
});

supplyRouter.put('/supplies/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { supplyName, quantity, unitCost, orderDate, expirationDate } = req.body;
    let supplyId: bigint;
    try {
      supplyId = BigInt(String(id));
    } catch {
      return res.status(400).json({ error: "Invalid supply ID or quantity." });
    }
    const updateData: any = {};
    if (supplyName !== undefined) updateData.supplyName = supplyName;
    
    if (quantity !== undefined) {
      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ error: "Quantity must be greater than 0." });
      }
      updateData.quantity = parsedQuantity;
    }
    
    if (unitCost !== undefined) {
      const parsedUnitCost = Number(unitCost);
      if (isNaN(parsedUnitCost) || parsedUnitCost < 0) {
        return res.status(400).json({ error: "Unit cost cannot be negative." });
      }
      updateData.unitCost = new Prisma.Decimal(unitCost);
    }

    const existingSupply = await prisma.supplies.findUnique({ where: { id: supplyId } });
    if (!existingSupply) {
      return res.status(404).json({ error: "Supply not found." });
    }

    const finalOrderDate = orderDate !== undefined ? new Date(orderDate) : existingSupply.orderDate;
    const finalExpDate = expirationDate !== undefined ? new Date(expirationDate) : existingSupply.expirationDate;

    if (finalExpDate < finalOrderDate) {
      return res.status(400).json({ error: "Expiration date cannot be before order date." });
    }

    if (orderDate !== undefined) updateData.orderDate = finalOrderDate;
    if (expirationDate !== undefined) {
      updateData.expirationDate = finalExpDate;
      updateData.status = calculateStatus(finalExpDate);
    }

    await prisma.supplies.update({
      where: { id: supplyId },
      data: updateData,
    });
    return res.status(200).json({ success: true, message: "Supply updated" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: "Supply not found." });
    }
    return res.status(400).json({ error: "Invalid supply ID or quantity." });
  }
});

supplyRouter.delete('/supplies/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let supplyId: bigint;
    try {
      supplyId = BigInt(String(id));
    } catch {
      return res.status(400).json({ error: "Supply ID required." });
    }
    await prisma.supplies.delete({
      where: { id: supplyId },
    });
    return res.status(200).json({ success: true, message: "Supply deleted" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: "Supply not found." });
    }
    return res.status(500).json({ error: "Deletion failed." });
  }
});

export default supplyRouter;