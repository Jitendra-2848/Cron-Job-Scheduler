import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";

export interface UserPayload {
    userId: number;
    username: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

export type AuthenticatedRequest = Request;

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    const token =
        req.cookies?.accessToken ||
        (authHeader ? authHeader.split(" ")[1] : undefined);

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized user",
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

        req.user = decoded;

        next();
    } catch (error) {
        console.error("JWT verification failed:", error);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};
