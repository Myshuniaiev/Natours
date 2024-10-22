import { Request } from "express";
import { IUser } from "@models/user";

// Extend the Request interface for the body and query string
export interface IRequestWithBody<T> extends Request {
  body: T;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
