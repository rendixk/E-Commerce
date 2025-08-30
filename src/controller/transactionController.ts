import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import type { AuthRequest } from '../middleware/authMiddleware.js'

export const createTransaction = async (req: AuthRequest, res: Response) => {
   console.log("Creating new transaction...")
   const userId = req.user?.id

   if(!userId) {
      return res.status(404).json({ message: "User not authenticated" })
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

      if(!cart || cart.cart_items.length === 0) {
         return res.status(404).json({ message: "Cart is empty" })
      }

      let total_price = 0
      const transaction_details_data = []

      for (const item of cart.cart_items) {
         const product = item.product
         if (product.stock < item.quantity) {
            return res.status(404).json({ message: `Not enough stock for product: ${product.product_name}` })
         }
         total_price += product.price.toNumber() * item.quantity
         transaction_details_data.push({
            product_id: product.id,
            quantity: item.quantity,
            subtotal: product.price.toNumber() * item.quantity
         })
      }

      const transaction = await prisma.transactions.create({
         data: {
            user_id: userId,
            cart_id: cart.id,
            total_price: total_price,
            transaction_status: "pending",
            details: {
               createMany: {
                  data: transaction_details_data
               }
            }
         }
      })

      await prisma.cart_Items.deleteMany({
         where: { cart_id: cart.id }
      })

      console.log("Transaction created successfully.")
      res.status(201).json({ message: "Transaction successfully", Transaction: transaction })
   }
   catch (error) {
      console.error(`Error creating transaction: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

export const confirmTransaction = async (req: AuthRequest, res: Response) => {
   console.log("Confirming transaction...")
   const { transaction_id } = req.body
   const userId = req.user?.id
   const userRole = req.user?.role

   if(!userId || userRole !== 'seller' || !transaction_id) {
      return res.status(403).json({ message: "Forbidden: You do not have the required permission of seller." })
   }

   try {
      const transaction = await prisma.transactions.findUnique({
         where: { id: parseInt(transaction_id) },
         include: { details: true }
      })

      if(!transaction) {
         return res.status(404).json({ message: "Transaction not found" })
      }

      if(transaction.transaction_status !== 'pending') {
         return res.status(400).json({ message: "Transaction cannot be confirmed. Current status is not 'pending'." })
      }

      const buyerBalance = await prisma.balance.findUnique({
         where: { user_id: transaction.user_id },
      })

      if(!buyerBalance || buyerBalance.amount.toNumber() < transaction.total_price.toNumber()) {
         return res.status(400).json({ message: "Buyer has insufficient balance to complete this transaction" })
      }

      await prisma.balance.update({
         where: { user_id: transaction.user_id },
         data: { amount: { decrement: transaction.total_price.toNumber() } }
      })

      await prisma.balance_History.create({
         data: {
            user_id: transaction.user_id,
            transaction_type: 'debit',
            amount: transaction.total_price.toNumber()
         }
      })

      const update_product_stock = []
      for (const detail of transaction.details) {
         update_product_stock.push(
            prisma.products.update({
               where: { id: detail.product_id },
               data: { stock: { decrement: detail.quantity } }
            })
         )
      }

      await prisma.$transaction(update_product_stock)

      const updatedTransaction = await prisma.transactions.update({
         where: { id: parseInt(transaction_id)},
         data: { transaction_status: "success"}
      })

      console.log("Transaction confirmed successfully.")
      res.status(200).json({ message: "Transaction confirmed successfully", transaction: updatedTransaction })
   } 
   catch (error) {
      console.error(`Error confirming transaction: ${error}`);
        res.status(500).json({ message: "Something went wrong" });
   }
}