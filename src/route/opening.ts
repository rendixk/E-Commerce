import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
   const data = [{
      "status": 200,
      "question": "Kok bisa wok?",
      "answer": "25 Agustus 2025"
   }]
   console.log("Accessed successfully")
   res.json(data)
})

export default router