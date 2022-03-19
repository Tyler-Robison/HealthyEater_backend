"use strict";

const db = require("../db.js");

const {
    NotFoundError,
    BadRequestError
} = require("../expressError");

const Recipe = require('./recipe.js')

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./_modelTestCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** save recipe */

describe("save recipe", function () {
    test("Can save a recipe to a user", async function () {
        await Recipe.saveRecipe(1, 'new_recipe', 1234, 19)
        const recipe = await db.query(`SELECT * FROM recipes WHERE name='new_recipe'`)

        expect(recipe.rows[0]).toEqual(
            { recipe_id: 1234, name: 'new_recipe', ww_points: 19 }
        );

        const recipe_user = await db.query(`SELECT * FROM users_recipes 
        WHERE recipe_id=1234 AND user_id = 1`)

        // ensures recipes_users join table succesfully updates
        expect(recipe_user.rows[0]).toEqual(
            { recipe_id: 1234, user_id: 1 }
        );
    });

    test("recipe not added on duplicate user_id/recipe_id", async function () {
        try {
            // user 1 has already saved recipe 1111
            await Recipe.saveRecipe(1, 'dup_recipe', 1111, 19);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** get recipes */

describe("getRecipes", function () {
    test("Can get all recipes for a given user", async function () {
        const recipes = await Recipe.getRecipes(1)

        expect(recipes).toEqual([
            { recipe_id: 1111, name: 'fish stew', ww_points: 19 },
            { recipe_id: 2222, name: 'bacon', ww_points: 7 }
        ]);

    });

    test("no results on bad user id", async function () {
        const recipes = await Recipe.getRecipes(999999)

        expect(recipes).toEqual([]);
    });
});

/************************************** remove from users_recipes */

describe("remove", function () {
    test("Can remove recipes", async function () {
        const recipes = await Recipe.getRecipes(1)

        // all recipes for user with id 1
        expect(recipes).toEqual([
            { recipe_id: 1111, name: 'fish stew', ww_points: 19 },
            { recipe_id: 2222, name: 'bacon', ww_points: 7 }
        ]);

        await Recipe.remove(2222, 1)

        const recipesAfterRemove = await Recipe.getRecipes(1)

        // correct recipe was removed
        expect(recipesAfterRemove).toEqual([
            { recipe_id: 1111, name: 'fish stew', ww_points: 19 }
        ]);

    });

    test("Not found error on bad user id", async function () {
        try {
            await Recipe.remove(2222, 999999)
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

