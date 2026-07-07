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

router.get('/', checkRole(['Receptionist', 'Administrator']), getPaymentHistory);
router.get('/:paymentId', checkRole(['Receptionist', 'Administrator']), getPaymentById);
router.get('/patients/:patientId', checkRole(['Receptionist', 'Administrator']), getPaymentsByPatient);

router.post('/', checkRole(['Receptionist', 'Administrator']), createPayment);
router.put('/:paymentId', checkRole(['Receptionist', 'Administrator']), updatePayment);
router.delete('/:paymentId', checkRole(['Receptionist', 'Administrator']), deletePayment);

export default router;