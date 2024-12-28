import { Document } from "mongoose";

export enum UserRoleEnum {
  USER = "user",
  GUIDE = "guide",
  LEAD_GUIDE = "lead-guide",
  ADMIN = "admin",
}

export interface IUser extends Document {
  name: string;
  email: string;
  photo: string | undefined;
  role: UserRoleEnum;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;

  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JwtTimestamp: number): Promise<boolean>;
  createPasswordResetToken(): () => void;
}
