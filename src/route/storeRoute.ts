import { Router } from "express"
import { authenticateToken } from "../middleware/authMiddleware.js"
import { getMyStore, updateStore } from "../controller/storeController.js"
// import { createStore } from '../controller/storeController.js'

const router = Router()

//Create store
// router.post('/create', authenticateToken, createStore)

//Get my store
router.get('/mystore', authenticateToken, getMyStore)
router.put('/mystore/edit', authenticateToken, updateStore)

export default router