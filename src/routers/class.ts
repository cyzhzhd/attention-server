import express from "express";
import mongoose from "mongoose";
import expressjwt from "express-jwt";
import dotenv from "dotenv";
import assert from "assert";
import path from "path";
import { userModel } from "../models/userModel";
import { classModel } from "../models/classModel";
import { classSessionModel } from "../models/classSessionModel";
import { ReqJwt } from "../types/reqjwt";
import { ErrorHandler } from "../helpers/errorHandler";

dotenv.config({ path: path.join(__dirname, '../../.env') });
const router = express.Router();
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const ClassSession = mongoose.model('ClassSession', classSessionModel);
const Class = mongoose.model('Class', classModel);
const User = mongoose.model('User', userModel);

router.get('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!('class' in req.query)) {
            return next(new ErrorHandler(400, "class_id_not_specified"));
        }

        try {
            const classDoc = await Class.findById(req.query.class);
            assert.ok(classDoc);

            res.status(200).send(classDoc);
        } catch (err) {
            return next(new ErrorHandler(400, "class_found_failed"));
        }
    });

router.get('/user', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(400, "user_not_teacher"));
        }
        if (!('class' in req.query) || !('user' in req.query)) {
            return next(new ErrorHandler(400, "user_or_class_id_not_specified"));
        }

        try {
            // check class ownership, check user in class
            const classDoc = await Class.findOne({
                _id: req.query.class,
                teacher: req.user._id,
                students: { $in: req.query.user }
            });
            assert.ok(classDoc);

            const userDoc = await User.findById(req.query.user)
                .select('_id email name');
            assert.ok(userDoc);

            res.status(200).send(userDoc);
        } catch (err) {
            return next(new ErrorHandler(400, "user_found_failed"));
        }
    });

router.get('/users', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(400, "user_not_teacher"));
        }
        if (!('class' in req.query)) {
            return next(new ErrorHandler(400, "class_id_not_specified"));
        }

        try {
            // check class ownership, check user in class
            const classDoc = await Class.findOne({
                _id: req.query.class,
                teacher: req.user._id
            });
            assert.ok(classDoc);

            const userDocs = await User.find({
                classes: { $in: req.query.class }
            }).select('_id email name');
            assert.ok(userDocs);

            res.status(200).send(userDocs);
        } catch (err) {
            return next(new ErrorHandler(400, "user_found_failed"));
        }
    });

router.get('/sessions', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!('class' in req.query)) {
            return next(new ErrorHandler(400, "class_id_not_specified"));
        }

        try {
            if (req.user.isTeacher) {
                // if user teacher
                const ClassSessionDocs = await ClassSession.find({
                    class: req.query.class,
                    teacher: req.user._id,
                })
                assert.ok(ClassSessionDocs);
                res.status(200).send(ClassSessionDocs);
            }
            else {
                // if user is student 
                const userDoc = await User.findOne(
                    {
                        _id: req.user._id,
                        ownClasses: { $in: req.query.class }
                    }
                );
                assert.ok(userDoc)
                const ClassSessionDocs = await ClassSession.find({
                    class: req.query.class,
                })
                assert.ok(ClassSessionDocs);
                res.status(200).send(ClassSessionDocs);
            }
        } catch (err) {
            return next(new ErrorHandler(400, "session_found_failed"));
        }
    });

router.post('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(400, "user_not_teacher"));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create class and add teacher as owner
            req.body.teacher = req.user._id;
            req.body.teacherName = req.user.name;
            const [classDoc] = await Class.create([req.body],
                { session: session }) as unknown as Array<mongoose.Document>;
            assert.ok(classDoc)

            const updatedUser = await User.updateOne(
                { _id: req.user._id },
                { $push: { ownClasses: classDoc._id } },
                { session: session }
            );
            assert.ok(updatedUser && updatedUser.n >= 1);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(400, "class_creation_failed"));
        }

        await session.commitTransaction();
        session.endSession();
        res.sendStatus(201);
    });

// TODO remove all data related to class (if exists) - REMOVE QUIZZES
router.delete('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(400, "user_not_teacher"));
        }
        if (!('class' in req.query)) {
            return next(new ErrorHandler(400, "class_id_not_specified"));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Remove class(with no session ongoing) and related data
            const deletedClass = await Class.deleteOne({
                _id: req.query.class,
                teacher: req.user._id,
                session: null
            }, { session: session });
            assert.ok(deletedClass.n && deletedClass.n >= 1)

            const updatedUser = await User.updateMany({},
                { $pull: { classes: req.query.class, ownClasses: req.query.class }, },
                { session: session });
            assert.ok(updatedUser.n && updatedUser.n >= 1);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(400, "class_deletion_failed"));
        }

        await session.commitTransaction();
        session.endSession();
        res.sendStatus(200);
    });

export default router;