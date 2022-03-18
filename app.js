"use strict";

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const recipeRoutes = require("./routes/recipes")
const mealRoutes = require("./routes/mealPlanner")

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use(authenticateJWT);

/** routes related to user auth */
app.use("/auth", authRoutes);

/** routes for getting user info and account deletion */
app.use("/users", userRoutes);

/** Routes that get recipe info from Spoontacular API and manage user recipes */
app.use("/recipes", recipeRoutes);

/** routes related to user mealplan */
app.use("/meals", mealRoutes)



/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;