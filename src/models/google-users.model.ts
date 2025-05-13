import mongoose, { type Document, Schema } from 'mongoose';

export interface IGoogleUser extends Document {
  _id: mongoose.Types.ObjectId;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  createdAt: Date;
  updatedAt: Date;
}

const googleUserSchema = new Schema<IGoogleUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    profilePhoto: { type: String },
  },
  { timestamps: true },
);

// Create and export the GoogleUser model
export const GoogleUser =
  mongoose.models.GoogleUser ||
  mongoose.model<IGoogleUser>('GoogleUser', googleUserSchema);
