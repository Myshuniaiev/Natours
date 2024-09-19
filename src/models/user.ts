import mongoose, { Schema, Document, Model } from "mongoose";
import validator from "validator";

export interface IUser extends Document {
  name: string;
  email: string;
  photo: string;
  password: string;
  passwordConfirm: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
    },
    email: {
      type: String,
      required: [true, "A user must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Provide a valid email address"],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "A user must have a password"],
      minlength: 8,
    },
    passwordConfirm: {
      type: String,
      required: [true, "A user must have a confirm password"],
    },
  },
  {
    strict: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
