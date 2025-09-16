import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { createProfile, getProfile, updateProfile, getBalance, topupBalance } from '../controller/profileController.js'

const router = Router()

router.post('/profile/create', authenticateToken, createProfile)
router.put('/profile/edit', authenticateToken, updateProfile);
router.get('/profile', authenticateToken, getProfile);
router.get('/balance', authenticateToken, getBalance);
router.post('/balance/topup', authenticateToken, topupBalance);

export default router