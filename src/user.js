"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO modify jwt remains valid after user deletion
var express_1 = __importDefault(require("express"));
var mongoose_1 = __importDefault(require("mongoose"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var dotenv_1 = __importDefault(require("dotenv"));
var userModel_1 = require("../models/userModel");
dotenv_1.default.config();
var router = express_1.default.Router();
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var JWT_EXIPRE = process.env.JWTEXPIRE;
var User = mongoose_1.default.model('User', userModel_1.userModel);
// TODO encrypt JWT with public key
router.post('/login', function (req, res) {
    if (!('email' in req.body) || !('password' in req.body)) {
        res.status(400).send('Need both email and password');
        return;
    }
    User.findOne(req.body, function (err, usr) {
        if (err === null) {
            if (usr === null) {
                res.status(400).send('Invalid ID/PW');
            }
            else {
                var usrInfo = usr.toJSON();
                delete usrInfo.password;
                var token = jsonwebtoken_1.default.sign(usrInfo, PRIVATE_KEY, { expiresIn: JWT_EXIPRE });
                res.status(200).send(token);
            }
        }
        else {
            res.status(400).send("Login failed");
        }
    });
});
// TODO request regex check of email
router.post('/account', function (req, res) {
    User.insertMany(req.body, function (err) {
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
});
exports.default = router;
