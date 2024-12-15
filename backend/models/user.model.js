import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      reuired: true,
    },
    password: {
      type: String,
      reuired: true,
    },
    role: {
      type: String,
      enum: ["Instructor", "Student"],
      default: "Student",
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    photoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamp: true }
);

export const User = mongoose.model("User", userSchema);
