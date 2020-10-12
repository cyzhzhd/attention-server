import mongoose from "mongoose";

export const multipleChoiceQuizModel = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    tags: [{ type: String }],
    description: { type: String, required: true },
    choices: [{ type: String, required: true }],
    answer: { type: Number, required: true }
})