import express, { Application } from "express";
import morgan from "morgan";

import tourRouter from "./routes/tour";
import userRouter from "./routes/user";

const app: Application = express();

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

export default app;
