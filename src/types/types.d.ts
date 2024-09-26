import { Request } from "express";
import { IUser } from "../models/user";

export interface IRequestWithUser extends Request {
  user: IUser;
}
