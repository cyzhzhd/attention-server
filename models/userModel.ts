import mongoose from "mongoose";

export const userModel = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    isTeacher: { type: Boolean, required: true },
    classes: [{ type: mongoose.Schema.Types.ObjectId }]
})