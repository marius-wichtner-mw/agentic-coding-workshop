import mongoose, { Schema } from 'mongoose';

// Define the User schema
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the User model
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);