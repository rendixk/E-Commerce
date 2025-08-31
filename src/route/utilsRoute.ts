import { Router } from 'express'
import { clearDatabase } from '../controller/utilsController.js'

const router = Router()

router.delete('/cleardb', clearDatabase)

export default router