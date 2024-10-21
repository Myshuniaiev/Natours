import catchAsync from "@utils/catchAsync";
import AppError from "@utils/appError";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { IRequestWithBody } from "@mytypes/express";

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

export const updateOne = <T>(Model: Model<T>) =>
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) {
        return next(new AppError("No doc found with that ID", 404));
      }
      res.status(200).json({ status: "success", data: { data: doc } });
    }
  );

export const createOne = <T>(Model: Model<T>) =>
  catchAsync(async (req: IRequestWithBody<T>, res: Response): Promise<void> => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: "success", data: { data: doc } });
  });

// TODO Replace any type
export const getOne = <T>(Model: Model<T>, options?: any) =>
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      let query = Model.findById(req.params.id);
      if (options) {
        query = query.populate(options);
      }
      const doc = await query;
      if (!doc) {
        return next(new AppError("No doc found with that ID", 404));
      }
      res.status(200).json({ status: "success", data: { data: doc } });
    }
  );
