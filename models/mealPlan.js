"use strict";

const db = require("../db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/** Related functions for mealplan. */

class MealPlan {

    static async createMealPlan(id, recipe_id, day) {
        // check that user and recipe both exist
        const user = await db.query(`SELECT * FROM users WHERE id = $1`, [id])
        if (user.rowCount === 0) throw new NotFoundError(`No user: ${id}`);

        const recipe = await db.query(`SELECT * FROM users_recipes WHERE recipe_id = $1`, [recipe_id])
        if (recipe.rowCount === 0) throw new NotFoundError(`No recipe: ${recipe_id}`);

        const days = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
        if (!days.includes(day)) throw new BadRequestError(`${day} is not a valid day`)

        const result = await db.query(
            `INSERT INTO user_mealplan
                (user_id, recipe_id, day)
                VALUES ($1, $2, $3) 
                RETURNING user_id AS "id", recipe_id, day`,
            [id, recipe_id, day]
        )

        return result.rows[0]
    }

    static async getMealPlan(id) {

        const user = await db.query(`SELECT * FROM users WHERE id = $1`, [id])
        if (user.rowCount === 0) throw new NotFoundError(`No user: ${id}`);

        const result = await db.query(
            `SELECT m.id, m.day, m.recipe_id, r.name, r.ww_points
            FROM users_recipes u
            JOIN user_mealplan m ON u.recipe_id = m.recipe_id
            JOIN recipes r ON u.recipe_id = r.recipe_id
            WHERE m.user_id = $1 AND u.user_id=$1
            ORDER BY m.id;`,
            [id]
        )

        return result.rows
    }

    static async deleteMeal(id) {

        const result = await db.query(
            `DELETE
            FROM user_mealplan
            WHERE id = $1
            RETURNING id`,
            [id],
        )

        const deleted = result.rows[0];

        if (!deleted) throw new NotFoundError(`No id: ${id}`);
    }

    static async deleteUserMeals(userId) {

        const user = await db.query(`SELECT * FROM users WHERE id = $1`, [userId])
        if (user.rowCount === 0) throw new NotFoundError(`No user: ${userId}`);

        await db.query(
            `DELETE
            FROM user_mealplan
            WHERE user_id = $1
            RETURNING id`,
            [userId],
        )
    }



}


module.exports = MealPlan;