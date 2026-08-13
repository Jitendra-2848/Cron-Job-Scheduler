import {config} from "dotenv";
config({path : ".env"});
import express from "express";
import { _init_db } from "./db/pool.js";
import router from "./routes/jobs.js";
const app = express();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

(async function database(){
    // console.log("DATABASE_URI exists:", !!process.env.DATABASE_URI);
    await _init_db();
})();

app.use("/",router)

app.listen(PORT,()=>{
    console.log("Server is running on port : " + PORT);
})