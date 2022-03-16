-- Contains user auth info and points allotment. 
-- points won't exist after registration, 
-- user needs to submit calculate points form to have a points value.
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) NOT NULL,
  password TEXT NOT NULL,
  points INTEGER
);

-- recipes that have been saved by ANY user.
CREATE TABLE recipes (
  recipe_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  ww_points INTEGER
);

-- JOIN table to handle users-recipes Many-to-Many relationship
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