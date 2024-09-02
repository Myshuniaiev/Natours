import express, { Router } from "express";
import * as controller from "../controllers/tour";

const router: Router = express.Router();

router.param("id", controller.checkId);
router
  .route("/")
  .get(controller.getTours)
  .post(controller.checkBody, controller.createTour);

router
  .route("/:id")
  .get(controller.getTour)
  .patch(controller.updateTour)
  .delete(controller.deleteTour);

export default router;
