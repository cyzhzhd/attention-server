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
var path_1 = __importDefault(require("path"));
var userModel_1 = require("../models/userModel");
var classModel_1 = require("../models/classModel");
var multipleChoiceQuiz_1 = require("../models/multipleChoiceQuiz");
var shortAnswerQuiz_1 = require("../models/shortAnswerQuiz");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
var router = express_1.default.Router();
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var Class = mongoose_1.default.model('Class', classModel_1.classModel);
var User = mongoose_1.default.model('User', userModel_1.userModel);
var MultipleChoiceQuiz = mongoose_1.default.model('MultipleChoiceQuiz', multipleChoiceQuiz_1.multipleChoiceQuizModel);
var ShortAnswerQuiz = mongoose_1.default.model('ShortAnswerQuiz', shortAnswerQuiz_1.shortAnswerQuizModel);
router.get('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req;
    return __generator(this, function (_a) {
        req = _req;
        // 아이디 명시되었는지 확인
        // 선생님 확인
        try {
            // 가져오기, 본인클래스, 소유여부 확인
            // 반환
        }
        catch (err) {
            // 에러수행
        }
        return [2 /*return*/];
    });
}); });
router.post('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req;
    return __generator(this, function (_a) {
        req = _req;
        // 클래스 명시되었는지 확인, 선생님 확인
        // 필요 정보 다 있는지 확인
        try {
            // 주객관식 확인 후 적합로직 수행
            // 본인 클래스 맞는지 확인
            // 추가
        }
        catch (err) {
            // 에러수행
        }
        return [2 /*return*/];
    });
}); });
router.delete('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var req;
    return __generator(this, function (_a) {
        req = _req;
        // 아이디 명시되었는지 확인
        // 선생님 확인
        try {
            // 삭제, 본인클래스, 소유여부 확인
        }
        catch (err) {
            // 에러수행
        }
        return [2 /*return*/];
    });
}); });
exports.default = router;
