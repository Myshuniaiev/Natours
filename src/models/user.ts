import mongoose, { Schema, Document, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export enum UserRole {
  USER = "user",
  GUIDE = "guide",
  LEAD_GUIDE = "lead-guide",
  ADMIN = "admin",
}
export interface IUser extends Document {
  // properties
  name: string;
  email: string;
  photo: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
  role: UserRole;

  //  methods
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JwtTimestamp: number): Promise<boolean>;
  createPasswordResetToken(): () => void;
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
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    password: {
      type: String,
      required: [true, "A user must have a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "A user must have a confirm password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Confirm password should be the same as the password field",
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    strict: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// methods
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = async function (
  JwtTimestamp: number
): Promise<boolean> {
  if (!this.passwordChangedAt) {
    return false;
  }

  const changedPassword = Math.floor(this.passwordChangedAt.getTime() / 1000);

  return JwtTimestamp < changedPassword;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
