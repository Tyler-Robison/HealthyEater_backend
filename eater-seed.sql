

-- password is "password" for both accounts
INSERT INTO users (username, password)
VALUES  ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q'),
        ('guest', 
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q');

INSERT INTO recipes (recipe_id, name, ww_points)
VALUES  (662670, 'Swiss Chard Wraps', 3),
        (715573, 'Simple Skillet Lasagna', 23),
        (715495, 'Turkey Tomato Cheese Pizza', 6), 
        (716221, 'Split Pea and Mushroom Soup', 16);        

INSERT INTO users_recipes (recipe_id, user_id)
VALUES (662670, 2), (715573, 2), (715495, 2), (716221, 2);

INSERT INTO user_mealplan (user_id, recipe_id, day)
VALUES  (2, 662670, 'Mon'),
        (2, 715573, 'Mon'),
        (2, 715495, 'Wed'),
        (2, 716221, 'Thurs'),
        (2, 662670, 'Sat');