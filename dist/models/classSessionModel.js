"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classSessionModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.classSessionModel = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId },
    class: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    teacher: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    teacherName: { type: String, required: true },
    userList: [{
            user: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
            socket: { type: String, required: true },
            name: { type: String, required: true },
            isTeacher: { type: Boolean, required: true },
            isSharingScreen: { type: Boolean, required: true }
        }],
    scheduledStartTime: { type: Date, required: true },
    scheduledEndTime: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    status: {
        type: String, required: true,
        enum: ['offline', 'online']
    },
    quizes: [{ type: mongoose_1.default.Schema.Types.ObjectId }]
});
