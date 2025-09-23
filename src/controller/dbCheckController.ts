import type { Request, Response } from "express"
import { prisma } from "../prisma.js"
import chalk from "chalk"

export const roleTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching all role table from database"))
    try {
        const role = await prisma.roles.findMany({
            include: {
                users: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        })

        console.log(chalk.greenBright("Role Table Fetched Successfully"))
        res.status(200).json({ Message: "Role Table Fetched Successfully", role})
    } 
    catch (error) {
        console.error(chalk.red(`Failed To Fetch Role Profile: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const userTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching All User Table From Database..."))
    try {
        const user = await prisma.users.findMany({
            select: {
                username: true,
                email: true
            }
        })

        console.log(chalk.greenBright("User Table Fetched Successfully."))
        res.status(200).json({ Messgae: "User Table Fetched Successfully", user })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch user profile: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const profileTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching All Profile Table From Database..."))
    try {
        const profile = await prisma.profiles.findMany()

        console.log(chalk.greenBright("Profile Table Fetched Successfully."))
        res.status(200).json({ Message: "Profile Table Fetched Successfully.", profile })
    }
    catch (error) {
        console.error(chalk.red(`Failed to fetch profile table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const balanceTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching All Balance Table From Database..."))
    try {
        const balance = await prisma.balance.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        })

        console.log(chalk.cyan("Balance Table Fetched Successfully."))
        res.status(200).json({ Messgae: "Balance Table Fetched Successfully", balance })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch profile table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const balanceHistoryTabel = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching Balance History Tabel..."))
    try {
        const balance_history = await prisma.balance_History.findMany()

        console.log(chalk.greenBright("Balance_History Table Fetched Successfully."))
        res.status(200).json({ Message: "Balance_History Table Fetched Successfully", balance_history })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch balance_history table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const storeTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching All Store Table From Database..."))
    try {
        const store = await prisma.stores.findMany()
        console.log(chalk.greenBright("Store Table Fetched Successfully."))
        res.status(200).json({ Message: "Store Table Fetched Successfully", store })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch profile table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const categoryTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching All Category Table From Database..."))
    try {
        const category = await prisma.categories.findMany({
            include: {
                products: {
                    select: {
                        product_name: true,
                        stock: true
                    }
                }
            }
        })

        console.log(chalk.greenBright("Category Table Fetched Successfully"))
        res.status(200).json({ Message: "Category Table Fetched Successfully", category })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch category table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const productTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching Products Table From Database..."))
    try {
        const product = await prisma.products.findMany({
            select: {
                id: true,
                image: true,
                product_name: true,
                description: true,
                category: true,
                price: true,
                stock: true,
            },
        })

        console.log(chalk.greenBright("Products Table Fetched Successfully."))
        res.status(200).json({ Message: "Prouduct fetched successfully", product })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch products table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const cartTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching Products Table From Database..."))
    try {
        const cart = await prisma.carts.findMany()
        console.log(chalk.greenBright("Carts Table Fetched Successfully."))
        res.status(201).json({ Message: "Carts Table Fetched Successfully.", Cart: cart })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch cart table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const cartItemsTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching Cart_Items Table From Database..."))
    try {
        const cart_items = await prisma.cart_Items.findMany()
        console.log(chalk.greenBright("Cart_Items Table Fetched Successfully"))
        res.status(200).json({ Message: "Cart_Items Table Fetched Successfully", cart_items: cart_items })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch cart_items table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const transactionTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching Transactions Table From Database..."))
    try {
        const transactions = await prisma.transactions.findMany()
        console.log(chalk.greenBright("Transactions Table Fetched Successfully."))
        res.status(200).json({ Message: "Transactions Table Fetched Successfully.", Transaction: transactions })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch transactions table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const paymentTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching Payment Table From Database"))
    try {
        const payment = await prisma.payments.findMany()
        console.log(chalk.greenBright("Payment Table Fetched Successfully."))
        res.status(200).json({ Message: "Payment Table Fetched Successfully.", Payment: payment })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch payment table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const transactionDetailsTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching Transaction_Details Table From Database..."))
    try {
        const transaction_details = await prisma.transaction_Details.findMany()
        console.log(chalk.greenBright("Transaction_Details Fetched Successfully."))
        res.status(200).json({ Message: "Transaaction_Details Table Fetched Successfully.", Transaction_Details: transaction_details })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch transaction_details table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const storeConfirmationTable = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching Store_Confirmations Table From Database..."))
    try {
        const store_confirmations = await prisma.store_Confirmations.findMany()
        console.log(chalk.greenBright("Store_Confirmations Table Fetched Successfully"))
        res.status(200).json({ Message: "Store_Confirmations Table Fetched Successfully", Store_Confirmations: store_confirmations })
    } 
    catch (error) {
        console.error(chalk.red(`Failed to fetch store_confirmations table: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}