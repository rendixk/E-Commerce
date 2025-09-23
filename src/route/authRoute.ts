import { Router } from 'express'
import { registerBuyer, registerSeller, login } from '../controller/authController.js'

const router = Router()

// Register for buyer
router.post('/buyer/register', registerBuyer)
router.post('/buyer/login', login)

// Register for seller
router.post('/seller/register', registerSeller)
router.post('/seller/login', login)

export default router