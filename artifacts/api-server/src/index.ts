import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import http from "http";
import { Server } from "socket.io";
import { setIO } from "./lib/socket";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
setIO(io);

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});