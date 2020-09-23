import mongoose from "mongoose";

export const chatModel = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    date: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId },
    content: { type: String }
})