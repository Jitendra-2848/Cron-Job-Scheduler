import {config} from "dotenv";
config({path : ".env"});
import express from "express";
import { _init_db, pool } from "./db/pool.js";
import router from "./routes/jobs.js";
import cors from "cors";
// import queue from "./queue.ts";
const app = express();

app.use(cors({
    origin:"*"
}))


const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;



(async function database(){
    // console.log("DATABASE_URI exists:", !!process.env.DATABASE_URI);
    await _init_db();
    
})();
app.use(express.json());
app.use("/",router)

app.get("/data", async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM jobs");

        res.json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(PORT,()=>{
    console.log("Server is running on port : " + PORT);
})