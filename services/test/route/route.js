const express = require("express");
const route = express.Router();
route.get("/get", (req, res) => {
    try {
        return res.status(200).json({ status: "success", method: "GET" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal error in get" });
    }
});

route.get("/get/:id", (req, res) => {
    try {
        return res.status(200).json({ 
            status: "success", 
            method: "GET BY ID", 
            id: req.params.id 
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal error in get by id" });
    }
});

route.delete("/delete", (req, res) => {
    try {
        return res.status(200).json({ status: "success", method: "DELETE" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal error in delete" });
    }
});

route.delete("/delete/:id", (req, res) => {
    try {
        return res.status(200).json({ 
            status: "success", 
            method: "DELETE BY ID", 
            deletedId: req.params.id 
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal error in delete by id" });
    }
});

route.post("/post", (req, res) => {
    try {
        return res.status(201).json({ 
            status: "success", 
            method: "POST", 
            bodyReceived: req.body 
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal error in post" });
    }
});

route.post("/update", (req, res) => {
    try {
        return res.status(200).json({ 
            status: "success", 
            method: "UPDATE", 
            bodyReceived: req.body 
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal error in update" });
    }
});

route.get("/fail", (req, res) => {
    return res.status(500).json({ 
        status: "error", 
        message: "Intentional 500 error to test BullMQ retries" 
    });
})

module.exports = route;