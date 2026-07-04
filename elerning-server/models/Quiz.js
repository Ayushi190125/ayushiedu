import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correctAnswer: {
    type: Number, // Index of the correct option (0-based)
    required: true,
  },
  explanation: {
    type: String,
    default: "",
  },
});

const schema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: true,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      default: null, // Can be course-wide quiz or linked to a specific lecture
    },
    title: {
      type: String,
      required: true,
    },
    questions: [questionSchema],
    passingScore: {
      type: Number,
      default: 70, // percentage required to pass
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Quiz = mongoose.model("Quiz", schema);
