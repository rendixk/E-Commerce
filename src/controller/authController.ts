import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import chalk from 'chalk'

//Register for seller role
export const registerBuyer = async (req: Request, res: Response) => {
   try {
      console.log(chalk.cyan("Registering a new buyer..."))
      const { username, email, password } = req.body
      if(!username || !email || !password) {
         return res.status(400).json({ message: "All fields are required" })
      }

      const existingUsername = await prisma.users.findFirst({ where: { username } })
      if(existingUsername) {
         return res.status(409).json({ message: "Username already in use"  })
      }

      const existingUser = await prisma.users.findUnique({ where: { email } })
      if(existingUser) {
         return res.status(409).json({ message: "Email already in use" })
      }
      
      const role = await prisma.roles.findUnique({ where: { role_name: 'buyer'} })
      if(!role) {
         return res.status(404).json({ message: "'Buyer' role is not found" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await prisma.users.create({
         data: {
            username,
            email,
            password:hashedPassword,
            role_id: role.id
         }
      })

      console.log("New buyer registered successfully.")
      res.status(201).json({ message: "Buyer registration successfully", User: newUser })
   }
   catch(error) {
      console.error(`Error during buyer registration: ${error}`)
      res.status(500).json({ message: "Someting went wrong" })
   }
}

export const registerSeller = async (req: Request, res: Response) => {
   console.log(chalk.cyan("Registering a new seller..."))
   const { username, email, password } = req.body
   if(!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
   }

   try {
      const existingUser = await prisma.users.findUnique({ where: { email } })
      if(existingUser) {
         return res.status(409).json({ message: "Email already in use" })
      }
      const role = await prisma.roles.findUnique({ where: { role_name: 'seller' }})
      if (!role) {
         return res.status(500).json({ message: "Role 'seller' not found." });
     }

     const hashedPassword = await bcrypt.hash(password, 10)

     const newUser = await prisma.users.create({
      data: {
         username,
         email,
         password: hashedPassword,
         role_id: role.id
      }
     })
      console.log("New seller registered successfully.");
      res.status(201).json({ message: "Seller registration successful.", newUser })
   } 
   catch (error) {
      console.error(`Error during buyer registration: ${error}`)
      res.status(500).json({ message: "Someting went wrong" })
   }
}

export const login = async (req: Request, res: Response) => {
   console.log(chalk.cyan("User attempting to log in..."))
   const { username, password} = req.body
   if(!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
   }

   try {
      const user = await prisma.users.findFirst({
         where: { username },
         include: { role: true, profiles: true }
      })

      if(!user ||  !(await bcrypt.compare(password, user.password))) {
         console.log(chalk.bold.red('Login failed: User not found.'));
         return res.status(400).json({ message: 'Invalid credentials.' })
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role.role_name }, process.env.JWT_SECRET_KEY as string, { expiresIn: '1d' });

      console.log(chalk.bold.green('Login successful!!'))
      res.status(200).json({ message: "Login Success", Token: token, User: user})
   } 
   catch (error) {
      console.error(chalk.bold.red('Login failed:', error));
      res.status(500).json({ message: 'Something went wrong.' })
   }
}