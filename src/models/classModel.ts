import mongoose from "mongoose";

export const classModel = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    tag: [{ type: String }],
    status: {
        type: String, required: true,
        enum: ['offline', 'online'], default: "offline"
    },
    session: { type: mongoose.Schema.Types.ObjectId, default: null },
    notice: { type: String },
    schedules: [{ date: Date, body: String }],
    quizSets: [{ type: mongoose.Schema.Types.ObjectId }],
    teacher: { type: mongoose.Schema.Types.ObjectId, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId }],
    class_type: {
        type: String, required: true,
        enum: ['public', 'private']
    }
})