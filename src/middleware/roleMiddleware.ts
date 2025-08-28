import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './authMiddleware.js'

export const isSeller = (req: AuthRequest, res: Response, next: NextFunction) => {
   const userRole = req.user?.role

   if(userRole === "seller") {
      next()
   }
   else {
      res.status(403).json({ message: "Forbidden: You do not have the required presmisson." })
   }
}