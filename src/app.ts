import cors from "cors";
import express from "express";
import logger from "morgan";
import path from "path";
import dotenv from "dotenv";
import userRouter from "./routers/user";
import classRouter from "./routers/class";
import concentrationRouter from "./routers/concentration"
import classSessionRouter from "./routers/session";
import { undefinedMethodHandler, errorHandler } from "./helpers/errorHandler";

dotenv.config({ path: path.join(__dirname, '../.env') });
const ENV = process.env.ENV as string;

const app = express();

// handle cors, cors preflight
app.options('*', cors());
app.use(cors());

const format = (ENV == "DEV") ? "dev" : "common";
app.use(logger(format));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send("server is working");
});

app.use("/user", userRouter);
app.use("/class", classRouter);
app.use("/session", classSessionRouter);
app.use("/concentration", concentrationRouter);

app.use("/download", express.static(path.join(__dirname, "../static")));

app.use(undefinedMethodHandler);
app.use(errorHandler);

module.exports = app;
