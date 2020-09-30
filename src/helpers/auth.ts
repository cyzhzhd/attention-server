import path from "path";
import assert from "assert";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as socketData from "../types/socketData";
import { Payload } from "../types/reqjwt";
import { userModel } from "../models/userModel";
import { classModel } from "../models/classModel";

dotenv.config({ path: path.join(__dirname, '../.env') });
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const Class = mongoose.model('Class', classModel);
const User = mongoose.model('User', userModel);

export async function authSessionConnection(data: socketData.Data):
    Promise<{ payload: Payload, isHost: boolean }> {
    const payload: Payload = jwt.verify(data.token, PRIVATE_KEY,
        { algorithms: ["HS256"] }) as Payload;

    const [classDoc, teacherDoc, studentDoc] = await Promise.all([
        // Check class and session exists
        new Promise<mongoose.Document | null>(async (resolve) => {
            const classDoc = await Class.findOne(
                {
                    _id: data.class,
                    session: data.session
                }
            );
            resolve(classDoc);
        }),
        // Check user class access
        new Promise<mongoose.Document | null>(async (resolve) => {
            const teacherDoc = await User.findOne(
                {
                    _id: payload._id,
                    ownClasses: { $in: data.class }
                }
            );
            resolve(teacherDoc);
        }),
        new Promise<mongoose.Document | null>(async (resolve) => {
            const studentDoc = await User.findOne(
                {
                    _id: payload._id,
                    classes: { $in: data.class }
                }
            );
            resolve(studentDoc);
        }),
    ])
    assert.ok(classDoc && (teacherDoc || studentDoc));
    return {
        payload: payload, isHost: !!teacherDoc
    };
}