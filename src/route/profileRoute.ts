import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { createProfile, getProfile, updateProfile, getBalance, topupBalance } from '../controller/profileController.js'

const router = Router()

router.post('/profile', authenticateToken, createProfile)
router.put('/profile', authenticateToken, updateProfile);
router.get('/profile', authenticateToken, getProfile);
router.get('/balance', authenticateToken, getBalance);
router.post('/balance/topup', authenticateToken, topupBalance);

export default router