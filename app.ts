import express from "express";
import morgan from "morgan";
import userRouter from "./src/user";
import authRouter from "./src/auth";
import classRouter from "./src/class";
import { errorHandler, undefinedMethodHandler } from "./src/errorHandler";

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
