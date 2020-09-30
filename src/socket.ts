import io from "socket.io";
import redis from "socket.io-redis";
import mongoose from "mongoose";
import dotenv from "dotenv";
import assert from "assert";
import path from "path";
import { authSessionConnection } from './helpers/auth'
import * as socketData from "./types/socketData";
import { classSessionModel } from "./models/classSessionModel";
import { chatModel } from "./models/chatModel"

dotenv.config({ path: path.join(__dirname, '../.env') });
const REDIS_HOST = process.env.REDIS_HOST as string;
const REDIS_PORT = parseInt(process.env.REDIS_PORT as string);

const ClassSession = mongoose.model('ClassSession', classSessionModel);
const Chat = mongoose.model('Chat', chatModel);

function checkData(data: Object, checkList: Array<string>): boolean {
    for (const check of checkList) {
        if (!(check in data)) {
            return false;
        }
    }
    return true;
}

export const setIoServer = function (server: import('http').Server) {
    const ioServer = io(server);
    const adapter = redis({ host: REDIS_HOST, port: REDIS_PORT });
    ioServer.adapter(adapter);

    ioServer.on("connection", (socket) => {

        // TODO prevent joining multiple  session
        socket.on('joinSession', async (data: socketData.Data) => {
            try {
                if (!checkData(data, ['token', 'class', 'session'])) {
                    throw new Error();
                };
                const { payload, isHost } = await authSessionConnection(data);

                // TODO use Redis to detect connection loss
                // Check user already connected
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

        socket.on('disconnect', async () => {
            try {
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
                    const updateJSON = updatedClassSession.toJSON();
                    const { userList, _id } = updateJSON;
                    ioServer.to(_id).emit('sendUserList', userList);
                }
            } catch (err) {
                console.error(err); // TODO log error
                return;
            }
        })

    })
}

export default setIoServer;