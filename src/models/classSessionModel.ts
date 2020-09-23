import mongoose from "mongoose";

export const classSessionModel = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    class: { type: mongoose.Schema.Types.ObjectId, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, required: true },
    userList: [{
        user: { type: mongoose.Schema.Types.ObjectId, required: true },
        socket: { type: String, required: true },
        name: { type: String, required: true },
        isTeacher: { type: Boolean, required: true },
        isSharingScreen: { type: Boolean, required: true }
    }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    status: {
        type: String, required: true,
        enum: ['offline', 'online']
    },
    quizes: [{ type: mongoose.Schema.Types.ObjectId }],
    chats: [{ type: mongoose.Schema.Types.ObjectId }],
})