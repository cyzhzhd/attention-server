"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIoServer = void 0;
var socket_io_1 = __importDefault(require("socket.io"));
var socket_io_redis_1 = __importDefault(require("socket.io-redis"));
var mongoose_1 = __importDefault(require("mongoose"));
var dotenv_1 = __importDefault(require("dotenv"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var assert_1 = __importDefault(require("assert"));
var userModel_1 = require("./models/userModel");
var classModel_1 = require("./models/classModel");
var classSessionModel_1 = require("./models/classSessionModel");
var chatModel_1 = require("./models/chatModel");
dotenv_1.default.config();
var REDIS_HOST = process.env.REDIS_HOST;
var REDIS_PORT = parseInt(process.env.REDIS_PORT);
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var Class = mongoose_1.default.model('Class', classModel_1.classModel);
var User = mongoose_1.default.model('User', userModel_1.userModel);
var ClassSession = mongoose_1.default.model('ClassSession', classSessionModel_1.classSessionModel);
var Chat = mongoose_1.default.model('Chat', chatModel_1.chatModel);
function checkData(data, checkList) {
    for (var _i = 0, checkList_1 = checkList; _i < checkList_1.length; _i++) {
        var check = checkList_1[_i];
        if (!(check in data)) {
            return false;
        }
    }
    return true;
}
function authSocketConnection(data) {
    return __awaiter(this, void 0, void 0, function () {
        var payload, _a, classDoc, teacherDoc, studentDoc;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    payload = jsonwebtoken_1.default.verify(data.token, PRIVATE_KEY, { algorithms: ["HS256"] });
                    return [4 /*yield*/, Promise.all([
                            // Check class and session exists
                            new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                var classDoc;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Class.findOne({
                                                _id: data.class,
                                                session: data.session
                                            })];
                                        case 1:
                                            classDoc = _a.sent();
                                            resolve(classDoc);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }),
                            // Check user class access
                            new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                var teacherDoc;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, User.findOne({
                                                _id: payload._id,
                                                ownClasses: { $in: data.class }
                                            })];
                                        case 1:
                                            teacherDoc = _a.sent();
                                            resolve(teacherDoc);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }),
                            new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                var studentDoc;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, User.findOne({
                                                _id: payload._id,
                                                classes: { $in: data.class }
                                            })];
                                        case 1:
                                            studentDoc = _a.sent();
                                            resolve(studentDoc);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }),
                        ])];
                case 1:
                    _a = _b.sent(), classDoc = _a[0], teacherDoc = _a[1], studentDoc = _a[2];
                    assert_1.default.ok(classDoc && (teacherDoc || studentDoc));
                    return [2 /*return*/, {
                            payload: payload, isHost: !!teacherDoc
                        }];
            }
        });
    });
}
exports.setIoServer = function (server) {
    var _this = this;
    var ioServer = socket_io_1.default(server);
    var adapter = socket_io_redis_1.default({ host: REDIS_HOST, port: REDIS_PORT });
    ioServer.adapter(adapter);
    ioServer.on("connection", function (socket) {
        // TODO prevent joining multiple  session
        socket.on('joinSession', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var _a, payload, isHost, updatedClassSession, userList, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocketConnection(data)];
                    case 1:
                        _a = _b.sent(), payload = _a.payload, isHost = _a.isHost;
                        return [4 /*yield*/, ClassSession.findOneAndUpdate({
                                _id: data.session,
                                status: "online",
                                "userList.user": {
                                    $nin: payload._id
                                }
                            }, {
                                $addToSet: {
                                    userList: {
                                        user: payload._id,
                                        socket: socket.id,
                                        name: payload.name,
                                        isTeacher: isHost,
                                        isSharingScreen: false
                                    }
                                }
                            }, { new: true })];
                    case 2:
                        updatedClassSession = _b.sent();
                        assert_1.default(updatedClassSession);
                        socket.join(payload._id);
                        socket.join(data.session);
                        userList = updatedClassSession.toJSON().userList;
                        ioServer.to(data.session).emit('sendUserList', userList);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        ioServer.to(socket.id).emit('error');
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        socket.on('leaveSession', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, updatedClassSession, userList, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocketConnection(data)];
                    case 1:
                        payload = (_a.sent()).payload;
                        return [4 /*yield*/, ClassSession.findOneAndUpdate({
                                _id: data.session,
                                status: "online",
                            }, {
                                $pull: {
                                    userList: { user: payload._id }
                                }
                            }, { new: true })];
                    case 2:
                        updatedClassSession = _a.sent();
                        assert_1.default(updatedClassSession);
                        socket.leave(payload._id);
                        socket.leave(data.session);
                        userList = updatedClassSession.toJSON().userList;
                        ioServer.to(data.session).emit('sendUserList', userList);
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        ioServer.to(socket.id).emit('error');
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        socket.on('shareScreen', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, updatedClassSession, userList, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocketConnection(data)];
                    case 1:
                        payload = (_a.sent()).payload;
                        return [4 /*yield*/, ClassSession.findOneAndUpdate({
                                _id: data.session,
                                status: "online",
                                "userList.isSharingScreen": {
                                    $nin: true
                                }
                            }, {
                                $set: {
                                    "userList.$[elem].isSharingScreen": true
                                },
                            }, { arrayFilters: [{ "elem.user": { $eq: payload._id } }], new: true })];
                    case 2:
                        updatedClassSession = _a.sent();
                        assert_1.default(updatedClassSession);
                        userList = updatedClassSession.toJSON().userList;
                        ioServer.to(data.session).emit('sendUserList', userList);
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        ioServer.to(socket.id).emit('error');
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        socket.on('stopShareScreen', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, updatedClassSession, userList, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocketConnection(data)];
                    case 1:
                        payload = (_a.sent()).payload;
                        return [4 /*yield*/, ClassSession.findOneAndUpdate({
                                _id: data.session,
                                status: "online",
                                "userList.user": payload._id,
                                "userList.isSharingScreen": true
                            }, {
                                $set: {
                                    "userList.$.isSharingScreen": false
                                }
                            }, { new: true })];
                    case 2:
                        updatedClassSession = _a.sent();
                        assert_1.default(updatedClassSession);
                        userList = updatedClassSession.toJSON().userList;
                        ioServer.to(data.session).emit('sendUserList', userList);
                        return [3 /*break*/, 4];
                    case 3:
                        err_4 = _a.sent();
                        ioServer.to(socket.id).emit('error');
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        socket.on('sendSignal', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, signalContent, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!checkData(data, ['token', 'class', 'session',
                            'sendTo', 'content'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocketConnection(data)];
                    case 1:
                        payload = (_a.sent()).payload;
                        signalContent = {
                            user: payload._id,
                            content: data.content
                        };
                        ioServer.to(data.sendTo).emit('deliverSignal', signalContent);
                        return [3 /*break*/, 3];
                    case 2:
                        err_5 = _a.sent();
                        ioServer.to(socket.id).emit('error');
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        socket.on('getUserList', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var classSessionDoc, userList, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocketConnection(data)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ClassSession.findById(data.session)];
                    case 2:
                        classSessionDoc = _a.sent();
                        assert_1.default(classSessionDoc);
                        userList = classSessionDoc.toJSON().userList;
                        ioServer.to(socket.id).emit('sendUserList', userList);
                        return [3 /*break*/, 4];
                    case 3:
                        err_6 = _a.sent();
                        ioServer.to(socket.id).emit('error');
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        socket.on('sendChat', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var session, payload, chatDoc, updatedClassSession, chatContent, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
                    case 1:
                        session = _a.sent();
                        session.startTransaction();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        if (!checkData(data, ['token', 'class', 'session', 'content'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocketConnection(data)];
                    case 3:
                        payload = (_a.sent()).payload;
                        return [4 /*yield*/, Chat.create([{
                                    date: Date.now(),
                                    user: payload._id,
                                    content: data.content,
                                }], { session: session })];
                    case 4:
                        chatDoc = (_a.sent())[0];
                        assert_1.default.ok(chatDoc);
                        return [4 /*yield*/, ClassSession.findOneAndUpdate({
                                _id: data.session,
                                status: "online",
                                "userList.user": {
                                    $in: payload._id
                                }
                            }, {
                                $push: {
                                    chat: chatDoc._id
                                }
                            }, { new: true, session: session })];
                    case 5:
                        updatedClassSession = _a.sent();
                        assert_1.default.ok(updatedClassSession);
                        chatContent = {
                            user: payload._id,
                            name: payload.name,
                            content: data.content
                        };
                        ioServer.to(data.session).emit('deliverChat', chatContent);
                        return [3 /*break*/, 8];
                    case 6:
                        err_7 = _a.sent();
                        return [4 /*yield*/, session.abortTransaction()];
                    case 7:
                        _a.sent();
                        session.endSession();
                        ioServer.to(socket.id).emit('error');
                        return [2 /*return*/];
                    case 8: return [4 /*yield*/, session.commitTransaction()];
                    case 9:
                        _a.sent();
                        session.endSession();
                        return [2 /*return*/];
                }
            });
        }); });
        socket.on('disconnect', function () { return __awaiter(_this, void 0, void 0, function () {
            var updatedClassSession, updateJSON, userList, _id, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ClassSession.findOneAndUpdate({
                                status: "online",
                                "userList.socket": {
                                    $in: socket.id
                                }
                            }, {
                                $pull: {
                                    userList: { socket: socket.id }
                                }
                            }, { new: true })];
                    case 1:
                        updatedClassSession = _a.sent();
                        if (updatedClassSession) {
                            updateJSON = updatedClassSession.toJSON();
                            userList = updateJSON.userList, _id = updateJSON._id;
                            ioServer.to(_id).emit('sendUserList', userList);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_8 = _a.sent();
                        console.error(err_8); // TODO log error
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    });
};
exports.default = exports.setIoServer;
