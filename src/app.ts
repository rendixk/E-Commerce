import express from 'express'
import opening from './route/opening.js'
import authRoute from './route/authRoute.js'
import userAuth from './route/userRoute.js'

const app = express()

app.use(express.json())

app.use('/', opening)
app.use('/auth', authRoute)
app.use('/users', userAuth)

export default app