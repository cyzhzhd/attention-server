"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var morgan_1 = __importDefault(require("morgan"));
var path_1 = __importDefault(require("path"));
var dotenv_1 = __importDefault(require("dotenv"));
var user_1 = __importDefault(require("./routers/user"));
var class_1 = __importDefault(require("./routers/class"));
var concentration_1 = __importDefault(require("./routers/concentration"));
var session_1 = __importDefault(require("./routers/session"));
var quiz_1 = __importDefault(require("./routers/quiz"));
var errorHandler_1 = require("./helpers/errorHandler");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
var ENV = process.env.ENV;
var app = express_1.default();
// handle cors, cors preflight
app.options('*', cors_1.default());
app.use(cors_1.default());
var format = (ENV == "DEV") ? "dev" : "common";
app.use(morgan_1.default(format));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', function (req, res) {
    res.status(200).send("server is working");
});
app.use("/user", user_1.default);
app.use("/class", class_1.default);
app.use("/session", session_1.default);
app.use("/concentration", concentration_1.default);
app.use("/quiz", quiz_1.default);
app.use("/download", express_1.default.static(path_1.default.join(__dirname, "../static")));
app.use(errorHandler_1.undefinedMethodHandler);
app.use(errorHandler_1.errorHandler);
module.exports = app;
