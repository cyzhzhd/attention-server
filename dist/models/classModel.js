"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.classModel = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId },
    name: { type: String, required: true },
    tags: [{ type: String }],
    status: {
        type: String, required: true,
        enum: ['offline', 'online'], default: "offline"
    },
    session: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
    notice: { type: String },
    schedules: [{ date: Date, content: String }],
    quizSets: [{ type: mongoose_1.default.Schema.Types.ObjectId }],
    teacher: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    teacherName: { type: String, required: true },
    students: [{ type: mongoose_1.default.Schema.Types.ObjectId }],
    classType: {
        type: String, required: true,
        enum: ['public', 'private']
    }
});
