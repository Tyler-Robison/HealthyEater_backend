"use strict";

const db = require("../db.js");
const User = require('../models/user')
const Recipe = require('../models/recipe')
const MealPlan = require('../models/mealPlan')
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await db.query("DELETE FROM recipes");
    await db.query("DELETE FROM users_recipes");
    await db.query("DELETE FROM user_mealplan");
    await db.query("ALTER SEQUENCE user_mealplan_id_seq RESTART WITH 1");

    await User.register({username: 'user1', password: 'pass1', isAdmin: false})
    await User.register({username: 'user2', password: 'pass2', isAdmin: false})
    await User.register({username: 'admin1', password: 'pass3', isAdmin: true})

    await Recipe.saveRecipe(1, 'bacon', 1234, 10)
    await Recipe.saveRecipe(1, 'eggs', 5678, 20)

    await MealPlan.createMealPlan(1, 1234, 'Mon')
    await MealPlan.createMealPlan(1, 5678, 'Tues')
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

// TODO: declare users in global space, feed var into createToken
const u1Token = createToken({ username: "user1", id: 1, isAdmin: false });
const u2Token = createToken({ username: "user2", id: 2, isAdmin: false });
const adminToken = createToken({ username: "admin1", id: 3, isAdmin: true });

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
};