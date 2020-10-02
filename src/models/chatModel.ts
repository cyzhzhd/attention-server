import mongoose from "mongoose";

export const chatModel = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    session: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true }
})