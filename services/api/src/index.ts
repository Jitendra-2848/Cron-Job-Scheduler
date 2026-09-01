import "./config/env.js";
import express from "express";
import { _init_db, pool } from "./db/pool.js";
import router from "./routes/jobs.js";
import authRouter from "./routes/Auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/", router);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

(async function database(){
    await _init_db();
})();

app.listen(PORT, () => {
    console.log("Server is running on port : " + PORT);
});
