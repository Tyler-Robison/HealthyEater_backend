"use strict";

const db = require("../db");
const {
    NotFoundError,
    BadRequestError
} = require("../expressError");

/** Related functions for Recipes. */

class Recipe {
    /** Checks if recipes tables already contains this recipe - if not, recipe is added
     * 
     *  Checks if user already saved this recipe, if not - row created in users_recipes join table
     * 
     *  returns recipe_id, ww_points and name
     */
    static async saveRecipe(userId, name, recipeId, wwPoints) {

        const duplicateCheck = await db.query(
            `SELECT recipe_id
                 FROM recipes
                 WHERE recipe_id = $1`,
            [recipeId],
        );
        let isDuplicateRecipe = false

        if (duplicateCheck.rows[0]) isDuplicateRecipe = true;


        // if any user has already put recipe in db
        // don't add again
        let result;
        let savedRecipe;
        if (!isDuplicateRecipe) {
            result = await db.query(
                `INSERT INTO recipes
            (name,
            recipe_id,
            ww_points)
            VALUES ($1, $2, $3)
            RETURNING recipe_id, ww_points, name`,
                [name, recipeId, wwPoints]
            )

            // even if recipe is duplicated still need the information
        } else {
            result = await db.query(
                `SELECT name, ww_points, recipe_id 
                FROM recipes
                WHERE recipe_id = $1`, [recipeId]
            )
        }

        savedRecipe = result.rows[0]

        // check if currUser has already saved this recipe
        // can still add to join table even if recipe wasn't added to recipes table
        const duplicateCheck2 = await db.query(
            `SELECT recipe_id
                 FROM users_recipes
                 WHERE recipe_id = $1 AND user_id = $2`,
            [recipeId, userId],
        );

        let isDuplicateRow = false

        if (duplicateCheck2.rows[0]) {
            isDuplicateRow = true;
            throw new BadRequestError(`Duplicate userId/recipeId: ${userId} ${recipeId}`);
        }

        if (!isDuplicateRow) {
            await db.query(
                `INSERT INTO users_recipes (user_id, recipe_id)
            VALUES ($1, $2)`,
                [userId, recipeId]
            )
        }

        return savedRecipe
    }

    /** returns all recipes saved by current user
 * 
 *  returns recipe_id, ww_points and name
 */
    static async getRecipes(userId) {
        const result = await db.query(`
            SELECT r.name, r.recipe_id, r.ww_points
            FROM users_recipes u 
            JOIN recipes r
            ON r.recipe_id = u.recipe_id
            WHERE user_id=$1`, [userId]
        )

        const savedRecipes = result.rows
        return savedRecipes
    }

    /** removes recipe from a user's personal saved recipes (users_recipes)
 * 
 *  still exists in recipes table, deleting recipe there 
 * 
 *  would cascade to ALL users saved recipes
 */
    static async remove(recipeId, userId) {
        const result = await db.query(
            `DELETE FROM users_recipes 
            WHERE recipe_id = $1 AND user_id =$2
            RETURNING recipe_id
        `, [recipeId, userId])

        const recipe = result.rows[0];

        if (!recipe) throw new NotFoundError(`Table does not contain recipeId: ${recipeId}.`)

        // removed deleted recipes from that users mealplan
        await db.query(`
        DELETE FROM user_mealplan
        WHERE recipe_id = $1 AND user_id =$2`,
            [recipeId, userId])


        return result.rows[0]
    }

}


module.exports = Recipe;