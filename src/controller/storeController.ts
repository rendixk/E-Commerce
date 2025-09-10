import type { Response } from "express"
import { prisma } from "../prisma.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"
import chalk from "chalk"

export const createStore = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Creating new store..."))
    const { store_name } = req.body
    const userId = req.user?.id
    const userRole = req.user?.role

    if(!userId || userRole !== 'seller') {
        console.log(chalk.red("Store creation failed: Unauthorized user or invalid role."))
        return res.status(403).json({ message: "Only sellers can create a store" })
    }

    if(!store_name) {
        console.log(chalk.red("Store creation failed: Store name is required."))
        return res.status(400).json({ message: "Store name is required" })
    }

    try {
        const existingStore = await prisma.stores.findFirst({
            where: { user_id: userId}
        })

        if(existingStore) {
            console.log(chalk.yellow("Store already exists for this seller."))
            return res.status(409).json({ message: "Store already exist for this seller" })
        }

        const newStore = await prisma.stores.create({
            data: {
                store_name,
                user_id: userId
            }
        })

        console.log(chalk.green("Store created successfully."))
        res.status(201).json(newStore)
    }
    catch (error) {
        console.error(chalk.red(`Error during store creation: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const getMyStore = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Fetching seller's store..."))
    const userId = req.user?.id
    const userRole = req.user?.role

    if(!userId || userRole !== 'seller') {
        console.log(chalk.red("Fetch store failed: Unauthorized user or invalid role."))
        return res.status(403).json({ message: "Only sellers can access their store" })
    }

    try {
        const stores = await prisma.stores.findFirst({
            where: { user_id: userId },
        })

        if(!stores) {
            console.log(chalk.yellow("No store found for this seller."))
            return res.status(404).json({ message: "Store not found for this seller" })
        }

        console.log(chalk.green("Store fetched successfully."))
        res.status(200).json(stores)
    } 
    catch (error) {
        console.error(chalk.red(`Error during fetching store: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}