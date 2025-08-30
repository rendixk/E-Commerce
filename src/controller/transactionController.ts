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
      // 1. Get user cart data
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

      // 2. calculate total price and check stock
      let total_price = 0
      const transaction_details_data = []
      const update_product_stock_promised = []

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

         //preparing promise for decrease product stock
         update_product_stock_promised.push(
            prisma.products.update({
               where: { id: product.id },
               data: { stock: { decrement: item.quantity } }
            })
         )
      }

      // 3. Check buyer balance
      const buyerBalance = await prisma.balance.findUnique({
         where: { user_id: userId }
      })
      if(!buyerBalance || buyerBalance.amount.toNumber() < total_price) {
         return res.status(404).json({ message: "Insufficient balance" })
      }

      // 4. create new transaction
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

      // 5. reduce user balance
      await prisma.balance.update({
         where: { user_id: userId },
         data: { amount: { decrement: total_price } }
      })

      // 6. Create balance history
      await prisma.balance_History.create({
         data: {
            user_id: userId,
            transaction_type: "debit",
            amount: total_price
         }
      })

      // 7. clear cart
      await prisma.cart_Items.deleteMany({
         where: { cart_id: cart.id }
      })

      // 8. decrease product stock
      await prisma.$transaction(update_product_stock_promised)

      console.log("Transaction created successfully.")
      res.status(201).json({ message: "Transaction successfully", Transaction: transaction })
   }
   catch (error) {
      console.error(`Error creating transaction: ${error}`)
      res.status(500).json({ message: "Something went wrong" })
   }
}

// function for confirm paymennt by seller
export const confirmTransaction = async (req: AuthRequest, res: Response) => {
   console.log("Confirming transaction...")
   const { transactionId } = req.body
   const userId = req.user?.id
   const userRole = req.user?.role

   if(!userId || userRole === 'seller' || !transactionId) {
      return res.status(403).json({ message: "Forbidden: You do not have the required permission" })
   }

   try {
      const transaction = await prisma.transactions.findUnique({
         where: { id: parseInt(transactionId) }
      })

      if(!transaction) {
         return res.status(404).json({ message: "Transaction not found" })
      }

      if(transaction.transaction_status === 'success') {
         return res.status(400).json({ message: "Transaction is already success" })
      }
   } 
   catch (error) {
      
   }
}