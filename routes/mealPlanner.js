
const express = require("express");
const User = require('../models/user')
const { BadRequestError } = require("../expressError");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const MealPlan = require("../models/mealPlan");
const router = new express.Router();
const jsonschema = require("jsonschema");
const pointsSchema = require("../schemas/setPoints.json");
const mealplanSchema = require("../schemas/mealplan.json");


/** POST meals/:id  => {
 *         day: "Wed",
 *         id: 1,
 *         recipe_id: 1234,
 *     }
 *
 * Authorization required: admin or same user as :id
 **/

router.post('/:id', ensureCorrectUserOrAdmin, async (req, res, next) => {
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
        return res.status(201).json(mealRes)
    } catch (err) {
        return next(err)
    }
})

/** DELETE meals/:id  =>  { deleted: id }
 *
 * Authorization required: admin or same user as :id
 **/

router.delete('/:id/:meal_id', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { meal_id } = req.params
        const mealRes = await MealPlan.deleteMeal(meal_id)
        return res.status(201).json(mealRes)
    } catch (err) {
        return next(err)
    }
})

/** PATCH meals/:id  =>  { points: pointsRes }
 *
 * Authorization required: admin or same user as :id
 **/

router.patch('/:id', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, pointsSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const id = req.params.id
        const points = req.body.points
        const pointsRes = await User.setPoints(id, points)
        // change to 201 status
        return res.json({ points: pointsRes })

    } catch (err) {
        return next(err);
    }
})



module.exports = router;