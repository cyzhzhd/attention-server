"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classSessionModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.classSessionModel = new mongoose_1.default.Schema({
    id: mongoose_1.default.Schema.Types.ObjectId,
    class: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    teacher: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    enterTimes: [{
            date: Date,
            user: mongoose_1.default.Schema.Types.ObjectId
        }],
    quitTimes: [{
            date: Date,
            user: mongoose_1.default.Schema.Types.ObjectId
        }],
    quizes: [{ type: mongoose_1.default.Schema.Types.ObjectId }],
    chats: [{
            date: Date,
            user: mongoose_1.default.Schema.Types.ObjectId,
            content: String
        }]
});
