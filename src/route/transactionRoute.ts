import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { 
    createTransaction, 
    confirmTransaction, 
    transactionHistory, 
    directTransaction,
    cancelTransactionSeller
} from '../controller/transactionController.js'

const router = Router()

//router to create transaction (only for buyer)
router.post('/cart/checkout', authenticateToken, createTransaction)

//router to create transaction automatically 
router.post('/checkout', authenticateToken, directTransaction)

//router to confirm transaction (only for seller)
router.post('/confirm', authenticateToken, confirmTransaction)

//router to cancel for seller
router.post('/cancel-by-seller', authenticateToken, cancelTransactionSeller)

//router to get transaction history (for buyer and seller)
router.get('/history', authenticateToken, transactionHistory)

export default router