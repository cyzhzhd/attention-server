"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortAnswerQuizModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.shortAnswerQuizModel = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId },
    name: { type: String, required: true },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    tags: [{ type: String }],
    description: { type: String, required: true },
    answer: [{ type: String, required: true }]
});
