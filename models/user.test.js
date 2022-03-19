"use strict";

const db = require("../db.js");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const User = require('./user.js')
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

/************************************** user authenticate */

describe("authenticate", function () {
    test("authenticates existing user", async function () {
        const user = await User.authenticate("user1", "password1");
        expect(user).toEqual({
            id: expect.any(Number),
            username: "user1"
        });
    });

    test("unauth if no such user", async function () {
        try {
            await User.authenticate("bad_user", "password1");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if wrong password", async function () {
        try {
            await User.authenticate("user1", "bad_pass");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

/************************************** user register */

describe("register", function () {
    test("registers new user", async function () {
        const hashedPassword = await bcrypt.hash('password', BCRYPT_WORK_FACTOR);

        const user = await User.register({ username: 'user3', password: hashedPassword })
        expect(user).toEqual({
            id: expect.any(Number),
            username: "user3"
        });

        const found = await db.query("SELECT * FROM users WHERE username = 'user3'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("fails on missing username", async function () {
        const hashedPassword = await bcrypt.hash('password', BCRYPT_WORK_FACTOR);

        try {
            await User.register({ password: hashedPassword })
            fail();
        } catch (err) {
            // 23502 = NOT NULL VIOLATION
            expect(err.code).toEqual('23502')
        }
    });

    test("fails on missing password", async function () {

        try {
            await User.register({ username: 'user3' })
            fail();
        } catch (err) {
            // data and salt arguments required, can't seem to test for the specific error
            expect(err).toBeTruthy()
        }
    });

    test("fails on duplicate user", async function () {
        const hashedPassword = await bcrypt.hash('password', BCRYPT_WORK_FACTOR);

        try {
            await User.register({ username: 'user1', password: hashedPassword})
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** find all */

describe("findAll", function () {
    test("finds all users", async function () {
        const users = await User.findAll();
        expect(users).toEqual([
            { id: expect.any(Number), username: "user1" },
            { id: expect.any(Number), username: "user2" },
        ]);
    });
});

/************************************** get specific user */

describe("get", function () {
    test("gets a specific user", async function () {
        const user = await User.get(1);
        expect(user).toEqual(
            { id: expect.any(Number), username: "user1", points: null });
    });

    test("not found err on invalid user id", async function () {
        try {
            await User.get(999999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }

    });
});

/************************************** set points */

describe("get", function () {
    test("Can set points", async function () {
        const user = await User.setPoints(1, 32)
        expect(user).toEqual(
            { id: 1, points: 32 });
    });

    test("Can alter points", async function () {
        await User.setPoints(1, 32)
        const user = await User.setPoints(1, 17)
        expect(user).toEqual(
            { id: 1, points: 17 });
    });

    test("not found err on invalid user id", async function () {
        try {
            await User.setPoints(999999, 32)
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** remove user */

describe("remove", function () {
    test("Can remove user", async function () {
        await User.remove(1);
        const res = await db.query(
            "SELECT * FROM users WHERE id=1");
        expect(res.rows.length).toEqual(0);
      });

    test("not found err on invalid user id", async function () {
        try {
            await User.remove(999999)
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});



