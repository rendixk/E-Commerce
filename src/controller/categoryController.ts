import type { Request, Response } from "express"
import { prisma } from "../prisma.js"

export const createCategory = async (req: Request, res: Response) => {
   console.log("Creating new category...")
   const { category_name } = req.body

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
      console.error(`Error creating category: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const getAllCategories = async (req: Request, res: Response) => {
   console.log("Fetching all categories...")
   try {
      const categories = await prisma.categories.findMany()
      console.log("Categories fetched successfully...")
      res.status(200).json({ message: "Categories fetched successfully", Categories: categories })
   } 
   catch (error) {
      console.error(`Error fetching categories: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const updateCategory = async (req: Request, res: Response) => {
   console.log("Updating category...")
   const { category_name } = req.body
   if(!category_name) {
      return res.status(400).json({ message: "Category name is required." })
   }

   if(!req.params.id) {
      return res.status(400).json({ message: "Caegory ID is required" })
   }
   const categoryId = parseInt(req.params.id, 10)

   try {
      const updatedCategory = await prisma.categories.update({
         where: { id: categoryId },
         data: { category_name }
      })
      console.log("Category updated successfully.")
      res.status(200).json({ message: "Category updated successfully", Category: updatedCategory })
   } 
   catch (error) {
      console.error(`Error updating category: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const deleteCategory = async (req: Request, res: Response) => {
   console.log("Deleting category...")

   if(!req.params.id) {
      return res.status(400).json({ message: "Caegory ID is required" })
   }
   const categoryId = parseInt(req.params.id, 10)
   
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