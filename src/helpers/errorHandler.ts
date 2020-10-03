import { NextFunction, Request, Response } from "express";

export class ErrorHandler extends Error {
    status: number;
    code: string;

    constructor(status: number, code: string) {
        super();
        this.status = status;
        this.code = code;
    }
}

export const errorHandler = (err: ErrorHandler, req: Request,
    res: Response, next: NextFunction): void => {
    if ("status" in err && "code" in err) {
        const { status, code } = err;
        res.status(status).send(code);
    }
    else if ("status" in err) {
        const { status } = err;
        res.sendStatus(status);
    }
    else {
        res.status(500).send("undefiend_error_occured");
    }
};

export const undefinedMethodHandler = (req: Request, res: Response,
    next: NextFunction): void => {
    res.status(405).send("undefined_method");
};