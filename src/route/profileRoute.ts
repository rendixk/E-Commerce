import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { getProfile, updateProfile, topupBalance } from '../controller/profileController.js'

const router = Router()

router.put('/myprofile/edit', authenticateToken, updateProfile);
router.get('/myprofile', authenticateToken, getProfile);
router.post('/balance/topup', authenticateToken, topupBalance);

export default router