import mongoose from "mongoose";

export const concentrationModel = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    class: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    session: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    date: { type: Date, required: true },
    status: {
        attend: { type: Boolean, required: true },
        attendPer: { type: Number, required: true },
        sleep: { type: Boolean, required: true },
        sleepPer: { type: Number, required: true },
        focusPoint: { type: Number, required: true }
    }
})