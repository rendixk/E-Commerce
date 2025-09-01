import { Router } from 'express'
import { clearDatabase } from '../controller/resetController.js'

const router = Router()

router.delete('/resetdb', clearDatabase)

export default router