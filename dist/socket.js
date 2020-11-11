"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var mongoose_1 = __importDefault(require("mongoose"));
var dotenv_1 = __importDefault(require("dotenv"));
var assert_1 = __importDefault(require("assert"));
var path_1 = __importDefault(require("path"));
var redis_1 = __importDefault(require("redis"));
var redisWrapper = __importStar(require("./helpers/redisWrapper"));
var authSocket_1 = require("./helpers/authSocket");
var socket_io_redis_1 = __importDefault(require("socket.io-redis"));
var classSessionModel_1 = require("./models/classSessionModel");
var concentrationModel_1 = require("./models/concentrationModel");
var chatModel_1 = require("./models/chatModel");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
var REDIS_HOST = process.env.REDIS_HOST;
var REDIS_PORT = parseInt(process.env.REDIS_PORT);
var REDIS_CONNECTION_COLLECTION = process.env.REDIS_CONNECTION_COLLECTION;
var redisClient = redis_1.default.createClient({ host: REDIS_HOST, port: REDIS_PORT });
var Concentration = mongoose_1.default.model('Concentration', concentrationModel_1.concentrationModel);
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
// TODO promise.all
function emitPartyStateChange(sessionId, ioServer) {
    return __awaiter(this, void 0, void 0, function () {
        var redisPartyUsers, partyInfo, redisParties, parties, partyObj, _i, parties_1, party, _a, partyInfo_1, info, splitted, infoObj;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    redisPartyUsers = [sessionId, "partyUser"].join(':');
                    return [4 /*yield*/, redisWrapper.hvals(redisPartyUsers, redisClient)];
                case 1:
                    partyInfo = _b.sent();
                    redisParties = [sessionId, "parties"].join(':');
                    return [4 /*yield*/, redisWrapper.smembers(redisParties, redisClient)];
                case 2:
                    parties = _b.sent();
                    partyObj = {};
                    for (_i = 0, parties_1 = parties; _i < parties_1.length; _i++) {
                        party = parties_1[_i];
                        partyObj[party] = [];
                    }
                    for (_a = 0, partyInfo_1 = partyInfo; _a < partyInfo_1.length; _a++) {
                        info = partyInfo_1[_a];
                        splitted = info.split(':');
                        infoObj = { "isTeacher": (splitted[0] == "false" ? 0 : 1), "id": splitted[1], "user": splitted[2] };
                        partyObj[splitted[3]].push(infoObj);
                    }
                    ioServer.to(sessionId).emit('deliverPartyList', partyObj);
                    return [2 /*return*/];
            }
        });
    });
}
function emitUserStateChange(classSessionDoc, sessionId, ioServer) {
    var userList = classSessionDoc.toJSON().userList;
    var ScreenSharingUser = userList.find(function (user) { return user.isSharingScreen === true; });
    var ScreenSharingUserId = (ScreenSharingUser === undefined) ?
        null : ScreenSharingUser.user;
    ioServer.to(sessionId).emit('deliverUserList', userList);
    ioServer.to(sessionId).emit('deliverScreenSharingUser', ScreenSharingUserId);
}
exports.setIoServer = function (server) {
    var _this = this;
    var ioServer = socket_io_1.default(server, { transports: ['websocket'] });
    var _adapter = socket_io_redis_1.default({ host: REDIS_HOST, port: REDIS_PORT });
    ioServer.adapter(_adapter);
    var adapter = ioServer.of('/').adapter;
    // Disconnection checker + handler
    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
        var curTime, disconnections, _loop_1, _i, disconnections_1, disconnection, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    curTime = Date.now();
                    return [4 /*yield*/, redisWrapper.zrangebyscore(REDIS_CONNECTION_COLLECTION, redisClient, 0, curTime - 15000)];
                case 1:
                    disconnections = _a.sent();
                    // remove from redis
                    return [4 /*yield*/, redisWrapper.zremrangebyscore(REDIS_CONNECTION_COLLECTION, redisClient, 0, curTime - 15000)];
                case 2:
                    // remove from redis
                    _a.sent();
                    _loop_1 = function (disconnection) {
                        var _a, session, socket, updatedClassSession, redisPartyUsers;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = disconnection.split(':'), session = _a[0], socket = _a[1];
                                    return [4 /*yield*/, ClassSession.findOneAndUpdate({
                                            _id: session,
                                            status: "online",
                                        }, {
                                            $pull: {
                                                userList: { socket: socket }
                                            }
                                        }, { new: true })];
                                case 1:
                                    updatedClassSession = _b.sent();
                                    if (!updatedClassSession) return [3 /*break*/, 4];
                                    // leave socket room
                                    [session, socket].forEach(function (room) {
                                        adapter.remoteLeave(socket, room, function () { return; });
                                    });
                                    redisPartyUsers = [session, "partyUser"].join(':');
                                    return [4 /*yield*/, redisWrapper.hdel(redisPartyUsers, redisClient, socket)];
                                case 2:
                                    _b.sent();
                                    return [4 /*yield*/, emitPartyStateChange(session, ioServer)];
                                case 3:
                                    _b.sent();
                                    emitUserStateChange(updatedClassSession, session, ioServer);
                                    // users received deliverDisconnection has to send leaveSession event
                                    ioServer.to(socket).emit('deliverDisconnection');
                                    _b.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, disconnections_1 = disconnections;
                    _a.label = 3;
                case 3:
                    if (!(_i < disconnections_1.length)) return [3 /*break*/, 6];
                    disconnection = disconnections_1[_i];
                    return [5 /*yield**/, _loop_1(disconnection)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    err_1 = _a.sent();
                    console.log(err_1); // TODO log error
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); }, 10000);
    ioServer.on("connection", function (socket) {
        // TODO prevent joining multiple session
        socket.on('joinSession', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var _a, payload, isHost, updatedClassSession, redisArgs, redisPartyUsers, redisUserValue, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
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
                        redisArgs = [Date.now(),
                            [data.session, socket.id].join(':')];
                        return [4 /*yield*/, redisWrapper.zadd(REDIS_CONNECTION_COLLECTION, redisClient, redisArgs)];
                    case 3:
                        _b.sent();
                        redisPartyUsers = [data.session, "partyUser"].join(':');
                        redisUserValue = [isHost, payload._id, payload.name, "independent"].join(':');
                        return [4 /*yield*/, redisWrapper.hmset(redisPartyUsers, redisClient, [socket.id, redisUserValue])];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, emitPartyStateChange(data.session, ioServer)];
                    case 5:
                        _b.sent();
                        emitUserStateChange(updatedClassSession, data.session, ioServer);
                        return [3 /*break*/, 7];
                    case 6:
                        err_2 = _b.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        socket.on('leaveSession', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, updatedClassSession, redisPartyUsers, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
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
                        return [4 /*yield*/, redisWrapper.zrem(REDIS_CONNECTION_COLLECTION, redisClient, [data.session, socket.id].join(':'))];
                    case 3:
                        _a.sent();
                        redisPartyUsers = [data.session, "partyUser"].join(':');
                        return [4 /*yield*/, redisWrapper.hdel(redisPartyUsers, redisClient, socket.id)];
                    case 4:
                        _a.sent();
                        // leave socket room
                        socket.leave(payload._id);
                        socket.leave(data.session);
                        return [4 /*yield*/, emitPartyStateChange(data.session, ioServer)];
                    case 5:
                        _a.sent();
                        emitUserStateChange(updatedClassSession, data.session, ioServer);
                        return [3 /*break*/, 7];
                    case 6:
                        err_3 = _a.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        socket.on('createParty', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var nameRegex, _a, payload, isHost, redisParties, err_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        nameRegex = /^[\w ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+$/;
                        if (!nameRegex.test(data.content) || data.content.length > 30) {
                            throw new Error();
                        }
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
                    case 1:
                        _a = _b.sent(), payload = _a.payload, isHost = _a.isHost;
                        assert_1.default(isHost);
                        redisParties = [data.session, "parties"].join(':');
                        return [4 /*yield*/, redisWrapper.sadd(redisParties, redisClient, data.content)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, emitPartyStateChange(data.session, ioServer)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_4 = _b.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        socket.on('removeParty', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var _a, payload, isHost, redisPartyUsers, partyMembers_1, filtered_1, redisParties, err_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
                    case 1:
                        _a = _b.sent(), payload = _a.payload, isHost = _a.isHost;
                        assert_1.default(isHost);
                        // independent cannot be removed
                        assert_1.default(data.content !== "independent");
                        redisPartyUsers = [data.session, "partyUser"].join(':');
                        return [4 /*yield*/, redisWrapper.hgetall(redisPartyUsers, redisClient)];
                    case 2:
                        partyMembers_1 = _b.sent();
                        filtered_1 = [];
                        if (!(partyMembers_1 !== undefined && partyMembers_1 !== null)) return [3 /*break*/, 4];
                        Object.keys(partyMembers_1).forEach(function (key) {
                            var splitted = partyMembers_1[key].split(':');
                            if (splitted[3] === data.content) {
                                splitted[3] = "independent";
                                filtered_1.push(key);
                                filtered_1.push(splitted.join(":"));
                            }
                        });
                        return [4 /*yield*/, redisWrapper.hmset(redisPartyUsers, redisClient, filtered_1)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        redisParties = [data.session, "parties"].join(':');
                        return [4 /*yield*/, redisWrapper.srem(redisParties, redisClient, data.content)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, emitPartyStateChange(data.session, ioServer)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_5 = _b.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        socket.on('joinParty', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var _a, payload, isHost, redisParties, redisPartyList, redisPartyUsers, redisUserValue, err_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
                    case 1:
                        _a = _b.sent(), payload = _a.payload, isHost = _a.isHost;
                        redisParties = [data.session, "parties"].join(':');
                        return [4 /*yield*/, redisWrapper.smembers(redisParties, redisClient)];
                    case 2:
                        redisPartyList = _b.sent();
                        if (!redisPartyList.includes(data.content)) return [3 /*break*/, 5];
                        redisPartyUsers = [data.session, "partyUser"].join(':');
                        redisUserValue = [isHost, payload._id, payload.name, data.content].join(':');
                        return [4 /*yield*/, redisWrapper.hmset(redisPartyUsers, redisClient, [socket.id, redisUserValue])];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, emitPartyStateChange(data.session, ioServer)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_6 = _b.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        socket.on('shareScreen', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, updatedClassSession, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
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
                            }, {
                                arrayFilters: [{ "elem.user": { $eq: payload._id } }],
                                new: true
                            })];
                    case 2:
                        updatedClassSession = _a.sent();
                        assert_1.default(updatedClassSession);
                        emitUserStateChange(updatedClassSession, data.session, ioServer);
                        return [3 /*break*/, 4];
                    case 3:
                        err_7 = _a.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        socket.on('stopShareScreen', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, updatedClassSession, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
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
                        emitUserStateChange(updatedClassSession, data.session, ioServer);
                        return [3 /*break*/, 4];
                    case 3:
                        err_8 = _a.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        socket.on('sendSignal', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, signalContent, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!checkData(data, ['token', 'class', 'session',
                            'sendTo', 'content'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
                    case 1:
                        payload = (_a.sent()).payload;
                        signalContent = {
                            user: payload._id,
                            content: data.content
                        };
                        ioServer.to(data.sendTo).emit('deliverSignal', signalContent);
                        return [3 /*break*/, 3];
                    case 2:
                        err_9 = _a.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        socket.on('sendChat', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, classSessionDoc, chatDoc, chatContent, err_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!checkData(data, ['token', 'class', 'session', 'content'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
                    case 1:
                        payload = (_a.sent()).payload;
                        return [4 /*yield*/, ClassSession.findOne({
                                _id: data.session,
                                status: "online",
                                "userList.user": {
                                    $in: payload._id
                                }
                            })];
                    case 2:
                        classSessionDoc = _a.sent();
                        assert_1.default.ok(classSessionDoc);
                        return [4 /*yield*/, Chat.create({
                                date: Date.now(),
                                session: data.session,
                                user: payload._id,
                                content: data.content,
                            })];
                    case 3:
                        chatDoc = _a.sent();
                        assert_1.default.ok(chatDoc);
                        chatContent = {
                            user: payload._id,
                            name: payload.name,
                            content: data.content
                        };
                        ioServer.to(data.session).emit('deliverChat', chatContent);
                        return [3 /*break*/, 5];
                    case 4:
                        err_10 = _a.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        // this socket event also does ping
        socket.on('sendConcentration', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var _a, payload, isHost, classSessionDoc, concentrationDoc, concentrationContent, teacher, redisArgs, err_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
                    case 1:
                        _a = _b.sent(), payload = _a.payload, isHost = _a.isHost;
                        return [4 /*yield*/, ClassSession.findOne({
                                _id: data.session,
                                status: "online",
                                "userList.user": {
                                    $in: payload._id
                                }
                            })];
                    case 2:
                        classSessionDoc = _b.sent();
                        assert_1.default.ok(classSessionDoc);
                        if (!!isHost) return [3 /*break*/, 4];
                        return [4 /*yield*/, Concentration.create({
                                class: data.class,
                                session: data.session,
                                user: payload._id,
                                name: payload.name,
                                date: Date.now(),
                                status: data.content,
                            })];
                    case 3:
                        concentrationDoc = _b.sent();
                        assert_1.default.ok(concentrationDoc);
                        concentrationContent = {
                            user: payload._id,
                            name: payload.name,
                            content: data.content
                        };
                        teacher = classSessionDoc.toJSON().teacher;
                        ioServer.to(teacher).emit('deliverConcenteration', concentrationContent);
                        _b.label = 4;
                    case 4:
                        redisArgs = [Date.now(), [data.session, socket.id].join(':')];
                        return [4 /*yield*/, redisWrapper.zadd(REDIS_CONNECTION_COLLECTION, redisClient, redisArgs)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        err_11 = _b.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        socket.on('pingSession', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, classSessionDoc, redisArgs, err_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!checkData(data, ['token', 'class', 'session'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
                    case 1:
                        payload = (_a.sent()).payload;
                        return [4 /*yield*/, ClassSession.findOne({
                                _id: data.session,
                                status: "online",
                                "userList.user": {
                                    $in: payload._id
                                }
                            })];
                    case 2:
                        classSessionDoc = _a.sent();
                        assert_1.default.ok(classSessionDoc);
                        redisArgs = [Date.now(), [data.session, socket.id].join(':')];
                        return [4 /*yield*/, redisWrapper.zadd(REDIS_CONNECTION_COLLECTION, redisClient, redisArgs)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_12 = _a.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        // this event is for teacher to politely ask user(s) to disconnect
        socket.on('requestDisconnection', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var isHost, err_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!checkData(data, ['token', 'class', 'session', 'sendTo'])) {
                            throw new Error();
                        }
                        ;
                        return [4 /*yield*/, authSocket_1.authSessionConnection(data)];
                    case 1:
                        isHost = (_a.sent()).isHost;
                        assert_1.default(isHost);
                        // users received deliverDisconnection has to send leaveSession event
                        ioServer.to(data.sendTo).emit('deliverDisconnection');
                        return [3 /*break*/, 3];
                    case 2:
                        err_13 = _a.sent();
                        ioServer.to(socket.id).emit('deliverError');
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        socket.on('disconnect', function () { return __awaiter(_this, void 0, void 0, function () {
            var updatedClassSession, classSessionJson, redisPartyUsers, err_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
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
                        if (!updatedClassSession) return [3 /*break*/, 5];
                        classSessionJson = updatedClassSession.toJSON();
                        return [4 /*yield*/, redisWrapper.zrem(REDIS_CONNECTION_COLLECTION, redisClient, [classSessionJson._id, socket.id].join(':'))];
                    case 2:
                        _a.sent();
                        redisPartyUsers = [classSessionJson._id, "partyUser"].join(':');
                        return [4 /*yield*/, redisWrapper.hdel(redisPartyUsers, redisClient, socket.id)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, emitPartyStateChange(classSessionJson._id, ioServer)];
                    case 4:
                        _a.sent();
                        emitUserStateChange(updatedClassSession, classSessionJson._id, ioServer);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_14 = _a.sent();
                        console.log(err_14); // TODO log error
                        return [2 /*return*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    });
};
exports.default = exports.setIoServer;
