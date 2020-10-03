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
exports.authSessionConnection = void 0;
var path_1 = __importDefault(require("path"));
var assert_1 = __importDefault(require("assert"));
var dotenv_1 = __importDefault(require("dotenv"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var mongoose_1 = __importDefault(require("mongoose"));
var userModel_1 = require("../models/userModel");
var classModel_1 = require("../models/classModel");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var Class = mongoose_1.default.model('Class', classModel_1.classModel);
var User = mongoose_1.default.model('User', userModel_1.userModel);
function authSessionConnection(data) {
    return __awaiter(this, void 0, void 0, function () {
        var payload, _a, classDoc, userDoc, userJson, ownClasses, classes;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    payload = jsonwebtoken_1.default.verify(data.token, PRIVATE_KEY, { algorithms: ["HS256"] });
                    return [4 /*yield*/, Promise.all([
                            // Check class and session exists
                            new Promise(function (resolve) {
                                Class.findOne({
                                    _id: data.class,
                                    session: data.session
                                }).then(function (classDoc) { resolve(classDoc); });
                            }),
                            // Check user class access
                            new Promise(function (resolve) {
                                User.findOne({
                                    _id: payload._id,
                                }).then(function (userDoc) { resolve(userDoc); });
                            }),
                        ])];
                case 1:
                    _a = _b.sent(), classDoc = _a[0], userDoc = _a[1];
                    assert_1.default.ok(classDoc && userDoc);
                    userJson = userDoc.toJSON();
                    ownClasses = userJson.ownClasses.map(String);
                    classes = userJson.classes.map(String);
                    assert_1.default.ok(ownClasses.includes(data.class) || classes.includes(data.class));
                    return [2 /*return*/, {
                            payload: payload, isHost: !!ownClasses.includes(data.class)
                        }];
            }
        });
    });
}
exports.authSessionConnection = authSessionConnection;
