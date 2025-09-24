import { Router} from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { addToCart, getCart, editCart, deleteCartItem } from '../controller/cartController.js'

const router = Router()

//router add product to cart
router.post('/add', authenticateToken, addToCart)

//router to view all item inside cart
router.get('/', authenticateToken, getCart)

//router to edit item quantity
router.put('/edit/:id', authenticateToken, editCart)

//router to delete an item from cart
router.delete('/:id', authenticateToken, deleteCartItem)

export default router