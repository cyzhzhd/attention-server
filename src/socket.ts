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
import { concentrationModel } from "./models/concentrationModel";
import { chatModel } from "./models/chatModel";

dotenv.config({ path: path.join(__dirname, '../.env') });
const REDIS_HOST = process.env.REDIS_HOST as string;
const REDIS_PORT = parseInt(process.env.REDIS_PORT as string);

const redisClient = redis.createClient({ host: REDIS_HOST, port: REDIS_PORT });

const Concentration = mongoose.model('Concentration', concentrationModel);
const ClassSession = mongoose.model('ClassSession', classSessionModel);
const Chat = mongoose.model('Chat', chatModel);

function checkData(data:
    (socketData.ContentData | socketData.Data | socketData.ConcentrationData),
    checkList: Array<string>): boolean {
    for (const check of checkList) {
        if (!(check in data)) {
            return false;
        }
    }
    return true;
}

function emitUserStateChange(classSessionDoc: mongoose.Document,
    sessionId: string, ioServer: io.Server) {
    const userList = classSessionDoc.toJSON().userList as Array<socketData.User>;
    const ScreenSharingUser = userList.find(user => user.isSharingScreen === true);
    const ScreenSharingUserId = (ScreenSharingUser === undefined) ?
        null : ScreenSharingUser.user;

    ioServer.to(sessionId).emit('deliverUserList', userList);
    ioServer.to(sessionId).emit('deliverScreenSharingUser', ScreenSharingUserId);
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
                const [session, socket] = disconnection.split(':');

                // remove from mongodb
                // TODO batch job within same session
                const updatedClassSession = await ClassSession.findOneAndUpdate(
                    {
                        _id: session,
                        status: "online",
                    },
                    {
                        $pull: {
                            userList: { socket: socket }
                        }
                    },
                    { new: true }
                );

                if (updatedClassSession) {
                    emitUserStateChange(updatedClassSession, session, ioServer);

                    // leave socket room
                    [session, socket].forEach((room) => {
                        adapter.remoteLeave(socket, room, () => { return; })
                    });

                    // users received deliverDisconnection has to send leaveSession event
                    ioServer.to(socket).emit('deliverDisconnection');
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
                const redisArgs = [Date.now(),
                [data.session, socket.id].join(':')];
                await redisWrapper.zadd(redisClient, redisArgs);

                socket.join(payload._id);
                socket.join(data.session);

                emitUserStateChange(updatedClassSession, data.session, ioServer);
            } catch (err) {
                ioServer.to(socket.id).emit('deliverError');
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

                await redisWrapper.zrem(redisClient,
                    [data.session, socket.id].join(':'));

                // leave socket room
                socket.leave(payload._id);
                socket.leave(data.session);

                emitUserStateChange(updatedClassSession, data.session, ioServer);
            } catch (err) {
                ioServer.to(socket.id).emit('deliverError');
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
                    {
                        arrayFilters: [{ "elem.user": { $eq: payload._id } }],
                        new: true
                    }
                );
                assert(updatedClassSession);

                emitUserStateChange(updatedClassSession, data.session, ioServer);
            } catch (err) {
                ioServer.to(socket.id).emit('deliverError');
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

                emitUserStateChange(updatedClassSession, data.session, ioServer);
            } catch (err) {
                ioServer.to(socket.id).emit('deliverError');
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
                ioServer.to(socket.id).emit('deliverError');
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
                ioServer.to(socket.id).emit('deliverError');
                return;
            }
        })

        // this socket event also does ping
        socket.on('sendConcentration', async (data: socketData.ConcentrationData) => {
            try {
                if (!checkData(data, ['token', 'class', 'session'])) {
                    throw new Error();
                };
                const { payload, isHost } = await authSessionConnection(data);

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

                if (!isHost) {
                    const concentrationDoc = await Concentration.create({
                        class: data.class,
                        session: data.session,
                        user: payload._id,
                        name: payload.name,
                        date: Date.now(),
                        status: data.content,
                    });
                    assert.ok(concentrationDoc);

                    const concentrationContent = {
                        user: payload._id,
                        name: payload.name,
                        content: data.content
                    }

                    const teacher = classSessionDoc.toJSON().teacher;
                    ioServer.to(teacher).emit('deliverConcentration', concentrationContent);
                }

                // update to redis connection manager
                const redisArgs = [Date.now(), [data.session, socket.id].join(':')];
                await redisWrapper.zadd(redisClient, redisArgs);
            } catch (err) {
                ioServer.to(socket.id).emit('deliverError');
                return;
            }
        })

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
                const redisArgs = [Date.now(), [data.session, socket.id].join(':')];
                await redisWrapper.zadd(redisClient, redisArgs);
            } catch (err) {
                ioServer.to(socket.id).emit('deliverError');
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
                ioServer.to(socket.id).emit('deliverError');
                return;
            }
        })

        socket.on('disconnect', async () => {
            try {
                // TODO consider user in multiple session
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

                if (updatedClassSession) {
                    const classSessionJson = updatedClassSession.toJSON();

                    await redisWrapper.zrem(redisClient,
                        [classSessionJson._id, socket.id].join(':'));

                    emitUserStateChange(updatedClassSession, classSessionJson._id, ioServer);
                    // leaving socket room doesn't needed
                }
            } catch (err) {
                console.log(err); // TODO log error
                return;
            }
        })

    })
}

export default setIoServer;