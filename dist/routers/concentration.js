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
var classModel_1 = require("../models/classModel");
var classSessionModel_1 = require("../models/classSessionModel");
var concentrationModel_1 = require("../models/concentrationModel");
var errorHandler_1 = require("../helpers/errorHandler");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
var router = express_1.default.Router();
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var Concentration = mongoose_1.default.model('Concentration', concentrationModel_1.concentrationModel);
var ClassSession = mongoose_1.default.model('ClassSession', classSessionModel_1.classSessionModel);
var Class = mongoose_1.default.model('Class', classModel_1.classModel);
router.get('/session', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, classSessionDoc, concentrationDocs, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!req.user.isTeacher) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "user_not_teacher"))];
                }
                if (!('session' in req.query)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "session_id_not_specified"))];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                classSessionDoc = ClassSession.findOne({
                    _id: req.query.session,
                    teacher: req.user._id
                });
                assert_1.default.ok(classSessionDoc);
                return [4 /*yield*/, Concentration.find({
                        session: req.query.session
                    })];
            case 2:
                concentrationDocs = _a.sent();
                assert_1.default.ok(concentrationDocs);
                res.status(200).send(concentrationDocs);
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "concentration_found_failed"))];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get('/class', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, classDoc, concentrationDocs, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!req.user.isTeacher) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "user_not_teacher"))];
                }
                if (!('class' in req.query)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "class_id_not_specified"))];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, Class.findOne({
                        _id: req.query.class,
                        teacher: req.user._id,
                    })];
            case 2:
                classDoc = _a.sent();
                assert_1.default.ok(classDoc);
                return [4 /*yield*/, Concentration.aggregate([
                        {
                            $group: {
                                class: req.query.class,
                                avgAttend: { $avg: "$status.attend" },
                                avgAttendPer: { $avg: "$status.attendPer" },
                                avgSleep: { $avg: "$status.sleep" },
                                avgSleepPer: { $avg: "$status.sleepPer" },
                                avgFocusPoint: { $avg: "$status.focusPoint" }
                            }
                        }
                    ])];
            case 3:
                concentrationDocs = _a.sent();
                assert_1.default.ok(concentrationDocs);
                res.status(200).send(concentrationDocs);
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "concentration_found_failed"))];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.get('/user', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req, concentrationDocs, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = _req;
                if (!('session' in req.query)) {
                    return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "session_id_not_specified"))];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Concentration.find({
                        user: req.user._id,
                        session: req.query.session
                    })];
            case 2:
                concentrationDocs = _a.sent();
                assert_1.default.ok(concentrationDocs);
                res.status(200).send(concentrationDocs);
                return [3 /*break*/, 4];
            case 3:
                err_3 = _a.sent();
                return [2 /*return*/, next(new errorHandler_1.ErrorHandler(400, "concentration_found_failed"))];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
