"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
// TODO: use pubkey to encrypt hashed password
router.get('/pubkey', function (req, res) {
    res.sendStatus(200);
});
exports.default = router;
