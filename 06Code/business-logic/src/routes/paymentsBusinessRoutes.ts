import { Router } from 'express';
import { checkRole } from '../middleware/checkRole';
import {
  getPaymentHistory,
  getPaymentById,
  getPaymentsByPatient,
  createPayment,
  updatePayment,
  deletePayment
} from '../controllers/paymentsBusinessController';

const router = Router();

router.get('/', checkRole(['Receptionist']), getPaymentHistory);
router.get('/:paymentId', checkRole(['Receptionist']), getPaymentById);
router.get('/patients/:patientId', checkRole(['Receptionist']), getPaymentsByPatient);

router.post('/', checkRole(['Receptionist']), createPayment);
router.put('/:paymentId', checkRole(['Receptionist']), updatePayment);
router.delete('/:paymentId', checkRole(['Receptionist']), deletePayment);

export default router;