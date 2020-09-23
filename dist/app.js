"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var express_1 = __importDefault(require("express"));
var morgan_1 = __importDefault(require("morgan"));
// import authRouter from "./routers/auth";
var user_1 = __importDefault(require("./routers/user"));
var class_1 = __importDefault(require("./routers/class"));
var session_1 = __importDefault(require("./routers/session"));
var errorHandler_1 = require("./helpers/errorHandler");
var app = express_1.default();
app.use(morgan_1.default("dev"));
app.use(morgan_1.default('common', {
    stream: fs_1.default.createWriteStream('./access.log', { flags: 'a' })
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.use('/auth', authRouter);
app.use('/user', user_1.default);
app.use('/class', class_1.default);
app.use('/session', session_1.default);
app.use(errorHandler_1.undefinedMethodHandler);
app.use(errorHandler_1.errorHandler);
module.exports = app;
