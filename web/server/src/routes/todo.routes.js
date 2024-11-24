import { Router } from "express";

import {
  createTodo,
  getTodos,
  getFilteredTodos,
  deleteTodo,
  updateTodo,
  markTodoAsCompleted,
  getTodoById,
} from "../controllers/todo.controller.js";

const router = Router();

router.route("/").post(createTodo);

router.route("/").get(getTodos);

router.route("/filtered").get(getFilteredTodos);

router.route("/:id").get(getTodoById);

router.route("/:id").put(updateTodo);

router.route("/:id").delete(deleteTodo);

router.route("/:id/complete").put(markTodoAsCompleted);

export default router;
