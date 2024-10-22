import { NextFunction, Response } from "express";

import Review from "@models/review";
import { IReview } from "@mytypes/review";
import { IRequestWithBody } from "@mytypes/express";
import * as factory from "@controllers/handlerFactory";
import { Types } from "mongoose";

export const setTourUserIds = (
  req: IRequestWithBody<IReview>,
  _res: Response,
  next: NextFunction
) => {
  if (!req.body.user) {
    req.body.user = new Types.ObjectId(req.user.id);
  }
  if (!req.body.tour) {
    req.body.tour = new Types.ObjectId(req.params.tourId);
  }

  next();
};

export const getReviews = factory.getAll(Review);
export const getReview = factory.getOne(Review);
export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
