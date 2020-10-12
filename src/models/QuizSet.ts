import mongoose from "mongoose";

export const QuizSetModel = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    tags: [{ type: String }],
    description: { type: String, required: true },
    quizzes: [{ type: mongoose.Schema.Types.ObjectId }]
})