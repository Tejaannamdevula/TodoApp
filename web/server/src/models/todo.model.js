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
    label: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
      default: "Medium",
    },
    progress: {
      type: String,
      enum: ["Todo", "Doing", "Completed"],
      default: "Todo",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
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
