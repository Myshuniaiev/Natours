import express, { Router } from "express";

import * as reviewController from "@controllers/review";
import * as authController from "@controllers/auth";

const router: Router = express.Router();

router
  .route("/")
  .get(reviewController.getReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview
  );

export default router;
