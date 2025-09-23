import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import chalk from "chalk";

// create product (only seller role)
export const createProduct = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Creating new product..."));
    const { product_name, description, price, stock, store_id, category_id } = req.body;
    const image = req.file?.path;
    
    if (req.user?.role !== 'seller') {
        console.log(chalk.red("Forbidden: Only sellers can create products."));
        return res.status(403).json({ message: "Forbidden: Only sellers can create products." });
    }

    if (!product_name || !price || !stock || !store_id || !category_id || !image) {
        return res.status(400).json({ message: "All required fields are missing" });
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

        console.log(chalk.greenBright("Product created successfully."))
        return res.status(201).json({ message: "Product created successfully", Product: newProduct });
    } catch (error) {
        console.error(chalk.red(`Failed to create product: ${error}`));
        return res.status(500).json({ message: "Something went wrong" });
    }
}

// get all product (public)
export const getAllProduct = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Fetching all products..."));
    try {
        const product = await prisma.products.findMany()
        console.log(chalk.greenBright(`Products fetched successfully.`))
        return res.status(200).json({ message: "Products fetched successfully", product });
    } catch (error) {
        console.error(chalk.red('Failed to fetch products:', error));
        return res.status(500).json({ message: 'Failed to fetch products.' });
    }
}

//get product by query (public)
export const searchProduct = async (req: Request, res: Response) => {
    console.log(chalk.cyan("Searching for products..."))
    const { q } = req.query

    if(!q) {
        console.log("Search query is missing")
        return res.status(400).json({ message: "Search query is missing." })
    }

    try {
        const query = q as string
        const products = await prisma.products.findMany({
            where: {
                product_name: {
                    contains: query
                }
            }
        })
        // Manually filter the products to be case-insensitive
        const caseInsensitiveProducts = products.filter(product => {
            return product.product_name.toLowerCase().includes(query.toLowerCase())
        })

        console.log(chalk.green(`Found ${caseInsensitiveProducts.length} products matching the query.`))
        res.status(200).json(products)
    } 
    catch (error) {
        console.error(`Error when search for product: ${error}`)
        res.status(500).json({ message: "Something went wrong" })
    }
}

// get product by ID (public)
export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ message: "Invalid product ID provided." });
    }
    const productId = parseInt(id, 10);
    console.log(chalk.cyan(`Fetching product by ID: ${productId}`));

    try {
        const product = await prisma.products.findUnique({
            where: { id: productId }
        });

        if (!product) {
            console.log(chalk.yellow('Product not found.'));
            return res.status(404).json({ message: 'Product not found.' });
        }

        console.log('Product fetched successfully.');
        return res.status(200).json({ message: "Product fetched by ID successfully", Product: product });
    } catch (error) {
        console.error(chalk.red('Failed to fetch product:', error));
        return res.status(500).json({ message: 'Failed to fetch product.' });
    }
}

// update product (only seller role)
export const updateProduct = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Updating product..."));
    const { id } = req.params;
    const { product_name, description, price, stock, store_id, category_id } = req.body;
    const image = req.file?.path;

    if (req.user?.role !== 'seller') {
        console.log(chalk.red("Forbidden: Only sellers can update products."));
        return res.status(403).json({ message: "Forbidden: Only sellers can update products." });
    }

    if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ message: "Invalid product ID provided." });
    }
    const productId = parseInt(id, 10);

    try {
        const existingProduct = await prisma.products.findUnique({
            where: { id: productId },
        });

        if (!existingProduct) {
            console.log(chalk.yellow('Update failed: Product not found.'));
            return res.status(404).json({ message: 'Product not found. Cannot update.' });
        }
        
        const updateData: any = {};
        if (product_name) updateData.product_name = product_name;
        if (description) updateData.description = description;
        if (price) updateData.price = parseFloat(price);
        if (stock) updateData.stock = parseInt(stock, 10);
        if (image) updateData.image = image;
        
        if (store_id) {
            updateData.store = { connect: { id: parseInt(store_id, 10) } };
        }
        
        if (category_id) {
            updateData.category = { connect: { id: parseInt(category_id, 10) } };
        }

        const updatedProduct = await prisma.products.update({
            where: { id: productId },
            data: updateData,
        });

        console.log('Product updated successfully.');
        return res.status(200).json({ message: "Product updated successfully", Product: updatedProduct });
    } catch (error) {
        console.error(chalk.red('Failed to update product:', error));
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

// delete product (only seller role)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
    console.log(chalk.cyan("Deleting product..."))
    const { id } = req.params

    if (req.user?.role !== 'seller') {
        console.log(chalk.red("Forbidden: Only sellers can delete products."))
        return res.status(403).json({ message: "Forbidden: Only sellers can delete products." })
    }

    if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ message: "Invalid product ID provided." })
    }
    const productId = parseInt(id, 10);

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
        return res.status(200).json({ message: 'Product deleted successfully.' })
    } catch (error) {
        console.error(chalk.red('Failed to delete product:', error))
        return res.status(500).json({ message: 'Failed to delete product.' })
    }
}