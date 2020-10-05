import mongoose from "mongoose";

export const concentrationModel = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    class: { type: mongoose.Schema.Types.ObjectId, required: true },
    session: { type: mongoose.Schema.Types.ObjectId, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: Date, required: true },
    status: {
        absence: { type: Number, required: true },
        sleep: { type: Number, required: true },
        turnHead: { type: Number, required: true },
        focusPoint: { type: Number, required: true },
    }
})