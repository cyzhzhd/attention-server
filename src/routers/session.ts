import socket from "socket.io";
import redis from "socket.io-redis";
import dotenv from "dotenv";

dotenv.config();
const REDIS_HOST = process.env.REDIS_HOST as string;
const REDIS_PORT = parseInt(process.env.REDIS_PORT as string);

export const setIoServer = function (server: import('http').Server) {
    const ioServer = socket(server);
    const adapter = redis({ host: REDIS_HOST, port: REDIS_PORT });
    ioServer.adapter(adapter);
}

export default setIoServer;