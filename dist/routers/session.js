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
var express_1 = __importDefault(require("express"));
var mongoose_1 = __importDefault(require("mongoose"));
var express_jwt_1 = __importDefault(require("express-jwt"));
var dotenv_1 = __importDefault(require("dotenv"));
var assert_1 = __importDefault(require("assert"));
var path_1 = __importDefault(require("path"));
var redis_1 = __importDefault(require("redis"));
var redisWrapper = __importStar(require("../helpers/redisWrapper"));
var userModel_1 = require("../models/userModel");
var classModel_1 = require("../models/classModel");
var classSessionModel_1 = require("../models/classSessionModel");
var errorHandler_1 = require("../helpers/errorHandler");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
var router = express_1.default.Router();
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var REDIS_HOST = process.env.REDIS_HOST;
var REDIS_PORT = parseInt(process.env.REDIS_PORT);
var redisClient = redis_1.default.createClient({ host: REDIS_HOST, port: REDIS_PORT });
var Class = mongoose_1.default.model('Class', classModel_1.classModel);
var User = mongoose_1.default.model('User', userModel_1.userModel);
var ClassSession = mongoose_1.default.model('ClassSession', classSessionModel_1.classSessionModel);
router.get('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, _a, teacherDoc, studentDoc, classSessionDoc, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                req = _req;
                if (!('class' in req.query) || !('session' in req.query)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "class_or_session_id_not_specified"))];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, Promise.all([
                        // Check user class access
                        new Promise(function (resolve) {
                            User.findOne({
                                _id: req.user._id,
                                ownClasses: { $in: req.query.class }
                            }).then(function (teacherDoc) { resolve(teacherDoc); });
                        }),
                        new Promise(function (resolve) {
                            User.findOne({
                                _id: req.user._id,
                                classes: { $in: req.query.class }
                            }).then(function (studentDoc) { resolve(studentDoc); });
                        }),
                    ])];
            case 2:
                _a = _b.sent(), teacherDoc = _a[0], studentDoc = _a[1];
                assert_1.default.ok(teacherDoc || studentDoc);
                return [4 /*yield*/, ClassSession.findById(req.query.session)];
            case 3:
                classSessionDoc = _b.sent();
                assert_1.default.ok(classSessionDoc);
                res.status(200).send(classSessionDoc);
                return [3 /*break*/, 5];
            case 4:
                err_1 = _b.sent();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "session_found_failed"))];
            case 5: return [2 /*return*/];
        }
    });
}); });
// TODO session info regex
router.post('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, session, userDoc, classSessionDoc, updatedClass, redisParties, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!req.user.isTeacher) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "user_not_teacher"))];
                }
                if (!('class' in req.body)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'class_id_not_specified'))];
                }
                if (req.body.scheduledStartTime > req.body.scheduledEndTime) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "invalid_time_settings"))];
                }
                return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 9]);
                return [4 /*yield*/, User.findOne({
                        _id: req.user._id,
                        ownClasses: { $in: req.body.class }
                    })];
            case 3:
                userDoc = _a.sent();
                assert_1.default.ok(userDoc);
                // Start session
                req.body.teacher = req.user._id;
                req.body.teacherName = req.user.name;
                req.body.startTime = Date.now();
                req.body.status = "online";
                return [4 /*yield*/, ClassSession.create([req.body], { session: session })];
            case 4:
                classSessionDoc = (_a.sent())[0];
                assert_1.default.ok(classSessionDoc);
                return [4 /*yield*/, Class.updateOne({ _id: req.body.class, status: "offline" }, { status: "online", session: classSessionDoc._id }, { session: session })];
            case 5:
                updatedClass = _a.sent();
                assert_1.default.ok(updatedClass && updatedClass.n >= 1);
                redisParties = [classSessionDoc._id, "parties"].join(':');
                return [4 /*yield*/, redisWrapper.sadd(redisParties, redisClient, "independent")];
            case 6:
                _a.sent();
                return [3 /*break*/, 9];
            case 7:
                err_2 = _a.sent();
                return [4 /*yield*/, session.abortTransaction()];
            case 8:
                _a.sent();
                session.endSession();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "session_start_failed"))];
            case 9: return [4 /*yield*/, session.commitTransaction()];
            case 10:
                _a.sent();
                session.endSession();
                res.sendStatus(201);
                return [2 /*return*/];
        }
    });
}); });
router.delete('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, session, userDoc, updatedSession, updatedClass, redisParties, redisPartyUsers, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!req.user.isTeacher) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "user_not_teacher"))];
                }
                if (!('class' in req.query) || !('session' in req.query)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "class_or_session_id_not_specified"))];
                }
                return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 8, , 10]);
                return [4 /*yield*/, User.findOne({
                        _id: req.user._id,
                        ownClasses: { $in: req.query.class }
                    })];
            case 3:
                userDoc = _a.sent();
                assert_1.default.ok(userDoc);
                return [4 /*yield*/, ClassSession.updateOne({ _id: req.query.session, status: "online" }, { status: "offline", endTime: Date.now(), userList: null }, { session: session })];
            case 4:
                updatedSession = _a.sent();
                assert_1.default.ok(updatedSession && updatedSession.n >= 1);
                return [4 /*yield*/, Class.updateOne({ _id: req.query.class, status: "online" }, { status: "offline", session: null }, { session: session })];
            case 5:
                updatedClass = _a.sent();
                assert_1.default.ok(updatedClass && updatedClass.n >= 1);
                redisParties = [req.query.session, "parties"].join(':');
                return [4 /*yield*/, redisWrapper.del(redisParties, redisClient)];
            case 6:
                _a.sent();
                redisPartyUsers = [req.query.session, "partyUser"].join(':');
                return [4 /*yield*/, redisWrapper.del(redisPartyUsers, redisClient)];
            case 7:
                _a.sent();
                return [3 /*break*/, 10];
            case 8:
                err_3 = _a.sent();
                return [4 /*yield*/, session.abortTransaction()];
            case 9:
                _a.sent();
                session.endSession();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "session_termination_failed"))];
            case 10: return [4 /*yield*/, session.commitTransaction()];
            case 11:
                _a.sent();
                session.endSession();
                res.sendStatus(200);
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
