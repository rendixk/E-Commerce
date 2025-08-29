import express from 'express'
import cors from 'cors'
import opening from './route/opening.js'
import authRoute from './route/authRoute.js'
import userAuth from './route/userRoute.js'
import productRouter from './route/productRoute.js'

const app = express()
const corsOption = {
   origin: 'http://localhost:5173',
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: true,
   optionsSuccessStatus: 200
 };

app.use(express.json())
app.use(cors(corsOption))

app.use('/', opening)
app.use('/auth', authRoute)
app.use('/users', userAuth)
app.use('/product', productRouter)

export default app