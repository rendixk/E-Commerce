import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { createTransaction, transactionHistory ,confirmTransaction } from '../controller/transactionController.js'

const router = Router()

//router to create transaction (only for buyer)
router.post('/', authenticateToken, createTransaction)

//router to confirm transaction (only for seller)
router.post('/confirm', authenticateToken, confirmTransaction)

//router to get transaction history (for buyer and seller)
router.get('/history', authenticateToken, transactionHistory)

export default router