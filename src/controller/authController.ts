import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import chalk from 'chalk'

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

      await prisma.$transaction( async (prisma) => {
         const newUser = await prisma.users.create({
            data: {
               username,
               email,
               password:hashedPassword,
               role_id: role.id
            }
         })
   
         await prisma.profiles.create({
            data: {
               user_id: newUser.id,
               email: newUser.email,
               username: newUser.username,
               address: ""
            }
         })
   
         await prisma.balance.create({
            data: {
               user_id: newUser.id,
               amount: 0
            }
         })
         console.log(chalk.greenBright("Buyer Account created successfully."))
         res.status(201).json({ message: "Buyer registration successful.", user: newUser })
      })
   }
   catch(error) {
      console.error(`Error during buyer registration: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const registerSeller = async (req: Request, res: Response) => {
   try {
      console.log(chalk.cyan("Registering a new seller..."))
      const { username, email, password, store_name } = req.body
      if(!username || !email || !password || !store_name) {
         return res.status(400).json({ message: "All fields are required" })
      }
      const existingUsername = await prisma.users.findFirst({ where: { username } })
      if(existingUsername) {
         console.log(chalk.redBright("username already in use"))
         return res.status(409).json({ message: "Username already in use"  })
      }

      const existingUser = await prisma.users.findUnique({ where: { email } })
      if(existingUser) {
         console.log("email already in use")
         return res.status(409).json({ message: "Email already in use" })
      }

      const role = await prisma.roles.findUnique({ where: { role_name: 'seller' }})
      if (!role) {
         console.log(chalk.redBright("Role 'seller' not found"))
         return res.status(500).json({ message: "Role 'seller' not found." });
      }

      const existingStore = await prisma.stores.findFirst({ where: { store_name } })
        if (existingStore) {
            return res.status(409).json({ message: "Store name already in use" })
        }

     const hashedPassword = await bcrypt.hash(password, 10)

     await prisma.$transaction(async (prisma) => {
         const newUser = await prisma.users.create({
            data: {
               username,
               email,
               password: hashedPassword,
               role_id: role.id
            }
         })

         await prisma.stores.create({
            data: {
               user_id: newUser.id,
               store_name,
               owner_name: newUser.username,
               address: ""
            }
         })

        

         await prisma.balance.create({
            data: {
               user_id: newUser.id,
               amount: 0
            }
         })

         console.log(chalk.greenBright("Seller Account Created Successfully."))
         res.status(201).json({ message: "Seller registration successful.", user: newUser })
     })
     
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
      const userWithPassword = await prisma.users.findFirst({
         where: { username },
         include: { 
            role: true,
            stores: true
         }
      })
      if(!userWithPassword || !(await bcrypt.compare(password, userWithPassword.password))) {
         console.log(chalk.redBright('Login failed: Invalid credentials.'))
         return res.status(400).json({ message: 'Invalid credentials.' })
      }

      const user = await prisma.users.findUnique({
         where: { id: userWithPassword.id },
         select: {
            id: true,
            email: true,
            role: {
               select: {
                  role_name: true
               }
            }
         }
      })

      const token = jwt.sign({ id: user?.id, email: user?.email, role: user?.role.role_name }, process.env.JWT_SECRET_KEY as string, { expiresIn: '1d' })

      let responsData: any = { Token: token }
      if(user?.role.role_name === 'buyer') {
         const buyerData = await prisma.users.findUnique({
            where: { id: user.id },
            select: {
               profiles: {
                  select: {
                     username: true,
                     email: true,
                     address: true
                  }
               },
               balance: {
                  select: {
                     amount: true
                  }
               },
               carts: {
                  select: {
                     cart_items: {
                        select: {
                           product: {
                              select: {
                                 product_name: true,
                                 description: true,
                                 price: true,
                                 stock: true,
                                 image: true,
                                 category: {
                                    select: {
                                       category_name: true
                                    }
                                 },
                                 store: {
                                    select: {
                                       store_name: true
                                    }
                                 }
                              }
                           }
                        }
                     }
                  }
               }
            }
         })

         responsData.data = {
            profile: buyerData?.profiles,
            balance: buyerData?.balance,
            cart: buyerData?.carts
         }
      }

      else if(user?.role.role_name === 'seller') {
         const sellerData = await prisma.users.findUnique({
            where: { id: user.id },
            select: {
               username: true,
               email: true,
               role: {
                  select: {
                     role_name: true
                  }
               },
               stores: {
                  select: {
                     id: true,
                     store_name: true,
                     owner_name: true,
                     address: true,
                     products: {
                        select: {
                           product_name: true,
                           description: true,
                           price: true,
                           stock: true,
                           image: true,
                           category: {
                              select: {
                                 category_name: true
                              }
                           }
                        }
                     }
                  }
               },
               balance: {
                  select: {
                     amount: true
                  }
               }
            }
         })

         responsData.data = {
            store: sellerData?.stores,
            balance: sellerData?.balance
         }
      }

      console.log(chalk.bold.green('Login successful!!'))
      res.status(200).json({ Message: "Login Successfull", responsData })
   } 
   catch (error) {
      console.error(chalk.bold.red('Login failed:', error));
      res.status(500).json({ message: 'Something went wrong.' })
   }
}