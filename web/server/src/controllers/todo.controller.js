import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Todo } from "../models/todo.model";
import { User } from "../models/user.model";
import zod from "zod";
import { ApiResponse } from "../utils/ApiResponse";

const todoSchema = zod.object({
  title: zod.string().min(1, "Title is required"),
  description: zod.string().optional(),
  completed: zod.boolean().default(false),
  duedate: zod.string(),
  priority: zod.number(),
});

const createTodo = asyncHandler(async (req, res) => {
  try {
    const validateData = todoSchema.parse(req.body);
    const { title, description, completed, duedate, priority } = validateData;

    const userId = req.user._id;
    const userExist = await User.findById(userId);

    if (!userExist) {
      throw new ApiError(404, "User not found");
    }

    const todo = await Todo.create({
      title,
      description,
      completed,
      duedate,
      priority,
      userId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Todo created successfully", todo));
  } catch (error) {
    if (error instanceof zod.ZodError) {
      throw new ApiError(400, "Validation Error", error.errors);
    }
    throw new ApiError(
      400,
      error?.message || "Something went wrong while creating todo"
    );
  }
});

const getTodos = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const todos = await todos.find({ userId });

    return res
      .status(200)
      .json(new ApiResponse(200, "Todos fetched successfully ", todos));
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "Something went wrong while fetching todos"
    );
  }
});

const getTodoById = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;

    const todo = await Todo.findOne({ _id: id, userId });
    if (!todo) {
      throw new ApiError(404, "Todo not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Todo fetched successfully"));
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "Something went wrong while fetching the todo"
    );
  }
});

const getFilteredTodos = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const todos = await Todo.find({ userId, completed: false });

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const overDue = todos.filter((todo) => todo.dueDate < startOfToday);
    const today = todos.filter(
      (todo) => todo.dueDate >= startOfToday && todo.dueDate <= endOfToday
    );

    const upcoming = todos.filter((todo) => todo.dueDate > endOfToday);

    return res
      .status(200)
      .json(new ApiResponse(200, "Todo fetched Successfully"), {
        overDue,
        today,
        upcoming,
      });
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "Something went wrong while fetching todos"
    );
  }
});

const updateTodo = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const validatedData = todoSchema.partial().parse(req.body);

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      { $set: validatedData },
      { new: true }
    );

    if (!updatedTodo) {
      throw new ApiError(404, "Todo not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Todo updated successfully", updatedTodo));
  } catch (error) {
    if (error instanceof zod.ZodError) {
      throw new ApiError(400, "Validation Error", error.errors);
    }
    throw new ApiError(
      400,
      error?.message || "Something went wrong while updating the todo"
    );
  }
});
const deleteTodo = asyncHandler(async function (req, res) {
  try {
    const id = req.params.id;
    const userId = req.user._id;

    const deleteTodo = await Todo.findOneAndDelete({ _id: id, userId });

    if (!deleteTodo) {
      throw new ApiError(404, "Todo not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Todo deleted Successfully", deleteTodo));
  } catch (error) {}
});

const markTodoAsCompleted = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const updatedTodo = await findOneAndUpdate(
      { _id: id, userId },
      { $set: { completed: true, progress: "Completed" } },
      { new: true }
    );

    if (!updatedTodo) {
      throw new ApiError(404, "Todo not found ");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Todo marked as completed successfully",
          updatedTodo
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "Something went wrong while updating the todo"
    );
  }
});

export {
  createTodo,
  getTodos,
  getTodoById,
  getFilteredTodos,
  updateTodo,
  deleteTodo,
  markTodoAsCompleted,
};
