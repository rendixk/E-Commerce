import express from 'express'
import cors from 'cors'
import opening from './route/opening.js'
import authRoute from './route/authRoute.js'
import userAuth from './route/userRoute.js'
import productRouter from './route/productRoute.js'
import cartRoute from './route/cartRoute.js'
import transactionRoute from './route/transactionRoute.js'
import categoryRoute from './route/categoryRoute.js'
import clearRoute from './route/utilsRoute.js'

const app = express()

app.use(express.json())
app.use(cors())

app.use('/', opening)
app.use('/auth', authRoute)
app.use('/users', userAuth)
app.use('/product', productRouter)
app.use('/cart', cartRoute)
app.use('/transactions', transactionRoute)
app.use('/categories', categoryRoute)
app.use('/clear', clearRoute)

export default app