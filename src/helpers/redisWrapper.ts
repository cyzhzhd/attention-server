import redis from "redis";

export function del(collection: string | string[], redisClient: redis.RedisClient): Promise<number> {
    return new Promise((resolve) => {
        redisClient.del(collection, (err, reply) => {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        })
    })
}

export function hmget(collection: string, redisClient: redis.RedisClient,
    args: string | string[]): Promise<string[]> {
    return new Promise((resolve) => {
        redisClient.hmget(collection, args, (err, reply) => {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        })
    })
}

export function hgetall(collection: string, redisClient: redis.RedisClient,
): Promise<{ [key: string]: string } | undefined> {
    return new Promise((resolve) => {
        redisClient.hgetall(collection, (err, reply) => {
            if (err) {
                resolve(undefined);
            }
            resolve(reply);
        })
    })
}

export function hmset(collection: string, redisClient: redis.RedisClient,
    args: string | string[]): Promise<string> {
    return new Promise((resolve) => {
        redisClient.hmset(collection, args, (err, reply) => {
            if (err) {
                resolve("NOK");
            }
            resolve(reply);
        })
    })
}

export function hdel(collection: string, redisClient: redis.RedisClient,
    args: string | string[]): Promise<number> {
    return new Promise((resolve) => {
        redisClient.hdel(collection, args, (err, reply) => {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        })
    })
}

export function hvals(collection: string, redisClient: redis.RedisClient): Promise<string[]> {
    return new Promise((resolve) => {
        redisClient.hvals(collection, (err, reply) => {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        })
    })
}

export function sadd(collection: string, redisClient: redis.RedisClient,
    args: string): Promise<number> {
    return new Promise((resolve) => {
        redisClient.sadd(collection, args, (err, reply) => {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        })
    })
}

export function smembers(collection: string, redisClient: redis.RedisClient): Promise<string[]> {
    return new Promise((resolve) => {
        redisClient.smembers(collection, (err, reply) => {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        })
    })
}

export function srem(collection: string, redisClient: redis.RedisClient,
    args: string): Promise<number> {
    return new Promise((resolve) => {
        redisClient.srem(collection, args, (err, reply) => {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        })
    })
}

export function zadd(collection: string, redisClient: redis.RedisClient,
    args: (string | number)[]): Promise<number> {
    return new Promise((resolve) => {
        redisClient.zadd(collection, args, (err, reply) => {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        })
    })
}

export function zrem(collection: string, redisClient: redis.RedisClient,
    arg: (string | string[])): Promise<number> {
    return new Promise((resolve) => {
        redisClient.zrem(collection, arg, (err, reply) => {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        })
    })
}

export function zremrangebyscore(collection: string, redisClient: redis.RedisClient,
    min: number, max: number): Promise<number> {
    return new Promise((resolve) => {
        redisClient.zremrangebyscore(collection, min, max, (err, reply) => {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        })
    })
}

export function zrangebyscore(collection: string, redisClient: redis.RedisClient,
    min: number, max: number): Promise<string[]> {
    return new Promise((resolve) => {
        redisClient.zrangebyscore(collection, min, max, (err, reply) => {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        })
    })
}