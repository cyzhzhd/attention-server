import express from "express";
import mongoose from "mongoose";
import expressjwt from "express-jwt";
import dotenv from "dotenv";
import assert from "assert";
import path from "path";
import { classModel } from "../models/classModel";
import { classSessionModel } from "../models/classSessionModel";
import { concentrationModel } from "../models/concentrationModel";
import { ReqJwt } from "../types/reqjwt";
import { ErrorHandler } from "../helpers/errorHandler";

dotenv.config({ path: path.join(__dirname, '../../.env') });
const router = express.Router();
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const Concentration = mongoose.model('Concentration', concentrationModel);
const ClassSession = mongoose.model('ClassSession', classSessionModel);
const Class = mongoose.model('Class', classModel);

router.get('/session', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(400, "user_not_teacher"));
        }
        if (!('session' in req.query)) {
            return next(new ErrorHandler(400, "session_id_not_specified"));
        }

        try {
            const classSessionDoc = ClassSession.findOne({
                _id: req.query.session,
                teacher: req.user._id
            })
            assert.ok(classSessionDoc);

            const concentrationDocs = await Concentration.find({
                session: req.query.session
            });
            assert.ok(concentrationDocs);

            res.status(200).send(concentrationDocs);
        } catch (err) {
            return next(new ErrorHandler(400, "concentration_found_failed"));
        }
    });

router.get('/class', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!req.user.isTeacher) {
            return next(new ErrorHandler(400, "user_not_teacher"));
        }
        if (!('class' in req.query)) {
            return next(new ErrorHandler(400, "class_id_not_specified"));
        }

        try {
            const classDoc = await Class.findOne({
                _id: req.query.class,
                teacher: req.user._id,
            });
            assert.ok(classDoc);

            const concentrationDocs = await Concentration.aggregate([
                {
                    $match: {
                        class: req.query.class,
                    },
                    $group: {
                        _id: null,
                        avgAttend: { $avg: { $toInt: "$status.attend" } },
                        avgAttendPer: { $avg: "$status.attendPer" },
                        avgSleep: { $avg: { $toInt: "$status.sleep" } },
                        avgSleepPer: { $avg: "$status.sleepPer" },
                        avgFocusPoint: { $avg: "$status.focusPoint" }
                    }
                }
            ]);
            assert.ok(concentrationDocs);

            res.status(200).send(concentrationDocs);
        } catch (err) {
            return next(new ErrorHandler(400, "concentration_found_failed"));
        }
    });

router.get('/user', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        if (!('session' in req.query)) {
            return next(new ErrorHandler(400, "session_id_not_specified"));
        }

        try {
            const concentrationDocs = await Concentration.find({
                user: req.user._id,
                session: req.query.session
            });
            assert.ok(concentrationDocs);

            res.status(200).send(concentrationDocs);
        } catch (err) {
            return next(new ErrorHandler(400, "concentration_found_failed"));
        }
    });

export default router;
