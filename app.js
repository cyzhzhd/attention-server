"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var morgan_1 = __importDefault(require("morgan"));
var user_1 = __importDefault(require("./src/user"));
var auth_1 = __importDefault(require("./src/auth"));
var class_1 = __importDefault(require("./src/class"));
var app = express_1.default();
app.use(morgan_1.default("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/user', user_1.default);
app.use('/auth', auth_1.default);
app.use('/class', class_1.default);
// app.use("/api/firebase", firebaseRouter);
module.exports = app;
