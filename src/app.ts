import express from 'express'
import opening from './route/opening.js'
import authRoute from './route/authRoute.js'
import userAuth from './route/userRoute.js'
import productRouter from './route/productRoute.js'

const app = express()

app.use(express.json())

app.use('/', opening)
app.use('/auth', authRoute)
app.use('/users', userAuth)
app.use('/product', productRouter)
export default app