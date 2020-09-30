import io from "socket.io";
import redis from "socket.io-redis";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import assert from "assert";
import path from "path";
import * as socketData from "./types/socketData";
import { userModel } from "./models/userModel";
import { classModel } from "./models/classModel";
import { classSessionModel } from "./models/classSessionModel";
import { chatModel } from "./models/chatModel"
import { Payload } from "./types/reqjwt";

dotenv.config({ path: path.join(__dirname, '../.env') });
const REDIS_HOST = process.env.REDIS_HOST as string;
const REDIS_PORT = parseInt(process.env.REDIS_PORT as string);
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const Class = mongoose.model('Class', classModel);
const User = mongoose.model('User', userModel);
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

async function authSocketConnection(data: socketData.Data):
    Promise<{ payload: Payload, isHost: boolean }> {
    const payload: Payload = jwt.verify(data.token, PRIVATE_KEY,
        { algorithms: ["HS256"] }) as Payload;

    const [classDoc, teacherDoc, studentDoc] = await Promise.all([
        // Check class and session exists
        new Promise<any>(async (resolve) => {
            const classDoc = await Class.findOne(
                {
                    _id: data.class,
                    session: data.session
                }
            );
            resolve(classDoc);
        }),
        // Check user class access
        new Promise<any>(async (resolve) => {
            const teacherDoc = await User.findOne(
                {
                    _id: payload._id,
                    ownClasses: { $in: data.class }
                }
            );
            resolve(teacherDoc);
        }),
        new Promise<any>(async (resolve) => {
            const studentDoc = await User.findOne(
                {
                    _id: payload._id,
                    classes: { $in: data.class }
                }
            );
            resolve(studentDoc);
        }),
    ])
    assert.ok(classDoc && (teacherDoc || studentDoc));
    return {
        payload: payload, isHost: !!teacherDoc
    };
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
                const { payload, isHost } = await authSocketConnection(data);

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
                const { payload } = await authSocketConnection(data);
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
                const { payload } = await authSocketConnection(data);

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
                const { payload } = await authSocketConnection(data);

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
                const { payload } = await authSocketConnection(data);

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
                await authSocketConnection(data);

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
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                if (!checkData(data, ['token', 'class', 'session', 'content'])) {
                    throw new Error();
                };
                const { payload } = await authSocketConnection(data);

                const [chatDoc] = await Chat.create([{
                    date: Date.now(),
                    user: payload._id,
                    content: data.content,
                }],
                    { session: session }) as unknown as Array<mongoose.Document>;
                assert.ok(chatDoc);

                const updatedClassSession = await ClassSession.findOneAndUpdate(
                    {
                        _id: data.session,
                        status: "online",
                        "userList.user": {
                            $in: payload._id
                        }
                    },
                    {
                        $push: {
                            chat: chatDoc._id
                        }
                    },
                    { new: true, session: session }
                );
                assert.ok(updatedClassSession);

                const chatContent = {
                    user: payload._id,
                    name: payload.name,
                    content: data.content
                }
                ioServer.to(data.session).emit('deliverChat', chatContent);
            } catch (err) {
                await session.abortTransaction();
                session.endSession()

                ioServer.to(socket.id).emit('error');
                return;
            }

            await session.commitTransaction();
            session.endSession();
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
            }
        })

    })
}

export default setIoServer;