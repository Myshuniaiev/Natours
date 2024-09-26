import express, { Router } from "express";
import * as tourController from "../controllers/tour";
import * as authController from "../controllers/auth";

const router: Router = express.Router();

router
  .route("/top-tours")
  .get(tourController.aliasTopTours, tourController.getTours);

router.route("/tour-stats").get(tourController.getTourStats);

router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/")
  .get(authController.protect, tourController.getTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

export default router;
