"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zrangebyscore = exports.zremrangebyscore = exports.zrem = exports.zadd = exports.srem = exports.smembers = exports.sadd = exports.hvals = exports.hdel = exports.hmset = exports.hgetall = exports.hmget = exports.del = void 0;
function del(collection, redisClient) {
    return new Promise(function (resolve) {
        redisClient.del(collection, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.del = del;
function hmget(collection, redisClient, args) {
    return new Promise(function (resolve) {
        redisClient.hmget(collection, args, function (err, reply) {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        });
    });
}
exports.hmget = hmget;
function hgetall(collection, redisClient) {
    return new Promise(function (resolve) {
        redisClient.hgetall(collection, function (err, reply) {
            if (err) {
                resolve(undefined);
            }
            resolve(reply);
        });
    });
}
exports.hgetall = hgetall;
function hmset(collection, redisClient, args) {
    return new Promise(function (resolve) {
        redisClient.hmset(collection, args, function (err, reply) {
            if (err) {
                resolve("NOK");
            }
            resolve(reply);
        });
    });
}
exports.hmset = hmset;
function hdel(collection, redisClient, args) {
    return new Promise(function (resolve) {
        redisClient.hdel(collection, args, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.hdel = hdel;
function hvals(collection, redisClient) {
    return new Promise(function (resolve) {
        redisClient.hvals(collection, function (err, reply) {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        });
    });
}
exports.hvals = hvals;
function sadd(collection, redisClient, args) {
    return new Promise(function (resolve) {
        redisClient.sadd(collection, args, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.sadd = sadd;
function smembers(collection, redisClient) {
    return new Promise(function (resolve) {
        redisClient.smembers(collection, function (err, reply) {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        });
    });
}
exports.smembers = smembers;
function srem(collection, redisClient, args) {
    return new Promise(function (resolve) {
        redisClient.srem(collection, args, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.srem = srem;
function zadd(collection, redisClient, args) {
    return new Promise(function (resolve) {
        redisClient.zadd(collection, args, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.zadd = zadd;
function zrem(collection, redisClient, arg) {
    return new Promise(function (resolve) {
        redisClient.zrem(collection, arg, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.zrem = zrem;
function zremrangebyscore(collection, redisClient, min, max) {
    return new Promise(function (resolve) {
        redisClient.zremrangebyscore(collection, min, max, function (err, reply) {
            if (err) {
                resolve(0);
            }
            resolve(reply);
        });
    });
}
exports.zremrangebyscore = zremrangebyscore;
function zrangebyscore(collection, redisClient, min, max) {
    return new Promise(function (resolve) {
        redisClient.zrangebyscore(collection, min, max, function (err, reply) {
            if (err) {
                resolve([]);
            }
            resolve(reply);
        });
    });
}
exports.zrangebyscore = zrangebyscore;
