import { Router } from "express";

import {
  loginUser,
  registerUser,
  logOutUser,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
// console.log("hi there");
router.route("/register").post(registerUser);
// console.log("bye there");

router.route("/check").get((req, res) => {
  res.status(200).json({
    message: "Server is running, and the routes are working fine!",
  });
});

router.route("/login").post(loginUser);

//secure routes

router.route("/logout").post(verifyJwt, logOutUser);
export default router;
