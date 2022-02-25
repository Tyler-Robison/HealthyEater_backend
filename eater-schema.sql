-- Contains user auth info in addition to points allotment. 
-- points won't exist after registration, 
-- user needs to submit calculate points form.
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  points INTEGER
);

-- for user created meals based on choosen ingredients
CREATE TABLE user_meals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- for recipes return by search that the user chooses to save
CREATE TABLE user_recipes (
  recipe_id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users ON DELETE CASCADE,
  name TEXT NOT NULL,
  ww_points INTEGER
);

-- stores user mealplans, will need JOIN operations to access recipe info
-- can't use aggregate key as user_id + recipe_id can be duplicate
CREATE TABLE user_mealplan (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users ON DELETE CASCADE,
  recipe_id INTEGER REFERENCES user_recipes ON DELETE CASCADE,
  day TEXT NOT NULL
);