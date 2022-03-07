

const axios = require("axios");
const express = require("express");
const jsonschema = require("jsonschema");
const saveRecipeSchema = require("../schemas/saveRecipe.json");
const { BadRequestError } = require("../expressError");
const SPOON_API_KEY = require('../secret')
const router = new express.Router();
const complexSearch = 'https://api.spoonacular.com/recipes/complexSearch'
const { formatIngredients } = require('../Support/helpers')
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Recipe = require("../models/recipe");


/** GET recipes/complex/:id => { ingredients, nutrientObj }
 * 
 * ingredients = [ 'ham', 'cheese' ]
 * 
 * nutrientObj = {"maxFat":"","maxSaturatedFat":"","maxCalories":1000,"maxCarbs":"",
 * "maxCholesterol":"","maxSugar":"","maxSodium":200,"maxProtein":""}
 *
 * Returns  [
    {
      id: 149425,
      usedIngredientCount: 2,
      missedIngredientCount: 6,
      missedIngredients: [Array],
      usedIngredients: [Array],
      unusedIngredients: [],
      likes: 0,
      title: 'Herb and Cheddar Cordon Bleu',
      image: 'https://spoonacular.com/recipeImages/149425-312x231.jpg',
      imageType: 'jpg'
    }... {more recipes} ]
 *
 * Authorization required: correct user or admin
 **/

router.get('/complex/:id', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {

        const { ingredients, nutrientObj } = req.query
        if (ingredients === undefined) throw new BadRequestError('Must have at least one ingredient chosen')

        const formattedNutrients = JSON.parse(nutrientObj)

        // constructs URL nutrient string, skips any nutrients user didn't include in form. 
        // &calories=800&sodium=600
        const nutrientArr = [];
        for (const [key, value] of Object.entries(formattedNutrients)) {
            // if nutrient form isn't touched values will be null. 
            // blank string if nutrient form submitted with blank fields. 
            if (value !== '' && value !== null) {
                nutrientArr.push(`&${key}=${value}`)
            }
        }

        const nutrientStr = nutrientArr.join('');
        const numResults = 5;
        const formattedIngredients = formatIngredients(ingredients);
        let axiosRes
        // handles empty nutrient string if user doesn't filter by any min/max nutrients. 
        if (nutrientStr.length === 0) {
            axiosRes = await axios.get(`${complexSearch}?includeIngredients=${formattedIngredients}&number=${numResults}&fillIngredients=true&apiKey=${SPOON_API_KEY}`)
        } else {
            axiosRes = await axios.get(`${complexSearch}?includeIngredients=${formattedIngredients}${nutrientStr}&number=${numResults}&fillIngredients=true&apiKey=${SPOON_API_KEY}`)
        }

        console.log('ingred', ingredients)
        console.log('form', formattedIngredients)

        const recipes = axiosRes.data
        return res.json(recipes)

    } catch (err) {
        return next(err)
    }
})

/** GET recipes/detail/:id => { recipeId }

 *
 * Returns  { nutrition, recipe }
 *
 * Authorization required:  admin or same user as :id
 **/

router.get('/detail/:id', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { recipeId } = req.query
        // ensures recipeId is an integer
        // json schema can only validate "number", can't specifically check for int
        if (!Number.isInteger(parseInt(recipeId))) throw new BadRequestError(`recideId must be a number`)

        const axiosRes = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${SPOON_API_KEY}`)
        const recipeDetail = axiosRes.data
        const nutritionRes = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?apiKey=${SPOON_API_KEY}`)
        const nutritionDetail = nutritionRes.data
        // console.log('nutrition info', nutritionRes.data)
        // console.log('axios res recDetail', recipeDetail)
        return res.json({ recipe: recipeDetail, nutrition: nutritionDetail })
    } catch (err) {
        return next(err)
    }
})

/** GET /recipes/:id => { id }

 *
 * Returns  {
 * recipes: 
 *      [{ "name": "bacon", "recipe_id": 1234, "ww_points": 10 },
 *      { "name": "eggs", "recipe_id": 5678, "ww_points": 20 }]
 * }
 *
 * Authorization required:   admin or same user as :id
 **/
router.get('/:id', ensureCorrectUserOrAdmin, async (req, res, next) => {
    // gets all saved recipes for a given user
    try {

        const userId = req.params.id
        const recipeRes = await Recipe.getRecipes(userId)
        return res.json({ recipes: recipeRes })
    } catch (err) {
        return next(err);
    }
})

/** POST /recipes/:id => { recipeDetail }

 *
 * Returns  {
 * recipes: 
 *      [{ "name": "bacon", "recipe_id": 1234, "ww_points": 10 },
 *      { "name": "eggs", "recipe_id": 5678, "ww_points": 20 }]
 * }
 *
 * Authorization required:   admin or same user as :id
 **/
router.post('/:id', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, saveRecipeSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const recipeDetail = req.body;
        const recipeId = recipeDetail.id;
        const recipeName = recipeDetail.title;
        const userId = req.params.id
        const wwPoints = recipeDetail.weightWatcherSmartPoints;

        const recipeRes = await Recipe.saveRecipe(userId, recipeName, recipeId, wwPoints)
        return res.status(201).json({ savedRecipe: recipeRes })
    } catch (err) {
        return next(err);
    }
})

/** DELETE /recipes/:id => { recipeDetail }

 *
 * Returns  {
 * recipes: 
 *      [{ "name": "bacon", "recipe_id": 1234, "ww_points": 10 },
 *      { "name": "eggs", "recipe_id": 5678, "ww_points": 20 }]
 * }
 *
 * Authorization required:  admin or same user as :id
 **/
router.delete('/:id/:recipeId', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { id, recipeId } = req.params
        // removes from join table
        const deleteRes = await Recipe.remove(recipeId, id)
        // console.log('delete', deleteRes)
        return res.status(204).json({ deleted: deleteRes });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;