"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var mongoose_1 = __importDefault(require("mongoose"));
var express_jwt_1 = __importDefault(require("express-jwt"));
var dotenv_1 = __importDefault(require("dotenv"));
var classModel_1 = require("../models/classModel");
dotenv_1.default.config();
var router = express_1.default.Router();
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var Class = mongoose_1.default.model('Class', classModel_1.classModel);
// TODO encrypt JWT with public key
router.post('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res) {
    var req = _req;
    if (!req.user.isTeacher) {
        res.status(400).send("User is not a teacher");
        return;
    }
    req.body.teacher = req.user._id;
    Class.insertMany(req.body, function (err) {
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
});
// TODO request regex check of email
router.delete('/', express_jwt_1.default({ secret: PRIVATE_KEY, algorithms: ['HS256'] }), function (_req, res) {
    var req = _req;
    if (!req.user.isTeacher) {
        res.status(400).send("User is not a teacher");
        return;
    }
    if (!('id' in req.query)) {
        res.status(400).send("Class ID not specified");
        return;
    }
    var toDelete = {
        _id: req.query.id,
        teacher: req.user._id
    };
    Class.deleteOne(toDelete, function (err) {
        if (err === null) {
            res.sendStatus(200).end();
        }
        else {
            res.status(400).send("Class deletion failed");
        }
    });
});
exports.default = router;
