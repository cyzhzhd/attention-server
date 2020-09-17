// TODO modify jwt remains valid after user deletion
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userModel } from "../models/userModel"

dotenv.config();
const router = express.Router();
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const JWT_EXIPRE = process.env.JWTEXPIRE as string;

const User = mongoose.model('User', userModel);

// TODO encrypt JWT with public key
router.post('/login', (req, res) => {
    if (!('email' in req.body) || !('password' in req.body)) {
        res.status(400).send('Need both email and password');
        return;
    }

    User.findOne(req.body, (err, usr) => {
        if (err === null) {
            if (usr === null) {
                res.status(400).send('Invalid ID/PW');
            }
            else {
                const usrInfo = usr.toJSON();
                delete usrInfo.password;
                const token = jwt.sign(usrInfo, PRIVATE_KEY,
                    { expiresIn: JWT_EXIPRE });
                res.status(200).send(token);
            }
        }
        else {
            res.status(400).send("Login failed");
        }
    })
})

// TODO request regex check of email
router.post('/account', (req, res) => {
    User.insertMany(req.body, (err) => {
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
            res.status(400).send("Register failed");
        }
    });
})

export default router;