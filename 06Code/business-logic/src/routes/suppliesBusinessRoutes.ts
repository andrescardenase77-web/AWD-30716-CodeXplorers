import { Router } from 'express';
import { checkRole } from '../middleware/checkRole';
import { 
  updateExpirationStatus, 
  getAssetValuation, 
  getRestockProvisions, 
  getExpirationLosses, 
  getCapitalRisks 
} from '../controllers/suppliesBusinessController';

const router = Router();

router.post('/status-calculations', updateExpirationStatus);
router.get('/asset-valuations', checkRole(['Administrator']), getAssetValuation);
router.get('/restock-provisions', checkRole(['Administrator']), getRestockProvisions);
router.get('/expiration-losses', getExpirationLosses);
router.get('/capital-risks', getCapitalRisks);

export default router;