import type { Request, Response } from "express"
import { prisma } from "../prisma.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"

//create product (only seller role)
export const createProduct = async (req: AuthRequest, res: Response) => {
   console.log(("Creating new product"))
   const { product_name,description, price, stock, store_id, category_id } = req.body
   const image = req.file?.path

   if(!product_name || !price || !stock || !image) {
      return res.status(400).json({ message: "All required fields are missing" })
   }

   try {
      const newProduct = await prisma.products.create({
         data: {
            product_name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            image,
            store_id: parseInt(store_id, 10),
            category_id: parseInt(category_id, 10),
         }
      })

      console.log("Product created successfully")
      res.status(201).json({ message: "Product created successfully", Product: newProduct })
   }
   catch (error) {
      console.error(`Failed to create product: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const getAllProduct = async (req: Request, res: Response) => {
   console.log("Fetching All Product...")
   try {
      const product = await prisma.products.findMany()
      console.log(`Product fetched successful...`)
      res.status(200).json({ message: "Product fetched successfully", product })
   } 
   catch (error) {
      console.error('Failed to fetch products:', error);
      res.status(500).json({ message: 'Failed to fetch products.' });
   }
}

export const getProductById = async (req: Request, res: Response) => {
   const id = req.params.id
   if(!id) {
      return res.status(404).json({ message: "Product id required" })
   }

   const productId = parseInt(id, 10)
   console.log(`Fetching product by id: ${productId}`)

   try {
      const product = await prisma.products.findUnique({
         where: { id: productId}
      })

      if (!product) {
         console.log('Product not found.');
         return res.status(404).json({ message: 'Product not found.' });
      }

      console.log('Product fetched successfully.');
      res.status(200).json({ message: "Product fetched by id successfully",productId });
   } 
   catch (error) {
      console.error('Failed to fetch product:', error);
      res.status(500).json({ message: 'Failed to fetch product.' });
   }
}

//update product (only seller role)
export const updateProduct = async (req: AuthRequest, res: Response) => {
   const id = req.params.id

   if (!id) {
      return res.status(400).json({ message: "Product ID is required." })
   }

   const productId = parseInt(id, 10)
   console.log(`Updating product with ID: ${productId}`)
   const { product_name, description, price, stock, store_id, category_id } = req.body
   const image = req.file?.path

   try {
      const existingProduct = await prisma.products.findUnique({
         where: { id: productId },
      });

      if (!existingProduct) {
         console.log('Update failed: Product not found.')
         return res.status(404).json({ message: 'Product not found. Cannot update.' })
      }

      const updateData: any = {};
      if (product_name) updateData.product_name = product_name
      if (description) updateData.description = description
      if (price) updateData.price = parseFloat(price)
      if (stock) updateData.stock = parseInt(stock, 10)
      if (image) updateData.image = image
      
      if (store_id) {
         updateData.store = { connect: { id: parseInt(store_id, 10) } }
      }
      
      if (category_id) {
         updateData.category = { connect: { id: parseInt(category_id, 10) } }
      }

      const updatedProduct = await prisma.products.update({
         where: { id: productId },
         data: updateData,
      });

      console.log('Product updated successfully.')
      res.status(200).json(updatedProduct)
   } catch (error) {
      console.error('Failed to update product:', error)
      res.status(500).json({ message: 'Something went wrong' })
   }
}

export const deleteProduct = async (req: AuthRequest, res: Response) => {
   const id = req.params.id
   if (!id) {
      return res.status(400).json({ message: "Product ID is required." })
   }
   const productId = parseInt(id, 10)
   console.log(`Deleting product with ID: ${productId}`)
   
   try {
      const product = await prisma.products.findUnique({
         where: { id: productId },
      });

      if (!product) {
         return res.status(404).json({ message: 'Product not found.' })
      }
      
      await prisma.products.delete({
         where: { id: productId },
      });

      console.log('Product deleted successfully.')
      res.status(200).json({ message: 'Product deleted successfully.' })
   } catch (error) {
      console.error('Failed to delete product:', error)
      res.status(500).json({ message: 'Failed to delete product.' })
   }
};