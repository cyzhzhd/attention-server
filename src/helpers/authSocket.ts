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

    const [classDoc, userDoc] = await Promise.all([
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
            const userDoc = await User.findOne(
                {
                    _id: payload._id,
                }
            );
            resolve(userDoc);
        }),
    ])
    assert.ok(classDoc && userDoc);

    const userJson = userDoc.toJSON();
    const ownClasses = userJson.ownClasses.map(String);
    const classes = userJson.classes.map(String);
    assert.ok(ownClasses.includes(data.class) || classes.includes(data.class));
    return {
        payload: payload, isHost: !!ownClasses.includes(data.class)
    };
}