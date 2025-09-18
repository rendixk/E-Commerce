import { Router } from 'express'
import chalk from 'chalk'

const router = Router()

router.get('/', (req, res) => {
   const data = [{
      "status": 200,
      "question": "How did this API work?",
      "answer": "Ask who create this API"
   }]
   console.log(chalk.greenBright("Accessed successfully"))
   res.json(data)
})

export default router