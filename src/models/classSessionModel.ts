import mongoose from "mongoose";

export const classSessionModel = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, required: true },
    teacherName: { type: String, required: true },
    userList: [{
        user: { type: mongoose.Schema.Types.ObjectId, required: true },
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
    quizzes: [{ type: mongoose.Schema.Types.ObjectId }]
})