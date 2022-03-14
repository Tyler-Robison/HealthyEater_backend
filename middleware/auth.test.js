"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const { authenticateJWT, ensureCorrectUser } = require("./auth");


const { SECRET_KEY } = require("../config");
const passingToken = jwt.sign({ id: 1 }, SECRET_KEY);
const failingToken = jwt.sign({ id: 1 }, "bad_key");


describe("authenticateJWT", function () {
    test("works: via header", function () {
        const req = { headers: { authorization: `Bearer ${passingToken}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        // ensures that passing token was de-coded and set into res.locals
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                id: 1
            },
        });
    });

    test("works: no header", function () {
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    test("works: invalid token", function () {
        const req = { headers: { authorization: `Bearer ${failingToken}` } };
        const res = { locals: {} };
        // not excepting error on failing token
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        // ensures that failing token was NOT de-coded and set into res.locals
        expect(res.locals).toEqual({});
    });
});

describe("ensureCorrectUser", function () {

    // only testing to ensure middleware doesn't throw error
    // when given matching param id and token id (from res.locals)
    test("works: same user", function () {
        const req = { params: { id: "1111" } };
        const res = { locals: { user: { id: 1111 } } };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureCorrectUser(req, res, next);
    });

    test("unauth: mismatch", function () {
        const req = { params: { id: "1111" } };
        const res = { locals: { user: { id: 2222 } } };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectUser(req, res, next);
    });

    test("unauth: if anon", function () {
        const req = { params: { username: "test" } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectUser(req, res, next);
    });
});