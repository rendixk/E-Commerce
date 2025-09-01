import { Router } from 'express'
import { seedDatabase } from '../controller/seedRoleController.js'

const router = Router()

router.post('/db', seedDatabase)

export default router