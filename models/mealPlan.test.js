"use strict";

const db = require("../db.js");

const {
    NotFoundError,
    BadRequestError
} = require("../expressError");


const MealPlan = require('./mealPlan.js')

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

/************************************** createMealPlan */

describe("Create Mealplan", function () {
    test("Can create a mealplan row", async function () {
        await MealPlan.createMealPlan(1, 2222, 'Thurs')

        const created_mealplan = await db.query(`SELECT * FROM user_mealplan
        WHERE day='Thurs'`)

        expect(created_mealplan.rows).toEqual([
            { id: expect.any(Number), user_id: 1, recipe_id: 2222, day: 'Thurs' }
        ])
    });

    test("Not found error on bad user id", async function () {
        try {
            await MealPlan.createMealPlan(999999, 2222, 'Mon')
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("Not found error on bad recipe id", async function () {
        try {
            await MealPlan.createMealPlan(1, 9999999, 'Mon')
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("Bad request error on invalid day", async function () {
        try {
            await MealPlan.createMealPlan(1, 2222, 'invalid')
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** getMealPlan */

describe("get mealplan", function () {
    test("can get the meal plan for a given user", async function () {
        const mealplan = await MealPlan.getMealPlan(1)

        expect(mealplan).toEqual([
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Mon' },
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Tues' },
            { id: expect.any(Number), recipe_id: 2222, name: 'bacon', ww_points: 7, day: 'Tues' },
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Wed' }
        ])
    });

    test("Not Found error on invalid id", async function () {
        try {
            await MealPlan.getMealPlan(999999)
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** deleteMealPlan */
describe("delete mealplan", function () {
    test("can delete rows in mealplan", async function () {
        const mealplan = await MealPlan.getMealPlan(1)

        expect(mealplan).toEqual([
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Mon' },
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Tues' },
            { id: expect.any(Number), recipe_id: 2222, name: 'bacon', ww_points: 7, day: 'Tues' },
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Wed' }
        ])

        // remove id 1
        await MealPlan.deleteMeal(1);

        const mealplanAfterDelete = await MealPlan.getMealPlan(1)

        // mealplan w/ id 1 was removed
        expect(mealplanAfterDelete).toEqual([
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Tues' },
            { id: expect.any(Number), recipe_id: 2222, name: 'bacon', ww_points: 7, day: 'Tues' },
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Wed' },
        ])
    });

    test("Not Found error on invalid id", async function () {
        try {
            await MealPlan.deleteMeal(999999)
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** deleteUserMeals */
describe("deletes entire mealplan for a given user", function () {
    test("can delete rows in mealplan", async function () {
        const mealplan = await MealPlan.getMealPlan(1)

        expect(mealplan).toEqual([
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Mon' },
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Tues' },
            { id: expect.any(Number), recipe_id: 2222, name: 'bacon', ww_points: 7, day: 'Tues' },
            { id: expect.any(Number), recipe_id: 1111, name: 'fish stew', ww_points: 19, day: 'Wed' }
        ])

        // remove id 1
        await MealPlan.deleteUserMeals(1)

        const mealplanAfterDelete = await MealPlan.getMealPlan(1)

        // mealplan removed
        expect(mealplanAfterDelete).toEqual([])
    });

    test("Not Found error on invalid id", async function () {
        try {
            await MealPlan.deleteUserMeals(999999)
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});