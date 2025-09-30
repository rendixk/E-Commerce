import type { Request, Response } from "express"
import { prisma } from "../prisma.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"
import chalk from "chalk"

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

export const getStoreDetail = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching store detail and its products..."))
    const { id } = req.params

    if(!id || isNaN(parseInt(id, 10))) {
        console.log(chalk.redBright("Invalid store ID provided."))
        return res.status(400).json({ message: "Invalid store ID provided." })
    }

    const store_id = parseInt(id, 10)

    try {
        const storeDetail = await prisma.stores.findUnique({
            where: { id: store_id },
            include: {
                products: {
                    select: {
                        id: true,
                        product_name: true,
                        price: true,
                        image: true,
                        stock: true
                    }
                }
            }
        })

        if(!storeDetail) {
            console.log(chalk.redBright("Store not found."))
            return res.status(404).json({ message: "Store not found." })
        }

        console.log(chalk.green("Store detail fetched successfully."))
        return res.status(200).json({ message: "Store detail fetched successfully", Store: storeDetail })
    } 
    catch (error) {
        console.error(chalk.red(`Error during fetching store detail: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const updateStore = async (req: AuthRequest, res: Response) => {
    const { owner_name, address } = req.body
    console.log(chalk.cyan("Editing Seller Store..."))
    const userId = req.user?.id
    const userRole = req.user?.role

    if(!userId || userRole !== 'seller') {
        console.log(chalk.red("Edit store failed: Unauthorized user or invalid role."))
        return res.status(403).json({ message: "Only sellers can edit their store" })
    }
     try {
        const store = await prisma.stores.update({
            where: { user_id: userId },
            data: {
                owner_name,
                address
            }
        })

        console.log(chalk.greenBright("Store updated successfully."))
        res.status(201).json({ message: "Store updated successfully.", Store: store })
     } 
     catch (error) {
        console.error(chalk.red(`Error during editing store: ${error}`))
        res.status(500).json({ message: "Something went wrong" })
     }
}