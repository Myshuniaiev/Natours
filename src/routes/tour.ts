import express, { Router } from "express";
import * as controller from "../controllers/tour";

const router: Router = express.Router();

router.route("/top-tours").get(controller.aliasTopTours, controller.getTours);

router.route("/tour-stats").get(controller.getTourStats);

router.route("/monthly-plan/:year").get(controller.getMonthlyPlan);

router.route("/").get(controller.getTours).post(controller.createTour);

router
  .route("/:id")
  .get(controller.getTour)
  .patch(controller.updateTour)
  .delete(controller.deleteTour);

export default router;
