import express from "express";
import mongoose from "mongoose";
import expressjwt from "express-jwt";
import dotenv from "dotenv";
import { classModel } from "../models/classModel"
import { ReqJwt } from "../types/reqjwt"

dotenv.config();
const router = express.Router();
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const Class = mongoose.model('Class', classModel);

// TODO encrypt JWT with public key
router.post('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    (_req, res) => {
        const req = _req as ReqJwt;
        if (!req.user.isTeacher) {
            res.status(400).send("User is not a teacher");
            return;
        }
        req.body.teacher = req.user._id;
        Class.insertMany(req.body, (err) => {
            if (err === null) {
                res.sendStatus(200).end();
            }
            else if (err._message) {
                res.status(400).send(err._message);
            }
            else if (err.code) {
                res.status(400)
                    .send("MongoDB Error Code: " + err.code.toString());
            }
            else {
                res.status(400).send("Class creation failed");
            }

        });
    })

// TODO request regex check of email
router.delete('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    (_req, res) => {
        const req = _req as ReqJwt;
        if (!req.user.isTeacher) {
            res.status(400).send("User is not a teacher");
            return;
        }

        if (!('id' in req.query)) {
            res.status(400).send("Class ID not specified");
            return;
        }

        const toDelete = {
            _id: req.query.id,
            teacher: req.user._id
        }

        Class.deleteOne(toDelete, (err) => {
            if (err === null) {
                res.sendStatus(200).end();
            }
            else {
                res.status(400).send("Class deletion failed");
            }
        });
    })


export default router;