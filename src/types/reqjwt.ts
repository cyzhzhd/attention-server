import { Request } from 'express';

export interface ReqJwt extends Request {
    user: {
        _id: string;
        email: string;
        name: string;
        isTeacher: boolean;
    }
}