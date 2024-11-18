// import { Schema } from "zod";
import mongoose, { Schema } from "mongoose";

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    progress: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export const Todo = mongoose.model("Todo", todoSchema);
