import type { Request, Response } from 'express'
import { prisma } from '../prisma.js'
import chalk from 'chalk'

export const clearDatabase = async (req: Request, res: Response) => {
   console.log(chalk.cyan("Clearing all database tables based on schema..."))

   try {
      // Matikan pemeriksaan kunci asing sementara
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

      // Lakukan TRUNCATE pada setiap tabel secara terpisah
      await prisma.$executeRaw`TRUNCATE TABLE \`Payments\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Transaction_Details\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Balance_History\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Cart_Items\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Transactions\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Carts\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Products\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Categories\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Stores\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Balance\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Profiles\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Users\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`Roles\`;`;

      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;

      console.log(chalk.greenBright("All tables have been cleared and IDs have been reset."))
      res.status(200).json({ message: "All tables cleared successfully and ID sequences have been reset." });
   }
   catch (error) {
      console.error(chalk.redBright(`Error clearing database: ${error}`))
      res.status(500).json({ message: "Failed to clear database" })
   }
}