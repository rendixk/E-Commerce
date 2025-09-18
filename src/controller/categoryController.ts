import type { Request, Response } from "express"
import { prisma } from "../prisma.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"
import chalk from "chalk"

export const createCategory = async (req: AuthRequest, res: Response) => {
   console.log(chalk.cyan("Creating new category..."))
   const { category_name } = req.body

   if(req.user?.role !== 'seller') {
      console.log(chalk.red("Forbidden: Only sellers can create categories."))
      return res.status(403).json({ message: "Forbidden: Only sellers can create categories." })
   }

   if(!category_name) {
      return res.status(400).json({ message: "Category name is required." })
   }

   try {
      const existingCategory = await prisma.categories.findUnique({
         where: { category_name: category_name }
      })
      if (existingCategory) {
         return res.status(409).json({ message: "Category name already exists." })
      }

      const newCategory = await prisma.categories.create({
         data: { category_name }
      })

      console.log("New category created successfully.")
      res.status(201).json({ message: "Category created successfully", Category: newCategory })
   }
   catch (error) {
      console.error(chalk.red(`Error creating category: ${error}`))
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const getAllCategories = async (req: Request, res: Response) => {
   console.log(chalk.cyan("Fetching all categories..."))
   try {
      const categories = await prisma.categories.findMany()
      console.log(chalk.greenBright("Categories fetched successfully..."))
      res.status(200).json({ message: "Categories fetched successfully", Categories: categories })
   } 
   catch (error) {
      console.error(chalk.red(`Error fetching categories: ${error}`))
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const updateCategory = async (req: AuthRequest, res: Response) => {
   console.log(chalk.cyan("Updating category..."))
   const { category_name } = req.body
   const { id } = req.params

   if(req.user?.role !== `seller`) {
      console.log(chalk.red("Forbidden: Only sellers can update categories."))
      return res.status(403).json({ message: "Forbidden: Only sellers can update categories." })
   }

   if(!id) {
      return res.status(400).json({ message: "Category ID is required." })
   }

   if(!category_name) {
      return res.status(400).json({ message: "Category name is required." })
   }

   const categoryId = parseInt(id, 10)
   if(!id || isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID provided." })
   }

   try {
      const updatedCategory = await prisma.categories.update({
         where: { id: categoryId },
         data: { category_name }
      })
      console.log("Category updated successfully.")
      res.status(200).json({ message: "Category updated successfully", Category: updatedCategory })
   } 
   catch (error) {
      console.error(chalk.red(`Error updating category: ${error}`))
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const deleteCategory = async (req: AuthRequest, res: Response) => {
   console.log(chalk.cyan("Deleting category..."))
   const { id } = req.params

   if(req.user?.role !== 'seller') {
      console.log(chalk.red("Forbidden: Only sellers can delete categories."))
      return res.status(403).json({ message: "Forbidden: Only sellers can delete categories." })
   }

   if(!id) {
      return res.status(400).json({ message: "Category name is required." })
   }

   const categoryId = parseInt(id, 10)
   if(!id || isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID provided." })
   }
   
   try {
      await prisma.categories.delete({
         where: { id: categoryId }
      })

      console.log("Category deleted successfully.")
      res.status(200).json({ message: "Category deleted successfully." })
   } 
   catch (error) {
      console.error(`Error deleting category`)
      res.status(500).json({ message: "Something went wrong" })
   }
}