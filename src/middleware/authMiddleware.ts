import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_KEY as string

// Declare custom type for Express Request to be able to add 'user' property
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    console.log('Authentication failed: Token missing.')
    return res.status(401).json({ message: 'Authentication failed. No token provided.' })
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('Authentication failed: Invalid token.')
      return res.status(403).json({ message: 'Authentication failed. Invalid token.' })
    }
    
    req.user = user
    next()
  })
}