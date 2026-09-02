import type { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../../middlewares/TokenProvider.js";
import { pool } from "../../db/pool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest } from "../../middlewares/TokenValidation.js";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";

const isProduction = process.env.NODE_ENV === "production";

export const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
};

const RegisterService = async (req: Request, res: Response) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const userCheck = await pool.query(
            "SELECT id FROM users WHERE username = $1 OR (email = $2 AND email IS NOT NULL)",
            [username, email || ""]
        );
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: "Username or email is already taken" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            "INSERT INTO users (name, username, password, email) VALUES ($1, $2, $3, $4) RETURNING id, username, email, created_at",
            [username, username, hashedPassword, email || null]
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });
    } catch (error: any) {
        console.error("Register Error:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const LoginService = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, user.id]);

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error: any) {
        console.error("Login Error:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const RefreshService = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is missing" });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(refreshToken, JWT_SECRET);
        } catch {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        const result = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.userId]);
        if (result.rows.length === 0) {
            return res.status(403).json({ message: "User not found" });
        }

        const user = result.rows[0];
        if (user.refresh_token !== refreshToken) {
            await pool.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [user.id]);
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);
            return res.status(403).json({ message: "Session expired or token reused" });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [newRefreshToken, user.id]);

        res.cookie("accessToken", newAccessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", newRefreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Token refreshed successfully"
        });
    } catch (error: any) {
        console.error("Refresh Error:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const LogoutService = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await pool.query("UPDATE users SET refresh_token = NULL WHERE refresh_token = $1", [refreshToken]);
        }

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
        console.error("Logout Error:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const MeService = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await pool.query(
            "SELECT id, username, email, created_at FROM users WHERE id = $1",
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            user: result.rows[0]
        });
    } catch (error: any) {
        console.error("Me Error:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const UpdateProfileService = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { name, email, username } = req.body;
        const newUsername = username || name;

        const result = await pool.query(
            `UPDATE users 
             SET username = COALESCE($1, username),
                 email = COALESCE($2, email)
             WHERE id = $3
             RETURNING id, username, email, created_at`,
            [newUsername, email, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });
    } catch (error: any) {
        console.error("Update Profile Error:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const CLIENT_REDIRECT_URL = process.env.CLIENT_REDIRECT_URL || "http://localhost:5173/dashboard";

const GoogleRedirectService = async (req: Request, res: Response) => {
    try {
        const scopes = ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"];
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI || "")}&response_type=code&scope=${encodeURIComponent(scopes.join(" "))}&access_type=offline&prompt=consent`;
        return res.redirect(authUrl);
    } catch (error: any) {
        console.error("Google Redirect Error:", error.message);
        return res.status(500).json({ message: "Internal server error redirecting to Google" });
    }
};

const GoogleCallbackService = async (req: Request, res: Response) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ message: "Authorization code is missing" });
        }

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                code: code as string,
                client_id: GOOGLE_CLIENT_ID || "",
                client_secret: GOOGLE_CLIENT_SECRET || "",
                redirect_uri: GOOGLE_REDIRECT_URI || "",
                grant_type: "authorization_code"
            }).toString()
        });

        if (!tokenResponse.ok) {
            const tokenErr = await tokenResponse.text();
            console.error("Google Token Exchange Failed:", tokenErr);
            return res.status(400).json({ message: "Failed to exchange authorization code for tokens" });
        }

        const tokens = await tokenResponse.json() as any;
        const accessTokenGoogle = tokens.access_token;

        if (!accessTokenGoogle) {
            return res.status(400).json({ message: "Access token not returned by Google" });
        }

        const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessTokenGoogle}`
            }
        });

        if (!profileResponse.ok) {
            console.error("Google UserInfo Fetch Failed");
            return res.status(400).json({ message: "Failed to retrieve user profile from Google" });
        }

        const profile = await profileResponse.json() as any;
        const email = profile.email;
        const name = profile.name || profile.given_name || email?.split("@")[0] || "googleuser";

        if (!email) {
            return res.status(400).json({ message: "Email not provided by Google account" });
        }

        let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        let user: any;

        if (userResult.rows.length === 0) {
            const randomPassword = crypto.randomUUID();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            let username = name.replace(/\s+/g, "").toLowerCase();
            const checkUsername = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
            if (checkUsername.rows.length > 0) {
                username = `${username}_${Math.floor(Math.random() * 10000)}`;
            }

            const insertResult = await pool.query(
                "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
                [username, hashedPassword, email]
            );
            user = insertResult.rows[0];
        } else {
            user = userResult.rows[0];
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, user.id]);

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.redirect(CLIENT_REDIRECT_URL);
    } catch (error: any) {
        console.error("Google Callback Error:", error.message);
        return res.status(500).json({ message: "Internal server error during Google authentication", error: error.message });
    }
};

export { RegisterService, LoginService, RefreshService, LogoutService, MeService, UpdateProfileService, GoogleRedirectService, GoogleCallbackService };
