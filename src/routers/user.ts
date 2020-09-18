// TODO modify jwt remains valid after user deletion
import express from "express";
import expressjwt from "express-jwt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import assert from "assert";
import { userModel } from "../models/userModel";
import { classModel } from "../models/classModel"
import { ReqJwt } from "../types/reqjwt"
import { ErrorHandler } from "../helpers/errorHandler";

dotenv.config();
const router = express.Router();
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const JWT_EXIPRE = process.env.JWTEXPIRE as string;

const User = mongoose.model('User', userModel);
const Class = mongoose.model('Class', classModel);

// TODO encrypt JWT with public key
router.post('/login', async (req, res, next) => {
    if (!('email' in req.body) || !('password' in req.body)) {
        return next(new ErrorHandler(401, 'need_email_and_password'));
    }

    try {
        const user = await User.findOne(req.body);
        if (user === null) {
            return next(new ErrorHandler(401, 'invalid_email_and_password'));
        }
        else {
            const usrInfo = user.toJSON();
            delete usrInfo.password;
            const token = jwt.sign(usrInfo, PRIVATE_KEY,
                { expiresIn: JWT_EXIPRE });
            res.status(200).send(token);
        }
    } catch (err) {
        return next(new ErrorHandler(400, 'login_failed'));
    }
})

// TODO request regex check of email
router.post('/account', async (req, res, next) => {
    try {
        const doc = await User.create(req.body);
        assert.ok(doc);

        res.sendStatus(200);
    } catch (err) {
        if (err._message) {
            return next(new ErrorHandler(400, 'invalid_request'));
        }
        else if (err.code === 11000) {
            return next(new ErrorHandler(400, 'duplicate_email'));
        }
        else {
            return next(new ErrorHandler(400, 'register_failed'));
        }
    }
})

router.post('/class', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!('id' in req.body)) {
            return next(new ErrorHandler(400, 'class_id_not_specified'));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const classDoc = await Class.findById(req.body.id);
            assert.ok(classDoc);

            // Teacher can't add own class
            const userDoc = await User.findOne(
                {
                    _id: req.user._id,
                    ownClasses: { $in: req.body.id }
                }
            );
            assert.ok(!userDoc);

            const updateUser = await User.updateOne(
                { _id: req.user._id },
                { $addToSet: { classes: req.body.id } },
                { session: session }
            );
            assert(updateUser && updateUser.n >= 1);

            const updateClass = await Class.updateOne(
                { _id: req.body.id },
                { $addToSet: { students: req.user._id } },
                { session: session }
            );
            assert(updateClass && updateClass.n >= 1);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(400, 'adding_class_to_user_failed'));
        }

        await session.commitTransaction();
        session.endSession();
        res.sendStatus(200);
    })

router.delete('/class', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!('id' in req.query)) {
            return next(new ErrorHandler(400, 'class_id_not_specified'));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const doc = await Class.findById(req.query.id);
            assert.ok(doc);

            const updateUser = await User.updateOne(
                { _id: req.user._id },
                { $pull: { classes: req.query.id } },
                { session: session }
            );
            assert(updateUser && updateUser.n >= 1);

            const updateClass = await Class.updateOne(
                { _id: req.query.id },
                { $pull: { students: req.user._id } },
                { session: session }
            );
            assert(updateClass && updateClass.n >= 1);
        } catch (err) {
            console.log("abort!!!!");
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(400, 'removing_class_from_user_failed'));
        }

        await session.commitTransaction();
        session.endSession();
        res.sendStatus(200);
    })

export default router;