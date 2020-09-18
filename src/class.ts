import express from "express";
import mongoose from "mongoose";
import expressjwt from "express-jwt";
import dotenv from "dotenv";
import assert from "assert";
import { userModel } from "../models/userModel";
import { classModel } from "../models/classModel"
import { ReqJwt } from "../types/reqjwt"
import { ErrorHandler } from "./errorHandler";


dotenv.config();
const router = express.Router();
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const Class = mongoose.model('Class', classModel);
const User = mongoose.model('User', userModel);

router.get('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!('id' in req.query)) {
            return next(new ErrorHandler(400, "class_id_not_specified"));
        }

        try {
            const found = await Class.findById(req.query.id);
            assert.ok(found);

            res.status(200).send(found);
        } catch (err) {
            return next(new ErrorHandler(400, "class_found_failed"));
        }

    })

// TODO encrypt JWT with public key
router.post('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(401, "user_not_teacher"));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            req.body.teacher = req.user._id;
            const [newClass] = await Class.create([req.body],
                { session: session }) as unknown as Array<mongoose.Document>;
            assert.ok(newClass);

            const update = await User.updateOne(
                { _id: req.user._id },
                { $push: { ownClasses: newClass._id } },
                { session: session }
            );
            assert(update && update.n >= 1);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            if (err._message) {
                return next(new ErrorHandler(400, "invalid_request"));
            }
            else {
                return next(new ErrorHandler(401, "class_creation_failed"));
            }
        }

        await session.commitTransaction();
        session.endSession();
        res.sendStatus(200);
    });

// TODO remove all data related to class
router.delete('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(401, "user_not_teacher"));
        }
        if (!('id' in req.query)) {
            return next(new ErrorHandler(400, "class_id_not_specified"));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const toDelete = {
                _id: req.query.id,
                teacher: req.user._id
            }
            const deletion = await Class.deleteOne(toDelete, { session: session });
            assert(deletion.n && deletion.n >= 1);

            const update = await User.updateMany({},
                { $pull: { classes: req.query.id, ownClasses: req.query.id }, },
                { session: session });
            assert(update.n && update.n >= 1);
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