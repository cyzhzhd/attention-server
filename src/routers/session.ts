import express from "express";
import mongoose from "mongoose";
import expressjwt from "express-jwt";
import dotenv from "dotenv";
import assert from "assert";
import path from "path";
import { ReqJwt } from "../types/reqjwt";
import { userModel } from "../models/userModel";
import { classModel } from "../models/classModel"
import { classSessionModel } from "../models/classSessionModel";
import { ErrorHandler } from "../helpers/errorHandler";

dotenv.config({ path: path.join(__dirname, '../../.env') });
const router = express.Router();
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const Class = mongoose.model('Class', classModel);
const User = mongoose.model('User', userModel);
const ClassSession = mongoose.model('ClassSession', classSessionModel);

router.get('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!('class' in req.query) || !('session' in req.query)) {
            return next(new ErrorHandler(400, "class_or_session_id_not_specified"));
        }

        try {
            const [teacherDoc, studentDoc] = await Promise.all([
                // Check user class access
                new Promise<mongoose.Document | null>(async (resolve) => {
                    const teacherDoc = await User.findOne(
                        {
                            _id: req.user._id,
                            ownClasses: { $in: req.query.class }
                        }
                    );
                    resolve(teacherDoc);
                }),
                new Promise<mongoose.Document | null>(async (resolve) => {
                    const studentDoc = await User.findOne(
                        {
                            _id: req.user._id,
                            classes: { $in: req.query.class }
                        }
                    );
                    resolve(studentDoc);
                }),
            ])
            assert.ok(teacherDoc || studentDoc);

            const classSessionDoc = await ClassSession.findById(req.query.session);
            assert.ok(classSessionDoc);

            res.status(200).send(classSessionDoc);
        } catch (err) {
            return next(new ErrorHandler(400, "session_found_failed"));
        }

    });

router.post('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(401, "user_not_teacher"));
        }
        if (!('class' in req.body)) {
            return next(new ErrorHandler(400, 'class_id_not_specified'));
        }
        if (req.body.scheduledStartTime > req.body.scheduledEndTime) {
            return next(new ErrorHandler(400, "invalid_time_settings"));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check user owns class
            const userDoc = await User.findOne(
                {
                    _id: req.user._id,
                    ownClasses: { $in: req.body.class }
                }
            );
            assert.ok(userDoc);

            // Start session
            req.body.teacher = req.user._id;
            req.body.teacherName = req.user.name;
            req.body.startTime = Date.now();
            req.body.status = "online";
            const [classDoc] = await ClassSession.create([req.body],
                { session: session }) as unknown as Array<mongoose.Document>;
            assert.ok(classDoc);

            const updatedClass = await Class.updateOne(
                { _id: req.body.class, status: "offline" },
                { status: "online", session: classDoc._id },
                { session: session }
            );
            assert.ok(updatedClass && updatedClass.n >= 1);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            if (err._message) {
                return next(new ErrorHandler(400, "invalid_request"));
            }
            else {
                return next(new ErrorHandler(401, "session_start_failed"));
            }
        }

        await session.commitTransaction();
        session.endSession();
        res.sendStatus(201);
    });


router.delete('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(401, "user_not_teacher"));
        }
        if (!('class' in req.query) || !('session' in req.query)) {
            return next(new ErrorHandler(400, "class_or_session_id_not_specified"));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check user owns class
            const userDoc = await User.findOne(
                {
                    _id: req.user._id,
                    ownClasses: { $in: req.query.class }
                }
            );
            assert.ok(userDoc);

            // TODO kick remaining user
            // End session
            const updatedSession = await ClassSession.updateOne(
                { _id: req.query.session, status: "online" },
                { status: "offline", endTime: Date.now(), userList: null },
                { session: session }
            );
            assert.ok(updatedSession && updatedSession.n >= 1);

            const updatedClass = await Class.updateOne(
                { _id: req.query.class, status: "online" },
                { status: "offline", session: null },
                { session: session }
            );
            assert.ok(updatedClass && updatedClass.n >= 1);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(400, "session_termination_failed"));
        }

        await session.commitTransaction();
        session.endSession();
        res.sendStatus(200);
    });

export default router;