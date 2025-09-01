import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
   const data = [{
      "status": 200,
      "question": "How did this API work?",
      "answer": "Ask who create this API"
   }]
   console.log("Accessed successfully")
   res.json(data)
})

export default router