import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import chalk from 'chalk'

export const seedDatabase = async (req: Request, res: Response) => {
   console.log(chalk.cyan("Starting database seeding process..."))
   try {
      const existingRoles = await prisma.roles.findMany()
      if(existingRoles.length === 0) {
         await prisma.roles.createMany({
            data: [
               { role_name: "buyer" },
               { role_name: "seller" }
            ]
         })
         console.log(chalk.bold.green("Roles table seeded successfully."))
      } 
      else {
         console.log("Roles table already has data. Skipping.")
      }
      res.status(201).json({ message: "Database seeding complete successfully." })
   } 
   catch (error) {
      console.error(`Error during database seeding: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}