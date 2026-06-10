import { Router } from 'express';
import {
  getPaymentHistory,
  getPaymentById,
  getPaymentsByPatient
} from '../controllers/paymentsBusinessController';

const router = Router();

router.get('/payments', getPaymentHistory);
router.get('/payments/:paymentId', getPaymentById);
router.get('/patients/:patientId/payments', getPaymentsByPatient);

export default router;
