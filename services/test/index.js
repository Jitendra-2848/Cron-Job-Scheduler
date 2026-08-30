const express = require("express");
const  route  = require("./route/route");
const app = express();

app.use("/",route);

app.listen(9000,()=>{
    console.log("working on 9000");
})