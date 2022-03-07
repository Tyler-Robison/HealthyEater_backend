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

/************************************** GET /users/:id */

describe("GET /users/:id", function () {
    test("works for admin", async function () {
        const resp = await request(app)
            .get(`/users/1`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            user: {
                id: 1,
                username: "user1",
                isAdmin: false,
                mealplan: [
                    {
                        day: "Mon",
                        id: 1,
                        name: "bacon",
                        recipe_id: 1234,
                        ww_points: 10,
                    },
                    {
                        day: "Tues",
                        id: 2,
                        name: "eggs",
                        recipe_id: 5678,
                        ww_points: 20,
                    },
                ],
                points: null,
                recipes: [
                    { "name": "bacon", "recipe_id": 1234, "ww_points": 10 },
                    { "name": "eggs", "recipe_id": 5678, "ww_points": 20 }
                ]
            },
        });
    });

    test("works for same user", async function () {
        const resp = await request(app)
            .get(`/users/1`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({
            user: {
                id: 1,
                username: "user1",
                isAdmin: false,
                mealplan: [
                    {
                        day: "Mon",
                        id: 1,
                        name: "bacon",
                        recipe_id: 1234,
                        ww_points: 10,
                    },
                    {
                        day: "Tues",
                        id: 2,
                        name: "eggs",
                        recipe_id: 5678,
                        ww_points: 20,
                    },
                ],
                points: null,
                recipes: [
                    { "name": "bacon", "recipe_id": 1234, "ww_points": 10 },
                    { "name": "eggs", "recipe_id": 5678, "ww_points": 20 }
                ]
            },
        });
    });

    test("unauth for other users", async function () {
        const resp = await request(app)
            .get(`/users/1`)
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .get(`/users/1`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found if user not found", async function () {
        const resp = await request(app)
            .get(`/users/1234`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

});

/************************************** DELETE /users/:id */

describe("DELETE /users/:id", function () {
    test("works for admin", async function () {
        const resp = await request(app)
            .delete(`/users/1`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({ deleted: "1" });
    });

    test("works for same user", async function () {
        const resp = await request(app)
            .delete(`/users/1`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({ deleted: "1" });
    });

    test("unauth if not same user", async function () {
        const resp = await request(app)
            .delete(`/users/1`)
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/users/1`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found if user missing", async function () {
        const resp = await request(app)
            .delete(`/users/1234`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

});