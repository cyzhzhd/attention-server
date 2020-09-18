import express from "express";
import morgan from "morgan";
import userRouter from "./routers/user";
import authRouter from "./routers/auth";
import classRouter from "./routers/class";
import { undefinedMethodHandler, errorHandler } from './helpers/errorHandler'

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/class', classRouter);
// app.use("/api/firebase", firebaseRouter);

app.use(undefinedMethodHandler);
app.use(errorHandler);

module.exports = app;
