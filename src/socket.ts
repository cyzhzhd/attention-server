import io from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import assert from "assert";
import path from "path";
import redis from "redis";
import * as socketData from "./types/socketData";
import * as redisWrapper from "./helpers/redisWrapper";
import { authSessionConnection } from './helpers/authSocket'
import socketRedis, { RedisAdapter } from "socket.io-redis";
import { classSessionModel } from "./models/classSessionModel";
import { chatModel } from "./models/chatModel";

dotenv.config({ path: path.join(__dirname, '../.env') });
const REDIS_HOST = process.env.REDIS_HOST as string;
const REDIS_PORT = parseInt(process.env.REDIS_PORT as string);

const redisClient = redis.createClient({ host: REDIS_HOST, port: REDIS_PORT });

const ClassSession = mongoose.model('ClassSession', classSessionModel);
const Chat = mongoose.model('Chat', chatModel);

function checkData(data: (socketData.ContentData | socketData.Data),
    checkList: Array<string>): boolean {
    for (const check of checkList) {
        if (!(check in data)) {
            return false;
        }
    }
    return true;
}

export const setIoServer = function (server: import('http').Server): void {
    const ioServer = io(server, { transports: ['websocket'] });
    const _adapter = socketRedis({ host: REDIS_HOST, port: REDIS_PORT });
    ioServer.adapter(_adapter);
    const adapter = ioServer.of('/').adapter as RedisAdapter;

    // Disconnection checker + handler
    setInterval(async () => {
        try {
            const curTime = Date.now();

            // get old connections
            const disconnections = await redisWrapper.zrangebyscore(
                redisClient, 0, curTime - 15000);

            // delete from redis
            await redisWrapper.zremrangebyscore(redisClient, 0, curTime - 15000);

            // iterate all disconnected user
            for (const disconnection of disconnections) {
                const [session, user, socket] = disconnection.split(':');

                // remove from mongodb
                // TODO batch job within same session
                const updatedClassSession = await ClassSession.findOneAndUpdate(
                    {
                        _id: session,
                        status: "online",
                    },
                    {
                        $pull: {
                            userList: { user: user }
                        }
                    },
                    { new: true }
                );

                if (updatedClassSession) {
                    // emit new userlist
                    const userList = updatedClassSession.toJSON().userList;
                    ioServer.to(session).emit('sendUserList', userList);

                    // users received deliverDisconnection has to send leaveSession event
                    ioServer.to(user).emit('deliverDisconnection');

                    // leave socket room
                    [session, user].forEach((room) => {
                        adapter.remoteLeave(socket, room, () => { return; })
                    });
                }
            }
        } catch (err) {
            console.log(err); // TODO log error
        }
    }, 10000);


    ioServer.on("connection", (socket) => {
        // TODO prevent joining multiple session
        socket.on('joinSession', async (data: socketData.Data) => {
            try {
                if (!checkData(data, ['token', 'class', 'session'])) {
                    throw new Error();
                };
                const { payload, isHost } = await authSessionConnection(data);

                // Check user if already connected
                const updatedClassSession = await ClassSession.findOneAndUpdate(
                    {
                        _id: data.session,
                        status: "online",
                        "userList.user": {
                            $nin: payload._id
                        }
                    },
                    {
                        $addToSet: {
                            userList: {
                                user: payload._id,
                                socket: socket.id,
                                name: payload.name,
                                isTeacher: isHost,
                                isSharingScreen: false
                            }
                        }
                    },
                    { new: true }
                );
                assert(updatedClassSession);

                // add to redis connection manager
                const redisArgs = [Date.now(), [data.session, payload._id, socket.id].join(':')];
                await redisWrapper.zadd(redisClient, redisArgs);

                socket.join(payload._id);
                socket.join(data.session);

                const userList = updatedClassSession.toJSON().userList;
                ioServer.to(data.session).emit('sendUserList', userList);
            } catch (err) {
                ioServer.to(socket.id).emit('error');
                return;
            }
        })

        socket.on('leaveSession', async (data: socketData.Data) => {
            try {
                if (!checkData(data, ['token', 'class', 'session'])) {
                    throw new Error();
                };
                const { payload } = await authSessionConnection(data);
                const updatedClassSession = await ClassSession.findOneAndUpdate(
                    {
                        _id: data.session,
                        status: "online",
                    },
                    {
                        $pull: {
                            userList: { user: payload._id }
                        }
                    },
                    { new: true }
                );
                assert(updatedClassSession);

                // remove from redis connection manager
                await redisWrapper.zrem(redisClient,
                    [data.session, payload._id, socket.id].join(':'));

                socket.leave(payload._id);
                socket.leave(data.session);

                const userList = updatedClassSession.toJSON().userList;
                ioServer.to(data.session).emit('sendUserList', userList);
            } catch (err) {
                ioServer.to(socket.id).emit('error');
                return;
            }
        })

        socket.on('shareScreen', async (data: socketData.ContentData) => {
            try {
                if (!checkData(data, ['token', 'class', 'session'])) {
                    throw new Error();
                };
                const { payload } = await authSessionConnection(data);

                // atomic update - only one can share screen
                const updatedClassSession = await ClassSession.findOneAndUpdate(
                    {
                        _id: data.session,
                        status: "online",
                        "userList.isSharingScreen": {
                            $nin: true
                        }
                    },
                    {
                        $set: {
                            "userList.$[elem].isSharingScreen": true
                        },
                    },
                    { arrayFilters: [{ "elem.user": { $eq: payload._id } }], new: true }
                );
                assert(updatedClassSession);

                const userList = updatedClassSession.toJSON().userList;
                ioServer.to(data.session).emit('sendUserList', userList);
            } catch (err) {
                ioServer.to(socket.id).emit('error');
                return;
            }
        })

        socket.on('stopShareScreen', async (data: socketData.ContentData) => {
            try {
                if (!checkData(data, ['token', 'class', 'session'])) {
                    throw new Error();
                };
                const { payload } = await authSessionConnection(data);

                const updatedClassSession = await ClassSession.findOneAndUpdate(
                    {
                        _id: data.session,
                        status: "online",
                        "userList.user": payload._id,
                        "userList.isSharingScreen": true
                    },
                    {
                        $set: {
                            "userList.$.isSharingScreen": false
                        }
                    },
                    { new: true }
                );
                assert(updatedClassSession);

                const userList = updatedClassSession.toJSON().userList;
                ioServer.to(data.session).emit('sendUserList', userList);
            } catch (err) {
                ioServer.to(socket.id).emit('error');
                return;
            }
        })

        socket.on('sendSignal', async (data: socketData.ContentData) => {
            try {
                if (!checkData(data, ['token', 'class', 'session',
                    'sendTo', 'content'])) {
                    throw new Error();
                };
                const { payload } = await authSessionConnection(data);

                const signalContent = {
                    user: payload._id,
                    content: data.content
                }
                ioServer.to(data.sendTo).emit('deliverSignal', signalContent);
            } catch (err) {
                ioServer.to(socket.id).emit('error');
                return;
            }
        })

        socket.on('getUserList', async (data: socketData.Data) => {
            try {
                if (!checkData(data, ['token', 'class', 'session'])) {
                    throw new Error();
                };
                await authSessionConnection(data);

                const classSessionDoc = await ClassSession.findById(data.session);
                assert(classSessionDoc);

                const userList = classSessionDoc.toJSON().userList;
                ioServer.to(socket.id).emit('sendUserList', userList);
            } catch (err) {
                ioServer.to(socket.id).emit('error');
                return;
            }
        })

        socket.on('sendChat', async (data: socketData.ContentData) => {
            try {
                if (!checkData(data, ['token', 'class', 'session', 'content'])) {
                    throw new Error();
                };
                const { payload } = await authSessionConnection(data);

                const classSessionDoc = await ClassSession.findOne(
                    {
                        _id: data.session,
                        status: "online",
                        "userList.user": {
                            $in: payload._id
                        }
                    },

                );
                assert.ok(classSessionDoc);

                const chatDoc = await Chat.create({
                    date: Date.now(),
                    session: data.session,
                    user: payload._id,
                    content: data.content,
                });
                assert.ok(chatDoc);

                const chatContent = {
                    user: payload._id,
                    name: payload.name,
                    content: data.content
                }
                ioServer.to(data.session).emit('deliverChat', chatContent);
            } catch (err) {
                ioServer.to(socket.id).emit('error');
                return;
            }
        })

        // TODO integrate with concentration data
        socket.on('pingSession', async (data: socketData.Data) => {
            try {
                if (!checkData(data, ['token', 'class', 'session'])) {
                    throw new Error();
                };
                const { payload } = await authSessionConnection(data);

                const classSessionDoc = await ClassSession.findOne(
                    {
                        _id: data.session,
                        status: "online",
                        "userList.user": {
                            $in: payload._id
                        }
                    }
                )
                assert.ok(classSessionDoc);

                // update to redis connection manager
                const redisArgs = [Date.now(), [data.session, payload._id, socket.id].join(':')];
                await redisWrapper.zadd(redisClient, redisArgs);
            } catch (err) {
                ioServer.to(socket.id).emit('error');
                return;
            }
        })

        // this event is for teacher to politely ask user(s) to disconnect
        socket.on('requestDisconnection', async (data: socketData.ContentData) => {
            try {
                if (!checkData(data, ['token', 'class', 'session', 'sendTo'])) {
                    throw new Error();
                };
                const { isHost } = await authSessionConnection(data);
                assert(isHost);

                // users received deliverDisconnection has to send leaveSession event
                ioServer.to(data.sendTo).emit('deliverDisconnection');
            } catch (err) {
                ioServer.to(socket.id).emit('error');
                return;
            }
        })

        socket.on('disconnect', async () => {
            try {
                // TODO consider user in multiple session
                const filteredSessionDoc = await ClassSession.findOne(
                    {
                        status: "online",
                        "userList.socket": {
                            $in: socket.id
                        }
                    }
                ).select({ userList: { $elemMatch: { socket: socket.id } } })

                const updatedClassSession = await ClassSession.findOneAndUpdate(
                    {
                        status: "online",
                        "userList.socket": {
                            $in: socket.id
                        }
                    },
                    {
                        $pull: {
                            userList: { socket: socket.id }
                        }
                    },
                    { new: true }
                );

                if (filteredSessionDoc && updatedClassSession) {
                    const filteredSessionJson = filteredSessionDoc.toJSON();
                    const [disconnectedUser] = filteredSessionJson.userList;
                    const updateJSON = updatedClassSession.toJSON();
                    const { userList, _id } = updateJSON;

                    socket.leave(updateJSON._id);
                    socket.leave(disconnectedUser.user);

                    // remove from redis connection manager
                    await redisWrapper.zrem(redisClient,
                        [updateJSON._id, disconnectedUser.user, socket.id].join(':'));

                    ioServer.to(_id).emit('sendUserList', userList);
                }
            } catch (err) {
                console.log(err); // TODO log error
                return;
            }
        })

    })
}

export default setIoServer;