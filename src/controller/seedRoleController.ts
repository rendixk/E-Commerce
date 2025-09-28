import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import chalk from 'chalk'

export const seedRole = async (req: Request, res: Response) => {
   console.log(chalk.cyan("Starting to seed role table..."))
   try {
      const existingRoles = await prisma.roles.findMany()
      if(existingRoles.length === 0) {
         await prisma.roles.createMany({
            data: [
               { role_name: "buyer" },
               { role_name: "seller" }
            ]
         })
         console.log(chalk.bold.greenBright("Roles table seeded successfully."))
      } 
      else {
         console.log(chalk.yellowBright("Roles table already has data. Skipping."))
      }
      res.status(201).json({ message: "Role seeding complete successfully." })
   } 
   catch (error) {
      console.error(`Error during database seeding: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const seedCategory = async (req: Request, res: Response) => {
   console.log(chalk.cyan("Starting to seed category table..."))
   try {
      const existingCategory = await prisma.categories.findMany()
      if(existingCategory.length === 0) {
         await prisma.categories.createMany({
            data: [
               { category_name: "Fashion" },
               { category_name: "Figure" },
               { category_name: "Toys" },
               { category_name: "Games" },
               { category_name: "accessories" }
            ],
            skipDuplicates: true
         })
         console.log(chalk.greenBright("Category table seeded successfully."))
      }
      else {
         console.log(chalk.yellowBright("Roles table already has data. Skipping."))
      }

      res.status(201).json({ message: "Role table seeding complete successfully" })
   } 
   catch (error) {
      console.error(`Error during database seeding: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}