import { Router } from "express"
import { authenticateToken } from "../middleware/authMiddleware.js"
import { isSeller } from "../middleware/roleMiddleware.js"
import { createCategory, getAllCategories, updateCategory, deleteCategory } from "../controller/categoryController.js"

const router = Router()

//This endpoint only can access for seller already authenticated
router.post('/add', authenticateToken, isSeller, createCategory)
router.put('/:id', authenticateToken, isSeller, updateCategory)
router.delete('/:id', authenticateToken, isSeller, deleteCategory)

//This endpoint can access by every user that already logged (buyer or seller)
router.get('/', authenticateToken, getAllCategories)

export default router