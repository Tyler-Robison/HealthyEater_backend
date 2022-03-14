
const express = require("express");
const User = require('../models/user')
const { BadRequestError } = require("../expressError");
const { ensureCorrectUser } = require("../middleware/auth");
const MealPlan = require("../models/mealPlan");
const router = new express.Router();
const jsonschema = require("jsonschema");
const pointsSchema = require("../schemas/setPoints.json");
const mealplanSchema = require("../schemas/mealplan.json");


/** POST meals/:id  => {
 *         day: "Wed",
 *         id: 1,
 *         recipe_id: 1234,
 *         ww_points: 14,
 *         name: 'bacon'
 *     }
 * 
 *      inserts meal into mealplan based on recipeID
 *      returns all info needed by mealplanner
 *
 * Authorization required: same user as :id
 **/

router.post('/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, mealplanSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const id = req.params.id
        const { recipe_id, day } = req.body
        // console.log('id', id)
        // console.log('recipe id', recipe_id)
        // console.log('day', day)
        const mealRes = await MealPlan.createMealPlan(id, recipe_id, day)
        
        const mealplannerRow = {
            id: mealRes.result.id,
            recipe_id: mealRes.result.recipe_id,
            day: mealRes.result.day,
            ww_points: mealRes.recipeInfo.ww_points,
            name: mealRes.recipeInfo.name
        }
       
        return res.status(201).json({mealplannerRow})
    } catch (err) {
        return next(err)
    }
})

/** DELETE meals/:id/:meal_id  =>  { deleted: meal_id }
 *
 * Authorization required: same user as :id
 **/

router.delete('/:id/:meal_id', ensureCorrectUser, async (req, res, next) => {
    try {
        const { meal_id } = req.params
        console.log('meal id', meal_id)
        const deleteRes = await MealPlan.deleteMeal(meal_id)
        return res.status(200).json(deleteRes);
    } catch (err) {
        return next(err)
    }
})

/** DELETE meals/:id  =>  { deleted: id }
 * 
 * Route for deleting ALL meals for a given user
 *
 * Authorization required: same user as :id
 **/

router.delete('/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const { id } = req.params
        await MealPlan.deleteUserMeals(id)
        return res.status(204).json({});
    } catch (err) {
        return next(err)
    }
})

/** PATCH meals/:id  =>  { points: pointsRes }
 *
 * Authorization required: same user as :id
 **/

router.patch('/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, pointsSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const id = req.params.id
        const points = req.body.points
        const pointsRes = await User.setPoints(id, points)

        return res.status(200).json(pointsRes);

    } catch (err) {
        return next(err);
    }
})



module.exports = router;