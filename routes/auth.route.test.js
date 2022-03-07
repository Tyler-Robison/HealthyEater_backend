"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_routeTestCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/token */

describe("POST /auth/token", function () {
    test("get back properly formatted token given correct inputs", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: "user1",
                password: "pass1",
            });

        // get back a token
        expect(resp.body).toEqual({ "token": expect.any(String), });

        // token contains correct information
        const decoded = jwt.decode(resp.body.token)
        expect(decoded).toEqual({ username: 'user1', isAdmin: false, id: 1, iat: expect.any(Number) })
    });

    test("401 on non-existent user", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: "bac_user_info",
                password: "pass1",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("401 on wrong password", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: "user1",
                password: "bad_password",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("400 on missing data", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: "user1",
            });
        expect(resp.statusCode).toEqual(400);
    });

    test("400 on invalid data", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: 42,
                password: "pass1",
            });
        expect(resp.statusCode).toEqual(400);
    });

});

/************************************** POST /auth/register */

describe("POST /auth/register", function () {
    test("unlogged in users can register and get token", async function () {
        const resp = await request(app)
            .post("/auth/register")
            .send({
                username: "user7",
                password: "pass7"
            });
        expect(resp.statusCode).toEqual(201);

        // get back a token
        expect(resp.body).toEqual({ "token": expect.any(String), });

        // token contains correct information
        const decoded = jwt.decode(resp.body.token)
        expect(decoded).toEqual({ username: 'user7', isAdmin: false, id: expect.any(Number), iat: expect.any(Number) })
    });

    test("bad request with missing username", async function () {
        const resp = await request(app)
            .post("/auth/register")
            .send({
                password: "pass7",
            });
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid username", async function () {
        const resp = await request(app)
            .post("/auth/register")
            .send({
                username: 12345,
                password: "pass7"
            });
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with missing password", async function () {
        const resp = await request(app)
            .post("/auth/register")
            .send({
                username: "newUser",
            });
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid password", async function () {
        const resp = await request(app)
            .post("/auth/register")
            .send({
                username: "user7",
                // min pwd length is 5
                password: "abc"
            });
        expect(resp.statusCode).toEqual(400);
    });

});