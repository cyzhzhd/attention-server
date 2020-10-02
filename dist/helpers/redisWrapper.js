"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zrangebyscore = exports.zremrangebyscore = exports.zrem = exports.zadd = void 0;
var path_1 = __importDefault(require("path"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
var REDIS_CONNECTION_COLLECTION = process.env.REDIS_CONNECTION_COLLECTION;
function zadd(redisClient, args) {
    return new Promise(function (resolve) {
        redisClient.zadd(REDIS_CONNECTION_COLLECTION, args, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.zadd = zadd;
function zrem(redisClient, arg) {
    return new Promise(function (resolve) {
        redisClient.zrem(REDIS_CONNECTION_COLLECTION, arg, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.zrem = zrem;
function zremrangebyscore(redisClient, min, max) {
    return new Promise(function (resolve) {
        redisClient.zremrangebyscore(REDIS_CONNECTION_COLLECTION, min, max, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.zremrangebyscore = zremrangebyscore;
function zrangebyscore(redisClient, min, max) {
    return new Promise(function (resolve) {
        redisClient.zrangebyscore(REDIS_CONNECTION_COLLECTION, min, max, function (err, reply) {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        });
    });
}
exports.zrangebyscore = zrangebyscore;
