"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIoServer = void 0;
var socket_io_1 = __importDefault(require("socket.io"));
var socket_io_redis_1 = __importDefault(require("socket.io-redis"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var REDIS_HOST = process.env.REDIS_HOST;
var REDIS_PORT = parseInt(process.env.REDIS_PORT);
exports.setIoServer = function (server) {
    var ioServer = socket_io_1.default(server);
    ioServer.adapter(socket_io_redis_1.default({ host: REDIS_HOST, port: REDIS_PORT }));
};
exports.default = exports.setIoServer;
