import mongoose from "mongoose";

export const classSessionModel = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    class: { type: mongoose.Schema.Types.ObjectId, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    enterTimes: [{
        date: Date,
        user: mongoose.Schema.Types.ObjectId
    }],
    quitTimes: [{
        date: Date,
        user: mongoose.Schema.Types.ObjectId
    }],
    quizes: [{ type: mongoose.Schema.Types.ObjectId }],
    chats: [{
        date: Date,
        user: mongoose.Schema.Types.ObjectId,
        content: String
    }]
})