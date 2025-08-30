import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { isSeller, isbuyer } from '../middleware/roleMiddleware.js'
import { createTransaction, confirmTransaction } from '../controller/transactionController.js'

const router = Router()

//router to create transaction (only for buyer)
router.post('/', authenticateToken, isbuyer, createTransaction)

//router to confirm transaction (only for seller)
router.post('/confirm', authenticateToken, isSeller, confirmTransaction)

export default router