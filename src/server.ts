import app from './app.js'
import chalk from 'chalk'

const PORT = 3000

app.listen(PORT, () => {
   // console.log(`Server is running on http://localhost:${PORT}`)
   console.log(chalk.bold.green(`Server is running on http://localhost:3000`))
})