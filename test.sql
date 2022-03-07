SELECT r.recipe_id, m.day, r.name, r.ww_points
      FROM user_mealplan m
      JOIN user_recipes r
      ON r.recipe_id  =  m.recipe_id
      WHERE m.user_id = 3;

      CREATE TABLE recipes (
  recipe_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  ww_points INTEGER
);

-- saved recipes associated with a single user
-- differnt users can have same recipe
CREATE TABLE users_recipes (
  recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE,
  user_id INTEGER REFERENCES users ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, user_id)
);

-- stores user mealplans
-- can have same meal applied to several different days
CREATE TABLE user_mealplan (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users ON DELETE CASCADE,
  recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE,
  day TEXT NOT NULL
);

