import { Router } from 'express'
import { seedRole, seedCategory } from '../controller/seedRoleController.js'

const router = Router()

router.post('/role', seedRole)
router.post('/category', seedCategory)

export default router