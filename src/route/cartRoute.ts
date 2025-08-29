import { Router} from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { isbuyer } from '../middleware/roleMiddleware.js'
import { addToCart, getCart, deleteCartItem } from '../controller/cartController.js'

const router = Router()

//router add product to cart
router.post('/', authenticateToken, isbuyer, addToCart)

//router to view all item inside cart
router.get('/', authenticateToken, isbuyer, getCart)

//router to delete an item from cart
router.delete('/:id', authenticateToken, isbuyer, deleteCartItem)

export default router