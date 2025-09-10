import { Router } from 'express'
import { clearDatabase } from '../controller/resetController.js'

const router = Router()

router.delete('/reset', clearDatabase)

export default router