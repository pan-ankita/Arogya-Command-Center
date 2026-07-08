import type { Server } from "socket.io";

let io: Server;

export function setIO(server: Server) {
  io = server;
}

export function getIO() {
  return io;
}