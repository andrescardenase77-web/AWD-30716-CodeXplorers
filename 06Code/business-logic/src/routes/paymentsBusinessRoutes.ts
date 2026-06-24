import { Router } from 'express';
import { checkRole } from '../middleware/checkRole';
import {
  getPaymentHistory,
  getPaymentById,
  getPaymentsByPatient
} from '../controllers/paymentsBusinessController';

const router = Router();

router.get('/', checkRole(['Receptionist']), getPaymentHistory);
router.get('/:paymentId', getPaymentById);
router.get('/patients/:patientId', getPaymentsByPatient);

export default router;