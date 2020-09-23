"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.chatModel = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId },
    date: { type: Date },
    user: { type: mongoose_1.default.Schema.Types.ObjectId },
    content: { type: String }
});
