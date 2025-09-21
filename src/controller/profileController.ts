import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import type { AuthRequest } from '../middleware/authMiddleware.js'
import chalk from 'chalk';

//get profile user
export const getProfile = async (req: AuthRequest, res: Response) => {
   console.log(chalk.cyan("Fetching user profile..."))
   const userId = req.user?.id

   if(!userId) {
      return res.status(401).json({ message: "Unathorized" })
   }

   try {
      const profile = await prisma.profiles.findUnique({
         where: { user_id: userId },
         include: {
            user: {
               select: {
                  balance: {
                     select: {
                        amount: true
                     }
                  }
               }
            }
         }
      })
      

      if(!profile) {
         console.log(chalk.yellow("Profile not found for this user."))
         return res.status(404).json({ message: "Profile not found." })
      }

      console.log(chalk.green("User profile fetched successfully."))
      res.status(200).json(profile)
   } 
   catch (error) {
      console.error(chalk.red(`Failed to fetch profile: ${error}`))
      res.status(500).json({ message: "Something went wrong" })
   }
}

//update useer profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
   console.log(chalk.cyan("Fetching user profile..."))
   const userId = req.user?.id
   const { username, address } = req.body

   if(!userId) {
      return res.status(404).json({ message: "Unathorized" })
   }

   try {
      const existProfile = await prisma.profiles.findUnique({ where: { user_id: userId} })
      if(!existProfile) {
         console.log(chalk.yellow("Update failed: Profile not found for this user."))
         return res.status(404).json({ message: "Profile not found: cannot update." })
      }

      const updateProfile = await prisma.profiles.update({
         where: { user_id: userId },
         data: {
            username,
            address
         }
      })
      console.log(chalk.green("Profile updated successfully."))
      res.status(201).json({ Message: "Profile updated successfully.", UpdatedProfile: updateProfile })
   }
   catch (error) {
      console.error(chalk.red(`Failed to update profile: ${error}`))
      res.status(500).json({ message: "Something went wrong" })
   }
}

//topup buyer balance 
export const topupBalance = async (req: AuthRequest, res: Response) => {
   console.log(chalk.cyan("User is topping up balance..."))
   const userId = req.user?.id
   const { amount } = req.body
   if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
   }
   if(typeof amount !== 'number' || amount <= 0) {
      return res.status(404).json({ message: "Invalid top-up amount" })
   }

   try {
      const updatedBalance = await prisma.balance.update({
         where: { user_id: userId },
         data: {
            amount: {
               increment: amount 
            }
         }
      })

      await prisma.balance_History.create({
         data: {
            user_id: userId,
            amount,
            transaction_type: 'top-up'
         }
      })

      console.log(chalk.green("Top-up successful."))
      res.status(200).json({ message: "Top-up successful", balance: updatedBalance})
   } 
   catch (error) {
      console.error(chalk.red(`top-up failed: ${error}`))
      res.status(500).json({ message: "Something went wrong" })
   }
}