import express, { Router } from "express";

import * as tourController from "@controllers/tour";
import * as authController from "@controllers/auth";
import reviewRouter from "@routes/review";

const router: Router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

router
  .route("/top-tours")
  .get(tourController.aliasTopTours, tourController.getTours);
router.route("/tour-stats").get(tourController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/")
  .get(tourController.getTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    tourController.updateTour,
    authController.protect,
    authController.restrictTo("admin", "lead-guide")
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

export default router;
