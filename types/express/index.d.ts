import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload // Has to match the type that jwt.verify returns
    }
  }
}

export {};