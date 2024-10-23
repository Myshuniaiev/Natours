import catchAsync from "@utils/catchAsync";
import AppError from "@utils/appError";
import { NextFunction, Request, Response } from "express";
import { Document, Model, PopulateOptions } from "mongoose";
import { IRequestWithBody } from "@mytypes/express";
import APIFeatures from "@utils/apiFeatures";

export const deleteOne = <T extends Document>(Model: Model<T>) =>
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

export const updateOne = <T extends Document>(Model: Model<T>) =>
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

export const createOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: IRequestWithBody<T>, res: Response): Promise<void> => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: "success", data: { data: doc } });
  });

export const getOne = <T extends Document>(
  Model: Model<T>,
  options?: PopulateOptions
) =>
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

export const getAll = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    const features = new APIFeatures<T>(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: { data: doc },
    });
  });
