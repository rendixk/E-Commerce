import { Router} from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
import { createProduct, getAllProduct, searchProduct, getProductById, updateProduct, deleteProduct } from '../controller/productController.js'

const router = Router()

// Public Router (for all user)
router.get('/', getAllProduct)
router.get('/search', searchProduct)
router.get('/:id', getProductById)

// route to manage the product (only for seller)
router.post('/add', authenticateToken, upload.single('image'), createProduct)
router.put('/:id', authenticateToken, upload.single('image'), updateProduct)
router.delete('/:id', authenticateToken, deleteProduct)


export default router