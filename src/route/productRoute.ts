import { Router} from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { isSeller } from '../middleware/roleMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
import { createProduct, getAllProduct, getProductById, updateProduct, deleteProduct } from '../controller/productController.js'

const router = Router()

// route to manage the product (only for seller)
router.post('/add', authenticateToken, isSeller, upload.single('image'), createProduct);
router.put('/:id', authenticateToken, isSeller, upload.single('image'), updateProduct);
router.delete('/:id', authenticateToken, isSeller, deleteProduct);

// Public Router (for all user)
router.get('/', getAllProduct);
router.get('/:id', getProductById);

export default router