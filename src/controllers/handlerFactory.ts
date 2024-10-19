import catchAsync from "@utils/catchAsync";
import AppError from "@utils/appError";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";

// Handler to delete a document
export const deleteOne = <T>(Model: Model<T>) =>
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return next(new AppError("No document found with that ID", 404));
      }
      res
        .status(200)
        .json({ status: "success", message: "The document has been deleted." });
    }
  );
