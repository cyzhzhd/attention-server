import redis from "redis";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, '../../.env') });
const REDIS_CONNECTION_COLLECTION = process.env.REDIS_CONNECTION_COLLECTION as string;

export function zadd(redisClient: redis.RedisClient,
    args: (string | number)[]): Promise<number> {
    return new Promise((resolve) => {
        redisClient.zadd(REDIS_CONNECTION_COLLECTION, args, (err, reply) => {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        })
    })
}

export function zrem(redisClient: redis.RedisClient,
    arg: (string | string[])): Promise<number> {
    return new Promise((resolve) => {
        redisClient.zrem(REDIS_CONNECTION_COLLECTION, arg, (err, reply) => {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        })
    })
}

export function zrangebyscore(redisClient: redis.RedisClient,
    min: number, max: number): Promise<string[]> {
    return new Promise((resolve) => {
        redisClient.zrangebyscore(REDIS_CONNECTION_COLLECTION, min, max, (err, reply) => {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        })
    })
}