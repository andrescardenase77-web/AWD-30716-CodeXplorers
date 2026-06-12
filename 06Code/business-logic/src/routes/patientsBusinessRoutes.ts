import { Router } from 'express';
import { 
  calculatePatientPediatricCategory,
  validateLegalRepresentative,
  calculateDaysToBirthday,
  calculateSeniorDiscount,
  estimateConsultationTime,
  calculateContactPriority
} from '../controllers/patientsBusinessController';

const router = Router();

router.post('/calculate-category', calculatePatientPediatricCategory);
router.post('/validate-legal-representative', validateLegalRepresentative);
router.post('/calculate-days-to-birthday', calculateDaysToBirthday);
router.post('/calculate-senior-discount', calculateSeniorDiscount);
router.post('/estimate-consultation-time', estimateConsultationTime);
router.post('/calculate-contact-priority', calculateContactPriority);

export default router;