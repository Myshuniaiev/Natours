import { NextFunction, Response } from "express";
import { IRequest } from "../types/types";

// Utility function to handle async route handlers and pass errors to the next middleware
const catchAsync = (
  fn: (req: IRequest, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: IRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
