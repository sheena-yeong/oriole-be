import { JwtPayload } from "jsonwebtoken";

// This is because Express's Request inferface does not include a user field
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number,
        email: string
      } // Has to match the type that jwt.verify returns
    }
  }
}

export {};