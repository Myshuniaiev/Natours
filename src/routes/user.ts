import express, { Router } from "express";
import * as controller from "../controllers/user";

const router: Router = express.Router();

router.param("id", controller.checkId);
router.route("/").get(controller.getUsers).post(controller.createUser);

router
  .route("/:id")
  .get(controller.getUser)
  .patch(controller.updateUser)
  .delete(controller.deleteUser);

export default router;
