const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

// inserts 2 users, 2 recipes, 2 join table rows and 4 mealplans
// reset primary keys to 1 where needed
async function commonBeforeAll() {
  await db.query("DELETE FROM users");
  await db.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
  await db.query("DELETE FROM recipes");
  await db.query("DELETE FROM users_recipes");
  await db.query("DELETE FROM user_mealplan");
  await db.query("ALTER SEQUENCE user_mealplan_id_seq RESTART WITH 1");

  await db.query(`
    INSERT INTO users(username,
                      password)
    VALUES ('user1', $1),
           ('user2', $2)`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]);

  await db.query(`
  INSERT INTO recipes(recipe_id,
                    name,
                    ww_points)
  VALUES (1111, 'fish stew', 19),
         (2222, 'bacon', 7)`);

  await db.query(`
  INSERT INTO users_recipes(recipe_id, user_id)
  VALUES (1111, 1), (2222, 2), (2222, 1)`);

  await db.query(`
  INSERT INTO user_mealplan(recipe_id, user_id, day)
  VALUES 
  (1111, 1, 'Mon'), 
  (1111, 1, 'Tues'), 
  (2222, 1, 'Tues'), 
  (1111, 1, 'Wed')`);
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

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
};