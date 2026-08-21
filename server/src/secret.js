"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = void 0;
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: "../.env" });
var bullmq_1 = require("bullmq");
var ioredis_1 = require("ioredis");
// import { queue } from "./queue.js";
var redis_url = process.env.REDIS_URI;
if (!redis_url) {
    throw new Error("REDIS_URI is not defined");
}
var connection = new ioredis_1.default(redis_url, {
    maxRetriesPerRequest: null,
});
exports.queue = new bullmq_1.Queue("POST", {
    connection: connection,
});
// const queue = new Queue("myQueue", {
//     connection,
// });
// await queue.add("myQueue", {
//     name: "running at super light speed! : 1",
// });
// await queue.add("myQueue", {
//     name: "running at super light speed! : 2",
// });
// await queue.add("myQueue", {
//     name: "running at super light speed! : 3",
// });
// await queue.add("myQueue", {
//     name: "running at super light speed! : 4",
// });
for (var i = 0; i < 1; i++) {
    await exports.queue.add("POST", {
        name: "Jitendra",
        url: "https://dummyjson.com/products",
        // payload: {
        //     title: "My first post",
        //     body: "Hello from JavaScript",
        //     userId: i == 9 ? "jdsfjd" : i
        // },
        retries: "3"
    });
}
