import express, { Router } from "express";

import * as reviewController from "@controllers/review";
import * as authController from "@controllers/auth";

const router: Router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(reviewController.updateReview) 
  .delete(
    authController.protect,
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  );

export default router;
