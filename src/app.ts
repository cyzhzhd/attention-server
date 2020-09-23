import fs from "fs";
import express from "express";
import logger from "morgan";
// import authRouter from "./routers/auth";
import userRouter from "./routers/user";
import classRouter from "./routers/class";
import classSessionRouter from "./routers/session";
import { undefinedMethodHandler, errorHandler } from './helpers/errorHandler'

const app = express();

app.use(logger("dev"));
app.use(logger('common', {
    stream: fs.createWriteStream('./access.log', { flags: 'a' })
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/class', classRouter);
app.use('/session', classSessionRouter);

app.use(undefinedMethodHandler);
app.use(errorHandler);

module.exports = app;
