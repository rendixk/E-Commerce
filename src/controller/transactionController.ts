import type { Response } from 'express'
import { prisma } from '../prisma.js'
import type { AuthRequest } from '../middleware/authMiddleware.js'
import chalk from 'chalk'

type TransactionDetailData = {
    product_id: number;
    quantity: number;
    subtotal: number;
}

export const createTransaction = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Creating new transaction..."))
    const userId = req.user?.id

    if(!userId) {
        console.log(chalk.red("User not authorized"))
        return res.status(404).json({ message: "User not authorized" })
    }

    try {
        const [buyerBalance, cart] = await prisma.$transaction([
            prisma.balance.findUnique({ where: { user_id: userId } }),
            prisma.carts.findUnique({
                where: { user_id: userId },
                include: {
                    cart_items: {
                        include: {
                            product: true
                        }
                    }
                }
            })
        ])

        if (!cart || cart.cart_items.length === 0) {
            console.log(chalk.red("Cart is empty"))
            return res.status(404).json({ message: "Cart is empty" })
        }

        let total_price = 0
        const transaction_details_data: TransactionDetailData[] = []

        for (const item of cart.cart_items) {
            const product = item.product
            if(product.stock < item.quantity) {
                console.log(chalk.red(`Not enough stock for product: ${product.product_name}`))
                return res.status(400).json({ message: `Not enough stock for product: ${product.product_name}` })
            }
            total_price += product.price.toNumber() * item.quantity
            transaction_details_data.push({
                product_id: product.id,
                quantity: item.quantity,
                subtotal: product.price.toNumber() * item.quantity
            })
        }

        if(!buyerBalance || buyerBalance.amount.toNumber() < total_price ) {
            console.log(chalk.red("Insufficient balance to complete this transaction."))
            return res.status(400).json({ message: "Insufficient balance to complete this transaction." })
        }

        await prisma.$transaction(async (prisma) => {
            //decrease buyer amount
            await prisma.balance.update({
                where: { user_id: userId },
                data: { amount : { decrement: total_price }}
            })

            await prisma.balance_History.create({
                data: {
                    user_id: userId,
                    transaction_type: 'debit',
                    amount: total_price
                }
            })

            const transaction = await prisma.transactions.create({
                data: {
                    user_id: userId,
                    cart_id: cart.id,
                    total_price: total_price,
                    details: {
                        createMany: {
                            data: transaction_details_data
                        }
                    }
                }
            })

            await prisma.payments.create({
                data: {
                    payment_method: 'Balance',
                    payment_amount: total_price,
                    payment_status: 'completed',
                    transaction_id: transaction.id
                }
            })

            console.log(chalk.green("Transaction created successfully."))
            res.status(200).json(transaction)
        })
    } 
    catch (error) {
        console.error(chalk.red(`Error creating transaction: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const confirmTransaction = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Confirming transaction..."))
    const { transaction_id } = req.body
    const userId = req.user?.id
    const userRole = req.user?.role

    if(!userId || userRole !== 'seller' || !transaction_id) {
        console.log(chalk.red("Forbidden: You do not have the required permission of seller."))
        return res.status(400).json({ message: "Forbidden: You do not have the required permission of seller." })
    }

    try {
        const transaction = await prisma.transactions.findUnique({
            where: { id: parseInt(transaction_id) },
            include: {
                details: {
                    include: {
                        product: {
                            include: {
                                store: true
                            }
                        }
                    }
                },
                user: true
            }
        })
        if(!transaction) {
            console.log(chalk.red("Transaction not found"))
            return res.status(404).json({ message: "Transaction not found" })
        }

        if(transaction.transaction_status !== 'pending') {
            console.log(chalk.red("Transaction details are missing."))
            return res.status(400).json({ message: "Transaction cannot be confirmed. Current status is not 'pending'." })
        }

        if(transaction.details.length === 0) {
            console.log(chalk.red("Transaction details are missing."))
            return res.status(400).json({ message: "Transaction details are missing." })
        }

        const firstProduct = transaction.details[0]?.product
        if(!firstProduct || !firstProduct.store) {
            console.log(chalk.red("Product or seller information is missing."))
            return res.status(404).json({ message: "Product or seller information is missing." });
        }

        const sellerId = firstProduct.store.user_id
        if(sellerId !== userId) {
            console.log(chalk.red("You are not authorized to confirm this transaction."))
            return res.status(403).json({ message: "You are not authorized to confirm this transaction." })
        }

        await prisma.$transaction(async (prisma) => {
            //add seller amount
            await prisma.balance.update({
                where: { user_id: sellerId },
                data: { amount: { increment: transaction.total_price.toNumber() } }
            })

            await prisma.balance_History.create({
                data: {
                    user_id: userId,
                    transaction_type: 'credit',
                    amount: transaction.total_price.toNumber()
                }
            })

            //Decrease produck stock
            for (const detail of transaction.details) {
                await prisma.products.update({
                    where: { id: detail.product_id },
                    data: { stock: { decrement: detail.quantity } }
                })
            }

            // Update transaction status
            const updatedTransaction = await prisma.transactions.update({
                where: { id: parseInt(transaction_id) },
                data: { transaction_status: "success" }
            })

            await prisma.store_Confirmations.create({
                data: {
                    confirmation_status: 'confirmed',
                    transaction_id: updatedTransaction.id,
                    user_id: userId
                }
            })

            console.log(chalk.green("Transaction confirmed successfully."))
            res.status(200).json(updatedTransaction)
        })
    }
    catch (error) {
        console.error(chalk.red(`Error confirming transaction: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const directTransaction = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Creating direct transaction from product page..."))
    const userId = req.user?.id
    const { product_id, quantity } = req.body
    
    if(!userId) {
        console.log(chalk.redBright("User not authorized"))
        return res.status(404).json({ message: "User not authorized" })
    }
    if(!product_id || !quantity) {
        console.log(chalk.redBright("Product ID and quantity are required."))
        return res.status(400).json({ message: "Product ID and quantity are required." })
    }

    try {
        const product = await prisma.products.findUnique({ where: { id: product_id } })
        if(!product) {
            console.log(chalk.redBright("Product Not Found"))
            return res.status(404).json({ message: "Product Not Found" })
        }
        if(product.stock < quantity) {
            console.log(chalk.redBright("Not Enough Product Stock"))
            return res.status(400).json({ message: `Not enough stock for product: ${product.product_name}.` })
        }

        const buyerBalance = await prisma.balance.findUnique({ where: { user_id: userId } })
        const totalPrice = product.price.toNumber() * quantity

        if (!buyerBalance || buyerBalance.amount.toNumber() < totalPrice) {
            console.log(chalk.redBright("Insufficient balance to complete this transaction."))
            return res.status(400).json({ message: "Insufficient balance to complete this transaction." })
        }

        await prisma.$transaction(async (prisma) => {
            //decrease buyer amount
            await prisma.balance.update({
                where: { user_id: userId },
                data: { amount: { decrement: totalPrice } }
            })

            await prisma.balance_History.create({
                data: {
                    user_id: userId,
                    transaction_type: 'debit',
                    amount: totalPrice
                }
            })

            const transaction = await prisma.transactions.create({
                data: {
                    user_id: userId,
                    total_price: totalPrice,
                    transaction_status: 'pending',
                    details: {
                        create: {
                            product_id: product.id,
                            quantity: quantity,
                            subtotal: totalPrice
                        }
                    }
                }
            })

            await prisma.payments.create({
                data: {
                    payment_method: 'balance',
                    payment_amount: totalPrice,
                    payment_status: 'completed',
                    transaction_id: transaction.id
                }
            })

            console.log(chalk.green("Direct transaction created successfully."))
            res.status(201).json({ message: "Transaction successful.", transaction: transaction })
        })
    }
    catch (error) {
        console.error(chalk.red(`Error creating direct transaction: ${error}`))
        res.status(500).json({ message: "Something went wrong." })
    }
}

export const cancelTransactionSeller = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Canceling A Transaction"))
    const { transaction_id } = req.body
    const userId = req.user?.id
    const userRole = req.user?.role

    if (!userId || userRole !== 'seller' || !transaction_id) {
        console.log(chalk.redBright("Only sellers can cancel transactions."))
        return res.status(403).json({ message: "Forbidden: Only sellers can cancel transactions." });
    }

    try {
        const transaction = await prisma.transactions.findUnique({
            where: { id: parseInt(transaction_id) },
            include: {
                user: true,
                details: {
                    include: {
                        product: {
                            include: {
                                store: true
                            }
                        }
                    }
                }
            }
        })

        if(!transaction) {
            console.log(chalk.redBright("Transaction Not Found"))
            return res.status(404).json({ message: "Transaction not found." })
        }

        if (transaction.transaction_status !== 'pending') {
            console.log(chalk.redBright(`Transaction cannot be canceled. Current status is '${transaction.transaction_status}'.`))
            return res.status(400).json({ message: `Transaction cannot be canceled. Current status is '${transaction.transaction_status}'.` })
        }

        const firstProduct = transaction.details[0]?.product
        if (!firstProduct || firstProduct.store?.user_id !== userId) {
            console.log(chalk.redBright("You are not authorized to cancel this transaction."))
            return res.status(403).json({ message: "You are not authorized to cancel this transaction." })
        }

        await prisma.$transaction(async (prisma) => {
            await prisma.balance.update({
                where: { user_id: transaction.user_id },
                data: { amount: { increment: transaction.total_price.toNumber() } }
            })

            await prisma.balance_History.create({
                data: {
                    user_id: transaction.user_id,
                    transaction_type: 'refund',
                    amount: transaction.total_price.toNumber()
                }
            })

            const canceledTransaction = await prisma.transactions.update({
                where: { id: parseInt(transaction_id) },
                data: { transaction_status: 'canceled' }
            })

            console.log(chalk.greenBright("Transaction successfully canceled."))
            res.status(200).json({ message: "Transaction successfully canceled", transaction: canceledTransaction })
        })
    } 
    catch (error) {
        console.error(chalk.red(`Error canceling transaction: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const transactionHistory = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Fetching transaction history..."))
    const userId = req.user?.id
    const userRole = req.user?.role

    if(!userId || !userRole) {
        console.log(chalk.red("Unauthorized."))
        return res.status(401).json({ message: "Unauthorized." })
    }

    try {
        let transaction

        if(userRole === 'buyer') {
            console.log(chalk.green(`Buyer with ID ${userId} is fetching their store's transaction history.`))
            transaction = await prisma.transactions.findMany({
                where: { user_id: userId },
                include: {
                    details: {
                        include: {
                            product: true
                        },
                    },
                    cart: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
        }

        else if (userRole === 'seller') {
            console.log(chalk.green(`Seller with ID ${userId} is fetching their store's transaction history.`))
            const store = await prisma.stores.findFirst({
                where: { user_id: userId }
            })

            if(!store) {
                console.log(chalk.red("Store not found for this seller"))
                return res.status(404).json({ message: "Store not found for this seller" })
            }

            transaction = await prisma.transactions.findMany({
                where: { 
                    details: {
                        some: {
                            product: {
                                store_id: store.id
                            },
                        },
                    },
                },
                include: {
                    details: {
                        include: {
                            product: true
                        },
                    },
                    user: {
                        select: {
                            username: true,
                            email: true
                        },
                    },
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
        }

        else {
            console.log(chalk.red("Forbidden: Invalid user role."))
            return res.status(403).json({ message: "Forbidden: Invalid user role." })
        }

        console.log(chalk.green("Transaction history fetched successfully."))
        res.status(200).json({ Transaction: transaction })
    } 
    catch (error) {
        console.error(chalk.red(`Error fetching transaction history: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}