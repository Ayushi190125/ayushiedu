import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    aiFeedback: {
      type: String,
      default: "",
    },
    score: {
      type: Number, // 0 to 100
      default: 0,
    },
    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model("Assignment", schema);
