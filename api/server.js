const express = require("express");
const router = require('./router');
const server = express();

server.use(express.json());

server.get('/', (req, res) => {
    res.send("node auth2 project");
})
server.use("/api", router);

module.exports = server;
