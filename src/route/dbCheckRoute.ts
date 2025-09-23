import { Router } from "express"
import { 
    userTable, 
    roleTable, 
    profileTable,
    balanceTable, 
    categoryTable, 
    productTable, 
    storeTable, 
    cartTable,
    paymentTable,
    balanceHistoryTabel,
    cartItemsTable,
    storeConfirmationTable,
    transactionDetailsTable,
    transactionTable
} from "../controller/dbCheckController.js"

const router = Router()

router.get('/role', roleTable)
router.get('/user', userTable)
router.get('/profile', profileTable)
router.get('/balance', balanceTable)
router.get('/balance-history', balanceHistoryTabel)
router.get('/store', storeTable)
router.get('/category', categoryTable)
router.get('/product', productTable)
router.get('/cart', cartTable)
router.get('/cart-item', cartItemsTable)
router.get('/transaction', transactionTable)
router.get('/payment', paymentTable)
router.get('/transaction-detail', transactionDetailsTable)
router.get('/store-confirm', storeConfirmationTable)

export default router