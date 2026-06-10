import { Router } from 'express';
import { calculatePatientPediatricCategory } from '../controllers/patientsBusinessController';

const router = Router();

router.post('/calculate-category', calculatePatientPediatricCategory);

export default router;
