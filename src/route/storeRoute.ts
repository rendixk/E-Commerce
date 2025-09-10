import { Router } from "express"
import { authenticateToken } from "../middleware/authMiddleware.js"
import { createStore, getMyStore } from "../controller/storeController.js"

const router = Router()

//Create store
router.post('/create', authenticateToken, createStore)

//Get my store
router.get('/', authenticateToken, getMyStore)

export default router