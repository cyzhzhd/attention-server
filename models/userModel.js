"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.userModel = new mongoose_1.default.Schema({
    id: mongoose_1.default.Schema.Types.ObjectId,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    isTeacher: { type: Boolean, required: true },
    ownClasses: [{ type: mongoose_1.default.Schema.Types.ObjectId }],
    classes: [{ type: mongoose_1.default.Schema.Types.ObjectId }]
});
