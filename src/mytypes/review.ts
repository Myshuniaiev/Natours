import { Document, Types } from "mongoose";

import { ITour } from "@mytypes/tour";
import { IUser } from "@mytypes/user";

export interface IReview extends Document {
  review: string;
  rating: number;
  tour: Types.ObjectId | ITour;
  user: Types.ObjectId | IUser;
}
