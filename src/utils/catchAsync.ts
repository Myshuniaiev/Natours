import { NextFunction, Request, Response } from "express";

// Utility function to handle async route handlers and pass errors to the next middleware
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
