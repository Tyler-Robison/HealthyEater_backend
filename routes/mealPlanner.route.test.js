"use strict";

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
} = require("./_routeTestCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /meals/:id */

describe("POST meals/:id", function () {

    test("Can add a meal for a user", async function () {
        const resp = await request(app)
            .post('/meals/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                recipe_id: 1234,
                day: 'Wed'
            });

        // expect correctly structured response from API
        expect(resp.status).toEqual(201)
        expect(resp.body).toEqual({
            mealplannerRow: {
                day: "Wed",
                // mealplan already has 2 meals in it, so expect id 3
                id: 3,
                recipe_id: 1234,
                ww_points: 10,
                name: 'bacon'
            }
        });
    });

    test("401 on wrong user id", async function () {
        const resp = await request(app)
            // user 1, but token for user 2
            .post('/meals/2')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                recipe_id: 1234,
                day: 'Wed'
            });

        expect(resp.status).toEqual(401)
    });

    test("400 on invalid data", async function () {
        const resp = await request(app)
            .post('/meals/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                recipe_id: 1234,
                // day must be 'Tues', 'Wed'
                day: true
            });
        expect(resp.status).toEqual(400)
    });

    test("400 on invalid day", async function () {
        const resp = await request(app)
            .post('/meals/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                recipe_id: 1234,
                // day must be 'Tues', 'Wed' etc
                day: 'tues'
            });
        expect(resp.status).toEqual(400)
    });

    test("404 on recipeId that isn't in users_recipes", async function () {
        const resp = await request(app)
            .post('/meals/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                recipe_id: 999999,
                day: 'Tues'
            });
        expect(resp.status).toEqual(404)
    });
});

/************************************** DELETE /meals/:id/:meal_id */

describe("DELETE meals/:id/:meal_id", function () {

    test("Can delete a meal for a user", async function () {
        const resp = await request(app)
            .delete('/meals/1/1')
            .set("authorization", `Bearer ${u1Token}`)

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ id: 1 })
    });

    test("401 on wrong user", async function () {
        const resp = await request(app)
            .delete('/meals/2/1')
            .set("authorization", `Bearer ${u1Token}`)


        expect(resp.statusCode).toEqual(401);
    });

    test("404 on non-existant meal id", async function () {
        const resp = await request(app)
            .delete('/meals/1/999999')
            .set("authorization", `Bearer ${u1Token}`)

        expect(resp.statusCode).toEqual(404);
    });

});

/************************************** DELETE /meals/:id */

describe("DELETE meals/:id", function () {

    test("Can delete ALL meals for a user", async function () {
        const resp = await request(app)
            .delete('/meals/1')
            .set("authorization", `Bearer ${u1Token}`)

        expect(resp.statusCode).toEqual(204);
    });

    test("401 on wrong user", async function () {
        const resp = await request(app)
            .delete('/meals/2')
            .set("authorization", `Bearer ${u1Token}`)

        // expect correctly structured response from API
        expect(resp.statusCode).toEqual(401);
    });

});

/************************************** PATCH /meals/:id */

describe("PATCH meals/:id", function () {

    test("Can add points for a user", async function () {
        const resp = await request(app)
            .patch('/meals/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                points: 15
            });

   
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual( {"id": 1, "points": 15})
    });

    test("401 on wrong user", async function () {
        const resp = await request(app)
            .patch('/meals/2')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                points: 15
            });

        
        expect(resp.statusCode).toEqual(401);
    });

    test("400 on invalid data", async function () {
        const resp = await request(app)
            .patch('/meals/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                points: 'fifteen'
            });

      
        expect(resp.statusCode).toEqual(400);
    });

    test("400 on negative point value", async function () {
        const resp = await request(app)
            .patch('/meals/1')
            .set("authorization", `Bearer ${u1Token}`)
            .send({
                points: -1
            });

      
        expect(resp.statusCode).toEqual(400);
    });



});