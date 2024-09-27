import { Document } from "mongoose";

export enum LocationTypeEnum {
  POINT = "Point",
}

export enum TourDifficultyEnum {
  EASY = "easy",
  MEDIUM = "medium",
  DIFFICULT = "difficult",
}

export interface ILocation {
  type: LocationTypeEnum;
  coordinates: number[];
  address: string;
  description: string;
}

export interface ITour extends Document {
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: TourDifficultyEnum;
  ratingsAverage: number;
  ratingQuantity: number;
  price: number;
  priceDiscount: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startDates: Date[];
  secretTour: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  startLocation: ILocation;
  locations: (ILocation & { day: number })[];
}
