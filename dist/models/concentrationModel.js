"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.concentrationModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.concentrationModel = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId },
    class: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, index: true },
    session: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, index: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, index: true },
    date: { type: Date, required: true },
    status: {
        attend: { type: Boolean, required: true },
        attendPer: { type: Number, required: true },
        sleep: { type: Boolean, required: true },
        sleepPer: { type: Number, required: true },
        focusPoint: { type: Number, required: true }
    }
});
