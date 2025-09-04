import { Router } from "express"
import { authenticateToken } from "../middleware/authMiddleware.js"
import { createCategory, getAllCategories, updateCategory, deleteCategory } from "../controller/categoryController.js"

const router = Router()

//This endpoint only can access for seller already authenticated
router.post('/add', authenticateToken, createCategory)
router.put('/:id', authenticateToken, updateCategory)
router.delete('/:id', authenticateToken, deleteCategory)

//This endpoint can access by every user that already logged (buyer or seller)
router.get('/', authenticateToken, getAllCategories)

export default router