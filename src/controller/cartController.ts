import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import type { AuthRequest } from '../middleware/authMiddleware.js'

// add product to cart 
export const addToCart = async (req: AuthRequest, res: Response) => {
   console.log("Adding to cart...")
   const { product_id, quantity } = req.body
   const userId = req.user?.id

   if(!userId || !product_id || !quantity) {
      return res.status(400).json({ message: "User ID, Product ID, and Quantity are requires" })
   }

   try {
      const cart = await prisma.carts.upsert({
         where: { user_id: userId },
         update: {},
         create: { user_id: userId }
      })

      const existingCartItem = await prisma.cart_Items.findFirst({
         where: {
            cart_id: cart.id,
            product_id: parseInt(product_id, 10)
         }
      })

      if (existingCartItem) {
         const updatedItem = await prisma.cart_Items.update({
            where: { id: existingCartItem.id },
            data: { quantity: existingCartItem.quantity + parseInt(quantity, 10)}
         })
         console.log("Item quantity updated in cart successfully")
         return res.status(200).json({ message: "Item quantity updated in cart", item: updatedItem })
      } 
      else {
         const newCartItem = await prisma.cart_Items.create({
            data: {
                cart_id: cart.id,
                product_id: parseInt(product_id, 10),
                quantity: parseInt(quantity, 10),
            },
        });
        console.log("Item added to cart successfully")
        return res.status(201).json({ message: "Item added to cart", item: newCartItem })
      }

   } 
   catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Something went wrong" });
   }
}

export const getCart = async (req: AuthRequest, res: Response) => {
   console.log("Getting user cart...")
   const userId = req.user?.id

   if(!userId) {
      return res.status(404).json({ message: "User ID is Required" })
   }

   try {
      const cart = await prisma.carts.findUnique({
         where: { user_id: userId },
         include: {
            cart_items: {
               include: {
                  product: true
               }
            }
         }
      })

      if(!cart) {
         return res.status(404).json({ message: "Cart not found for this user" })
      }

      console.log("User cart fetcehd successfully.")
      res.status(200).json({ message: "User cart fetched successfully", Cart: cart })
   } 
   catch (error) {
      console.error(`Error fetching cart: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const deleteCartItem = async (req: AuthRequest, res: Response) => {
   console.log("Deleting item from cart...")
   const userId = req.user?.id
   
   if(!userId) {
      return res.status(404).json({ message: "User ID is required" })
   }

   if (!req.params.id) {
      return res.status(400).json({ message: "Cart item ID is required" });
   }
   const cartItemId = parseInt(req.params.id, 10)


   try {
      const cart = await prisma.carts.findUnique({
         where: { user_id: userId },
         include: { cart_items: { where: { id: cartItemId } } },
      });

      if (!cart || cart.cart_items.length === 0) {
         return res.status(404).json({ message: "Cart item not found or does not belong to this user." });
      }

      await prisma.cart_Items.delete({
         where: { id: cartItemId },
      });

      console.log("Item deleted from cart successfully");
      res.status(200).json({ message: "Item deleted from cart." });
  } catch (error) {
      console.error("Error deleting cart item:", error);
      res.status(500).json({ message: "Something went wrong" });
  }
}