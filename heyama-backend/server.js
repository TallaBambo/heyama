const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const http = require("http");
const dns = require("dns");
const { Server } = require("socket.io");

process.on("uncaughtException", (err) => {
  process.exit(1);
});

const DB = process.env.DATABASE;

dns.setServers(["1.1.1.1", "8.8.8.8"]);

mongoose.connect(DB).then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.Allowed_Url,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ['websocket']
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.set("socketio", io);

server.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECIEVED. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated!");
  });
});
