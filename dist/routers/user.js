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
var express_1 = __importDefault(require("express"));
var express_jwt_1 = __importDefault(require("express-jwt"));
var mongoose_1 = __importDefault(require("mongoose"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var crypto_1 = __importDefault(require("crypto"));
var dotenv_1 = __importDefault(require("dotenv"));
var assert_1 = __importDefault(require("assert"));
var path_1 = __importDefault(require("path"));
var userModel_1 = require("../models/userModel");
var classModel_1 = require("../models/classModel");
var errorHandler_1 = require("../helpers/errorHandler");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
var router = express_1.default.Router();
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var JWT_EXIPRE = process.env.JWTEXPIRE;
var User = mongoose_1.default.model('User', userModel_1.userModel);
var Class = mongoose_1.default.model('Class', classModel_1.classModel);
// TODO encrypt JWT with public key
// TODO JWT refreshing mechanism
router.post('/login', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userDoc, userInfo, pickedInfo, token, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!('email' in req.body) || !('password' in req.body)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'need_email_and_password'))];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                req.body.password = crypto_1.default.createHash('sha256')
                    .update(req.body.email + req.body.password)
                    .digest('hex');
                return [4 /*yield*/, User.findOne(req.body)];
            case 2:
                userDoc = _a.sent();
                if (userDoc === null) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'invalid_email_and_password'))];
                }
                else {
                    userInfo = userDoc.toJSON();
                    pickedInfo = (function (_a) {
                        var _id = _a._id, email = _a.email, name = _a.name, isTeacher = _a.isTeacher;
                        return ({ _id: _id, email: email, name: name, isTeacher: isTeacher });
                    })(userInfo);
                    token = jsonwebtoken_1.default.sign(pickedInfo, PRIVATE_KEY, { expiresIn: JWT_EXIPRE });
                    res.status(200).send(token);
                }
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'login_failed'))];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/account', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var emailRegex, userDoc, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
                if (!emailRegex.test(req.body.email)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'invalid_email'))];
                }
                if (req.body.password.length < 8) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'password_too_short'))];
                }
                // Save user info
                req.body.password = crypto_1.default.createHash('sha256')
                    .update(req.body.email + req.body.password)
                    .digest('hex');
                return [4 /*yield*/, User.create(req.body)];
            case 1:
                userDoc = _a.sent();
                assert_1.default.ok(userDoc);
                res.sendStatus(201);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                if (err_2.code && err_2.code === 11000) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'duplicate_email'))];
                }
                else {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'register_failed'))];
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, userDoc, userInfo, pickedInfo, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, User.findById(req.user._id)];
            case 2:
                userDoc = _a.sent();
                assert_1.default.ok(userDoc);
                userInfo = userDoc.toJSON();
                pickedInfo = (function (_a) {
                    var _id = _a._id, email = _a.email, name = _a.name, isTeacher = _a.isTeacher, ownClasses = _a.ownClasses, classes = _a.classes;
                    return ({
                        _id: _id, email: email, name: name, isTeacher: isTeacher, ownClasses: ownClasses, classes: classes
                    });
                })(userInfo);
                res.status(200).send(pickedInfo);
                return [3 /*break*/, 4];
            case 3:
                err_3 = _a.sent();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'invalid_request'))];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/class', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, session, classDoc, userDoc, updatedUser, updatedClass, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!('class' in req.body)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'class_id_not_specified'))];
                }
                return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 9]);
                return [4 /*yield*/, Class.findById(req.body.class)];
            case 3:
                classDoc = _a.sent();
                assert_1.default.ok(classDoc);
                return [4 /*yield*/, User.findOne({
                        _id: req.user._id,
                        ownClasses: { $in: req.body.class }
                    })];
            case 4:
                userDoc = _a.sent();
                assert_1.default.ok(!userDoc);
                return [4 /*yield*/, User.updateOne({ _id: req.user._id }, { $addToSet: { classes: req.body.class } }, { session: session })];
            case 5:
                updatedUser = _a.sent();
                assert_1.default.ok(updatedUser && updatedUser.n >= 1);
                return [4 /*yield*/, Class.updateOne({ _id: req.body.class }, { $addToSet: { students: req.user._id } }, { session: session })];
            case 6:
                updatedClass = _a.sent();
                assert_1.default.ok(updatedClass && updatedClass.n >= 1);
                return [3 /*break*/, 9];
            case 7:
                err_4 = _a.sent();
                return [4 /*yield*/, session.abortTransaction()];
            case 8:
                _a.sent();
                session.endSession();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'adding_class_to_user_failed'))];
            case 9: return [4 /*yield*/, session.commitTransaction()];
            case 10:
                _a.sent();
                session.endSession();
                res.sendStatus(201);
                return [2 /*return*/];
        }
    });
}); });
router.delete('/class', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, session, classDoc, updatedUser, updatedClass, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!('class' in req.query)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'class_id_not_specified'))];
                }
                return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 6, , 8]);
                return [4 /*yield*/, Class.findById(req.query.class)];
            case 3:
                classDoc = _a.sent();
                assert_1.default.ok(classDoc);
                return [4 /*yield*/, User.updateOne({ _id: req.user._id }, { $pull: { classes: req.query.class } }, { session: session })];
            case 4:
                updatedUser = _a.sent();
                assert_1.default.ok(updatedUser && updatedUser.n >= 1);
                return [4 /*yield*/, Class.updateOne({ _id: req.query.class }, { $pull: { students: req.user._id } }, { session: session })];
            case 5:
                updatedClass = _a.sent();
                assert_1.default.ok(updatedClass && updatedClass.n >= 1);
                return [3 /*break*/, 8];
            case 6:
                err_5 = _a.sent();
                return [4 /*yield*/, session.abortTransaction()];
            case 7:
                _a.sent();
                session.endSession();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, 'removing_class_from_user_failed'))];
            case 8: return [4 /*yield*/, session.commitTransaction()];
            case 9:
                _a.sent();
                session.endSession();
                res.sendStatus(200);
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
