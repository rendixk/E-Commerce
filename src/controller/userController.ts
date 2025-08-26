import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import type { AuthRequest } from '../middleware/authMiddleware.js'

//create profile user
export const createProfile = async (req: AuthRequest, res: Response) => {
   console.log("Creating new user profile...");
   const userId = req.user?.id;
   const userEmail = req.user?.email;
   const { fullname, address } = req.body;
 
   if (!userId || !userEmail) {
     return res.status(401).json({ message: "Unauthorized." });
   }
   try {
     const existingProfile = await prisma.profiles.findUnique({
       where: { user_id: userId },
     });
 
      if (existingProfile) {
         console.log("Profile already exists.");
         return res.status(409).json({ message: "Profile already exists." });
      }
      const newProfile = await prisma.profiles.create({
         data: {
            fullname,
            address,
            user_id: userId,
            email: userEmail,
         },
      });
 
     console.log("Profile created successfully.");
     res.status(201).json({ message: "Profile created successfully!", newProfile });
   } 
   catch (error) {
     console.error(`Failed to create profile: ${error}`);
     res.status(500).json({ message: "Something went wrong" });
   }
 };
 

//get profile user
export const getProfile = async (req: AuthRequest, res: Response) => {
   console.log("Fetching user profile...")
   const userId = req.user?.id

   if(!userId) {
      return res.status(401).json({ message: "Unathorized" })
   }

   try {
      const profile = await prisma.profiles.findUnique({
         where: { user_id: userId },
         include: { user: true}
      })

      if(!profile) {
         console.log("Profile not found for this user.")
         return res.status(404).json({ message: "Profile not found." })
      }

      console.log("User profile fetcehd successfully.")
      res.status(200).json(profile)
   } 
   catch (error) {
      console.error(`Failed to fetch profile: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

//update useer profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
   console.log("Updating user profile...")
   const userId = req.user?.id
   const { fullname, address } = req.body

   if(!userId) {
      return res.status(404).json({ message: "Unathorized" })
   }

   try {
      const existProfile = await prisma.profiles.findUnique({ where: { user_id: userId} })
      if(!existProfile) {
         console.log("Update failed: Profile not foun for this user")
         return res.status(404).json({ message: "Profile not found: cannot update." })
      }

      const updatedProfile = await prisma.profiles.update({
         where: { user_id: userId },
         data: {
            fullname,
            address
         }
      })
      console.log("Profile updated successfully.")
      res.status(201).json({ message: "Profile updated successfully", updatedProfile })
   }
   catch (error) {
      console.error(`Failed to update profile: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}


//user balance 
export const getBalance = async (req: AuthRequest, res: Response) => {
   console.log("Fetching user balance...")
   const userId = req.user?.id

   if(!userId) {
      return res.status(404).json({ message: "Unathorized" })
   }

   try {
      const balance = await prisma.balance.findUnique({
         where: { user_id: userId},
         select: { amount: true}
      })
      if(!balance) {
         console.log("Balance not found for this user. Creating default balance")
         const newBalance = await prisma.balance.create({
            data: {
               user_id: userId,
               amount: 0
            }
         })
         return res.status(200).json({ amount: newBalance.amount })
      }

      console.log("Balance fetched successfully")
      res.status(200).json({ amount: balance.amount })
   } 
   catch (error) {
      console.error(`Failed to fetch balance: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

//topup buyer balance 
export const topupBalance = async (req: AuthRequest, res: Response) => {
   console.log("User is topping up balance...")
   const userId = req.user?.id
   const { amount } = req.body
   if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
   }
   if(typeof amount !== 'number' || amount <= 0) {
      return res.status(404).json({ message: "Invalid top-up amount" })
   }

   try {
      const existBalance = await prisma.balance.findUnique({ where: { user_id: userId } })
      let updatedBalance
      if(!existBalance) {
         console.log("Balance record not found. Creating one... ")
         updatedBalance = await prisma.balance.create({
            data: {
               user_id: userId,
               amount
            }
         })
      }
      else {
         updatedBalance = await prisma.balance.update({
            where: { user_id: userId },
            data: { amount: existBalance.amount.toNumber() + amount}
         })
      }

      await prisma.balance_History.create({
         data: {
            user_id: userId,
            amount,
            transaction_type: 'top-up'
         }
      })

      console.log("Top-up successful")
      res.status(200).json({ message: "Top-up successful", balance: updatedBalance})
   } 
   catch (error) {
      console.error(`top-up failed: ${error}`),
      res.status(500).json({ message: "Something went wrong" })
   }
}