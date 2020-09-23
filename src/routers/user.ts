import express from "express";
import expressjwt from "express-jwt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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
// TODO JWT refreshing mechanism
router.post('/login', async (req, res, next) => {
    if (!('email' in req.body) || !('password' in req.body)) {
        return next(new ErrorHandler(401, 'need_email_and_password'));
    }

    try {
        req.body.password = crypto.createHash('sha256')
            .update(req.body.email + req.body.password)
            .digest('hex');
        const userDoc = await User.findOne(req.body);
        if (userDoc === null) {
            return next(new ErrorHandler(401, 'invalid_email_and_password'));
        }
        else {
            // Send JWT with picked information as payload
            const userInfo = userDoc.toJSON();
            const pickedInfo = (({ _id, email, name, isTeacher }) =>
                ({ _id, email, name, isTeacher }))(userInfo);
            const token = jwt.sign(pickedInfo, PRIVATE_KEY,
                { expiresIn: JWT_EXIPRE });
            res.status(200).send(token);
        }
    } catch (err) {
        return next(new ErrorHandler(400, 'login_failed'));
    }
})

router.post('/account', async (req, res, next) => {
    try {
        // Validate email and password
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(req.body.email)) {
            return next(new ErrorHandler(400, 'invalid_email'));
        }
        if (req.body.password.length < 8) {
            return next(new ErrorHandler(400, 'password_too_short'));
        }

        // Save user info
        req.body.password = crypto.createHash('sha256')
            .update(req.body.email + req.body.password)
            .digest('hex');
        const userDoc = await User.create(req.body);
        assert.ok(userDoc);

        res.sendStatus(201);
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

router.get('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        try {
            const userDoc = await User.findById(req.user._id);
            assert.ok(userDoc);

            const userInfo = userDoc.toJSON();
            const pickedInfo =
                (({ _id, email, name, isTeacher, ownClasses, classes }) =>
                    ({
                        _id, email, name, isTeacher, ownClasses, classes
                    }))(userInfo);
            res.status(200).send(pickedInfo);
        } catch (err) {
            return next(new ErrorHandler(400, 'invalid_request'));
        }
    })

router.post('/class', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!('class' in req.body)) {
            return next(new ErrorHandler(400, 'class_id_not_specified'));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check class existence
            const classDoc = await Class.findById(req.body.class);
            assert.ok(classDoc);

            const userDoc = await User.findOne(
                {
                    _id: req.user._id,
                    ownClasses: { $in: req.body.class }
                }
            );
            assert.ok(!userDoc);

            // Update user class list
            const updatedUser = await User.updateOne(
                { _id: req.user._id },
                { $addToSet: { classes: req.body.class } },
                { session: session }
            );
            assert.ok(updatedUser && updatedUser.n >= 1);

            const updatedClass = await Class.updateOne(
                { _id: req.body.class },
                { $addToSet: { students: req.user._id } },
                { session: session }
            );
            assert.ok(updatedClass && updatedClass.n >= 1);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(400, 'adding_class_to_user_failed'));
        }

        await session.commitTransaction();
        session.endSession();
        res.sendStatus(201);
    })

router.delete('/class', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!('class' in req.query)) {
            return next(new ErrorHandler(400, 'class_id_not_specified'));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check class existence
            const classDoc = await Class.findById(req.query.class);
            assert.ok(classDoc);

            // Delete from User class list
            const updatedUser = await User.updateOne(
                { _id: req.user._id },
                { $pull: { classes: req.query.class } },
                { session: session }
            );
            assert.ok(updatedUser && updatedUser.n >= 1);

            const updatedClass = await Class.updateOne(
                { _id: req.query.class },
                { $pull: { students: req.user._id } },
                { session: session }
            );
            assert.ok(updatedClass && updatedClass.n >= 1);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(400, 'removing_class_from_user_failed'));
        }

        await session.commitTransaction();
        session.endSession();
        res.sendStatus(200);
    })

export default router;