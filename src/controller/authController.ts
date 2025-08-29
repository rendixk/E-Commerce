import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import chalk from 'chalk'

const JWT_SECRET = process.env.JWT_SECRET_KEY || ""

export const register = async (req: Request, res: Response) => {
   console.log(chalk.cyan("Registering new user"))
   const { username, email, password, role_name } = req.body

   try {
      const existingEmail = await prisma.users.findUnique({
         where: { email: email }
     });
     if (existingEmail) {
         return res.status(409).json({ message: "Email is already in use." });
     }

     const existingUsername = await prisma.users.findFirst({
         where: { username: username }
     });
     if (existingUsername) {
         return res.status(409).json({ message: "Username is already taken." });
     }
      const role = await prisma.roles.findUnique({ where: { role_name } })
      if(!role) {
         console.log('invalid role specified')
         return res.status(404).json({ message: "invalide role" })
      }
      const hashedPass = await bcrypt.hash(password, 10)

      const user = await prisma.users.create({
         data: {
            username,
            email,
            password: hashedPass,
            role_id: role.id
         }
      })
      console.log(chalk.bold.green('User register successful!!'))
      res.status(201).json({ message: "User register sucessfully", User: user})
   }
   catch(error) {
      console.error(chalk.bold.red('Registration failed:', error));
      res.status(500).json({ message: 'Something went wrong.' })
   }
}

export const login = async (req: Request, res: Response) => {
   console.log(chalk.cyan("User attempting to log in..."))
   const { username, password} = req.body

   try {
      const user = await prisma.users.findFirst({
         where: { username },
         include: { role: true, profiles: true }
      })

      if(!user) {
         console.log(chalk.bold.red('Login failed: User not found.'));
         return res.status(400).json({ message: 'Invalid credentials.' })
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if(!isValidPassword) {
         console.log(chalk.bold.red('Login failed: Invalid password.'));
         return res.status(400).json({ message: 'Invalid credentials.' })
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role.role_name }, JWT_SECRET, { expiresIn: '1d' });

      console.log(chalk.bold.green('Login successful!!'))
      res.status(200).json({ message: "Login Success", Token: token, User: user})
   } 
   catch (error) {
      console.error(chalk.bold.red('Login failed:', error));
      res.status(500).json({ message: 'Something went wrong.' })
   }
}