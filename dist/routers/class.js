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
var mongoose_1 = __importDefault(require("mongoose"));
var express_jwt_1 = __importDefault(require("express-jwt"));
var dotenv_1 = __importDefault(require("dotenv"));
var assert_1 = __importDefault(require("assert"));
var path_1 = __importDefault(require("path"));
var userModel_1 = require("../models/userModel");
var classModel_1 = require("../models/classModel");
var errorHandler_1 = require("../helpers/errorHandler");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
var router = express_1.default.Router();
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var Class = mongoose_1.default.model('Class', classModel_1.classModel);
var User = mongoose_1.default.model('User', userModel_1.userModel);
router.get('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, classDoc, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!('id' in req.query)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "class_id_not_specified"))];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Class.findById(req.query.id)];
            case 2:
                classDoc = _a.sent();
                assert_1.default.ok(classDoc);
                res.status(200).send(classDoc);
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "class_found_failed"))];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, session, classDoc, updatedUser, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!req.user.isTeacher) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(401, "user_not_teacher"))];
                }
                return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 7]);
                // Create class and add teacher as owner
                req.body.teacher = req.user._id;
                return [4 /*yield*/, Class.create([req.body], { session: session })];
            case 3:
                classDoc = (_a.sent())[0];
                assert_1.default.ok(classDoc);
                return [4 /*yield*/, User.updateOne({ _id: req.user._id }, { $push: { ownClasses: classDoc._id } }, { session: session })];
            case 4:
                updatedUser = _a.sent();
                assert_1.default.ok(updatedUser && updatedUser.n >= 1);
                return [3 /*break*/, 7];
            case 5:
                err_2 = _a.sent();
                return [4 /*yield*/, session.abortTransaction()];
            case 6:
                _a.sent();
                session.endSession();
                if (err_2._message) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "invalid_request"))];
                }
                else {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(401, "class_creation_failed"))];
                }
                return [3 /*break*/, 7];
            case 7: return [4 /*yield*/, session.commitTransaction()];
            case 8:
                _a.sent();
                session.endSession();
                res.sendStatus(201);
                return [2 /*return*/];
        }
    });
}); });
// TODO remove all data related to class (if exists)
router.delete('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, session, toDelete, deletedClass, updatedUser, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!req.user.isTeacher) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(401, "user_not_teacher"))];
                }
                if (!('id' in req.query)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "class_id_not_specified"))];
                }
                return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 7]);
                toDelete = {
                    _id: req.query.id,
                    teacher: req.user._id,
                    session: null
                };
                return [4 /*yield*/, Class.deleteOne(toDelete, { session: session })];
            case 3:
                deletedClass = _a.sent();
                assert_1.default.ok(deletedClass.n && deletedClass.n >= 1);
                return [4 /*yield*/, User.updateMany({}, { $pull: { classes: req.query.id, ownClasses: req.query.id }, }, { session: session })];
            case 4:
                updatedUser = _a.sent();
                assert_1.default.ok(updatedUser.n && updatedUser.n >= 1);
                return [3 /*break*/, 7];
            case 5:
                err_3 = _a.sent();
                return [4 /*yield*/, session.abortTransaction()];
            case 6:
                _a.sent();
                session.endSession();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "class_deletion_failed"))];
            case 7: return [4 /*yield*/, session.commitTransaction()];
            case 8:
                _a.sent();
                session.endSession();
                res.sendStatus(200);
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
