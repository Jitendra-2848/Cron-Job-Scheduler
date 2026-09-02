import express from "express";
import {
    LoginService,
    RegisterService,
    RefreshService,
    LogoutService,
    MeService,
    UpdateProfileService,
    GoogleRedirectService,
    GoogleCallbackService
} from "../controller/Auth_Controller/Auth.js";
import { authenticateToken } from "../middlewares/TokenValidation.js";

const route = express.Router();

route.post("/login", LoginService);
route.post("/register", RegisterService);
route.post("/refresh", RefreshService);
route.post("/logout", LogoutService);
route.get("/google", GoogleRedirectService);
route.get("/google/callback", GoogleCallbackService);
route.get("/me", authenticateToken, MeService);
route.put("/me", authenticateToken, UpdateProfileService);
route.put("/profile", authenticateToken, UpdateProfileService);

export default route;
