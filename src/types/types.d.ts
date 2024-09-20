import { Request } from "express";
import { IUser } from "../models/user";

export interface IRequest extends Request {
  user: IUser;
}
