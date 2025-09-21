import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import opening from './route/opening.js'
import authRoute from './route/authRoute.js'
import profileRoute from './route/profileRoute.js'
import productRouter from './route/productRoute.js'
import cartRoute from './route/cartRoute.js'
import transactionRoute from './route/transactionRoute.js'
import categoryRoute from './route/categoryRoute.js'
import clearRoute from './route/resetRoute.js'
import seedRoute from './route/seedRoute.js'
import storeRoute from './route/storeRoute.js'
import dbCheckRoute from './route/dbCheckRoute.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const app = express()

app.use(express.json())
app.use(cors())

app.use('/uploads', express.static(path.join(projectRoot, 'public', 'uploads')))

app.use('/', opening)
app.use('/auth', authRoute)
app.use('/profile', profileRoute)
app.use('/store', storeRoute)
app.use('/product', productRouter)
app.use('/cart', cartRoute)
app.use('/transaction', transactionRoute)
app.use('/category', categoryRoute)
app.use(clearRoute)
app.use('/seed', seedRoute)
app.use('/check', dbCheckRoute)

export default app