"use strict";

/** Routes for users. */

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");
const MealPlan = require("../models/mealPlan");
const Recipe = require("../models/recipe");

const router = express.Router();


/** GET users/:id => { user }
 * 
 * Primary route used to get user info
 * 
 * Gets auth information from User.get()
 * Gets mealplan information from MealPlan.getMealPlan()
 * Gets saved recipes from Recipe.getRecipes()
 * 
 * returned user is used to create currentUser
 * currentUser controls access on the front-end
 * and stores user's recipe/mealplan information
 *
 * Returns { user }
 *
 * Authorization required: user id matches :id
 **/

router.get("/:id", ensureCorrectUser, async function (req, res, next) {
  try {
    const id = req.params.id;
    const user = await User.get(id);
    const userMealplan = await MealPlan.getMealPlan(id);
    const recipeRes = await Recipe.getRecipes(id);

    user.mealplan = userMealplan
    user.recipes = recipeRes
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE users/:id  =>  { }
 *
 * Authorization required: user id matches :id
 **/

router.delete("/:id", ensureCorrectUser, async function (req, res, next) {
  try {
    await User.remove(req.params.id);
    return res.status(204).json({});
  } catch (err) {
    return next(err);
  }
});



module.exports = router;