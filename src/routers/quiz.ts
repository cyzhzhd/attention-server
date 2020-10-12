import express from "express";
import mongoose from "mongoose";
import expressjwt from "express-jwt";
import dotenv from "dotenv";
import assert from "assert";
import path from "path";
import { userModel } from "../models/userModel";
import { classModel } from "../models/classModel";
import { multipleChoiceQuizModel } from "../models/multipleChoiceQuiz";
import { shortAnswerQuizModel } from "../models/shortAnswerQuiz";
import { ReqJwt } from "../types/reqjwt";
import { ErrorHandler } from "../helpers/errorHandler";

dotenv.config({ path: path.join(__dirname, '../../.env') });
const router = express.Router();
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const Class = mongoose.model('Class', classModel);
const User = mongoose.model('User', userModel);
const MultipleChoiceQuiz = mongoose.model('MultipleChoiceQuiz', multipleChoiceQuizModel);
const ShortAnswerQuiz = mongoose.model('ShortAnswerQuiz', shortAnswerQuizModel);

router.get('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        // 아이디 명시되었는지 확인
        // 선생님 확인

        try {

            // 가져오기, 본인클래스, 소유여부 확인
            // 반환

        } catch (err) {
            // 에러수행
        }
    });

router.post('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        // 클래스 명시되었는지 확인, 선생님 확인
        // 필요 정보 다 있는지 확인

        try {

            // 주객관식 확인 후 적합로직 수행
            // 본인 클래스 맞는지 확인
            // 추가

        } catch (err) {
            // 에러수행
        }
    });

router.delete('/', expressjwt({ secret: PRIVATE_KEY, algorithms: ['HS256'] }),
    async (_req, res, next) => {
        const req = _req as ReqJwt;

        // 아이디 명시되었는지 확인
        // 선생님 확인

        try {

            // 삭제, 본인클래스, 소유여부 확인

        } catch (err) {
            // 에러수행
        }
    });

export default router;