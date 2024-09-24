import express, { Router } from "express";
import * as userController from "../controllers/user";
import * as authController from "../controllers/auth";

const router: Router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.param("id", userController.checkId);
router.route("/").get(userController.getUsers).post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
