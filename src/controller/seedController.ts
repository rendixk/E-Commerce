import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'

export const seedDatabase = async (req: Request, res: Response) => {
   console.log("Starting database seeding process...")
   try {
      const existingRoles = await prisma.roles.findMany()
      if(existingRoles.length === 0) {
         await prisma.roles.createMany({
            data: [
               { role_name: "buyer" },
               { role_name: "seller" }
            ]
         })
         console.log("Roles table seeded successfully.")
      } 
      else {
         console.log("Roles table already has data. Skipping.")
      }

      const existingCategories = await prisma.categories.findMany()
      if(existingCategories.length === 0) {
         await prisma.categories.createMany({
            data: [
               { category_name: "electronics" },
               { category_name: "anime" }
            ]
         })
         console.log("Categories table seeded successfully")
      }
      else {
         console.log("Categories table already has data. Skipping,")
      }

      res.status(201).json({ message: "Database seeding complete successfully." })
   } 
   catch (error) {
      console.error(`Error during database seeding: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}