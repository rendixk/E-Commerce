import 'dotenv/config'
import app from './app.js'
import chalk from 'chalk'

const PORT = 3000

const server = app.listen(PORT, () => {
   // console.log(`Server is running on http://localhost:${PORT}`)
   console.log(chalk.bold.green(`Server is running on http://localhost:${PORT}`))
})

process.on('SIGINT', async () => {
   console.log(chalk.yellow('Shutting down server...'))
   server.close(() => {
      console.log(chalk.yellow('Server gracefully terminated.'))
      process.exit(0)
   })
})