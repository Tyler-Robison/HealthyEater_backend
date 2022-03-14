"use strict";

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token
} = require("./_routeTestCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


const formattedUrlBlankNutrients = '/recipes/complex/1?ingredients[]=ham&ingredients[]=cheese&nutrientObj=%7B%22maxFat%22:null,%22maxSaturatedFat%22:null,%22maxCalories%22:null,%22maxCarbs%22:null,%22maxCholesterol%22:null,%22maxSugar%22:null,%22maxSodium%22:null,%22maxProtein%22:null%7D'
// max 1000 cals, 100 satFat
const formattedUrlWithNutrients = '/recipes/complex/1?ingredients[]=ham&ingredients[]=cheese&nutrientObj=%7B%22maxFat%22:null,%22maxSaturatedFat%22:100,%22maxCalories%22:1000,%22maxCarbs%22:null,%22maxCholesterol%22:null,%22maxSugar%22:null,%22maxSodium%22:null,%22maxProtein%22:null%7D'

/************************************** GET /recipes/complex/:id */

describe("GET /recipes/complex/:id", function () {
    // first two tests use real API, don't run unless needed

    test("correct response without nutrient constraints", async function () {
        const resp = await request(app)
            .get(formattedUrlBlankNutrients)
            .set("authorization", `Bearer ${u1Token}`)
        // console.log('resp', resp.body)
        // expect correctly structured response from API
        expect(resp.body).toEqual({ "number": expect.any(Number), "offset": expect.any(Number), "results": expect.any(Array), "totalResults": expect.any(Number) });

        // first item in results array contains correctly structured information
        expect(resp.body.results[0]).toEqual({
            id: expect.any(Number),
            usedIngredientCount: expect.any(Number),
            missedIngredientCount: expect.any(Number),
            missedIngredients: expect.any(Array),
            usedIngredients: expect.any(Array),
            unusedIngredients: expect.any(Array),
            likes: expect.any(Number),
            title: expect.any(String),
            image: expect.any(String),
            imageType: expect.any(String)
        })
    });

    test("correct response with nutrient constraints", async function () {
        const resp = await request(app)
            .get(formattedUrlWithNutrients)
            .set("authorization", `Bearer ${u1Token}`)
        // expect correctly structured response from API
        expect(resp.body).toEqual({ "number": expect.any(Number), "offset": expect.any(Number), "results": expect.any(Array), "totalResults": expect.any(Number) });

        // information returned now contains nutrition object
        expect(resp.body.results[0]).toEqual({
            id: expect.any(Number),
            usedIngredientCount: expect.any(Number),
            missedIngredientCount: expect.any(Number),
            missedIngredients: expect.any(Array),
            usedIngredients: expect.any(Array),
            unusedIngredients: expect.any(Array),
            likes: expect.any(Number),
            title: expect.any(String),
            image: expect.any(String),
            imageType: expect.any(String),
            nutrition: expect.any(Object)
        })

        // first recipe has less than 1000 cals.
        expect(resp.body.results[0].nutrition.nutrients[0].name).toEqual('Calories')
        expect(resp.body.results[0].nutrition.nutrients[0].amount).toBeLessThan(1000)
    });

    test("400 on blank ingredients", async function () {
        const resp = await request(app)
            .get('/recipes/complex/1')
            .set("authorization", `Bearer ${u1Token}`)

        // expect 400 - BadRequestError
        expect(resp.statusCode).toEqual(400);
    });

    test("401 on wrong user", async function () {
        const resp = await request(app)
            .get('/recipes/complex/2')
            .set("authorization", `Bearer ${u1Token}`)

        expect(resp.statusCode).toEqual(401);
    });

});

/************************************** GET /recipes/detail/:id */

describe("GET /recipes/detail/:id", function () {

    test("correct response from nutrient detail", async function () {
        const resp = await request(app)
            .get('/recipes/detail/1?recipeId=716406')
            .set("authorization", `Bearer ${u1Token}`)

        // expect correctly structured response from API
        expect(resp.body).toEqual({
            nutrition: expect.any(Object),
            recipe: expect.any(Object)
        });
    });

    test("400 on bad recipeId", async function () {
        const resp = await request(app)
            .get('/recipes/detail/1?recipeId=notNumber')
            .set("authorization", `Bearer ${u1Token}`)

        // expect 400 - BadRequestError
        expect(resp.statusCode).toEqual(400);
    });

    test("401 on wrong user", async function () {
        const resp = await request(app)
            .get('/recipes/detail/2?recipeId=notNumber')
            .set("authorization", `Bearer ${u1Token}`)

        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** GET /recipes/:id */

describe("GET /recipes/:id", function () {

    test("gets all saved recipes for a given user", async function () {
        const resp = await request(app)
            .get('/recipes/1')
            .set("authorization", `Bearer ${u1Token}`)

        expect(resp.body).toEqual({
            "recipes": [
                { "name": "bacon", "recipe_id": 1234, "ww_points": 10 },
                { "name": "eggs", "recipe_id": 5678, "ww_points": 20 }
            ]
        });
    });

    test("401 on un-authorized user", async function () {
        const resp = await request(app)
            .get('/recipes/1')
            .set("authorization", `Bearer ${u2Token}`)

        expect(resp.statusCode).toEqual(401);
    });

});

/************************************** POST /recipes/:id */

describe("POST /recipes/:id", function () {

    test("saves recipe for a given user", async function () {
        const resp = await request(app)
            .post('/recipes/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                id: 1111,
                title: 'test_recipe',
                weightWatcherSmartPoints: 15
            });

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({ "savedRecipe": { "name": "test_recipe", "recipe_id": 1111, "ww_points": 15 } });
    });

    test("400 on invalid data", async function () {
        const resp = await request(app)
            .post('/recipes/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                id: 'bad id',
                title: 'test_recipe',
                weightWatcherSmartPoints: 15
            });

        expect(resp.statusCode).toEqual(400);
    });

    test("400 on missing data", async function () {
        const resp = await request(app)
            .post('/recipes/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                id: 1111,
                title: 'test_recipe'
            });

        expect(resp.statusCode).toEqual(400);
    });

    test("401 on wrong user", async function () {
        const resp = await request(app)
            .post('/recipes/2')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                id: 1111,
                title: 'test_recipe',
                weightWatcherSmartPoints: 15
            });
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** DELETE /recipes/:id */

describe("DELETE /recipes/:id", function () {

    test("deletes recipe for a given user", async function () {
        const resp = await request(app)
            .delete('/recipes/1/1234')
            .set("authorization", `Bearer ${u1Token}`)

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            "deletedRecipe": {
                "recipe_id": 1234
            }
        });
    });

    test("404 on invalid recipeId", async function () {
        const resp = await request(app)
            .delete('/recipes/1/999999')
            .set("authorization", `Bearer ${u1Token}`)
        expect(resp.statusCode).toEqual(404);
    });

    test("401 on wrong user", async function () {
        const resp = await request(app)
            .delete('/recipes/2/1234')
            .set("authorization", `Bearer ${u1Token}`)
        expect(resp.statusCode).toEqual(401);
    });

});