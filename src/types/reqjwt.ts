import { Request } from 'express';

export interface ReqJwt extends Request {
    user: {
        _id: string;
        email: string;
        name: string;
        isTeacher: boolean;
    }
}

export interface Payload {
    _id: string;
    email: string;
    name: string;
    isTeacher: boolean;
    ownClasses: Array<string>;
    classes: Array<string>;
}