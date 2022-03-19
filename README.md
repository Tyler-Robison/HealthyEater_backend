# Healthy Eater
An App designed to help users lose weight while eating great tasting recipes.

Live version can be viewed at: https://healthyeater.surge.sh/healthyeater

## About Healthy Eater:
I wanted to create an app that would allow users to search for recipes based on their favorite ingredients and use those recipes to construct a mealplan aimed at helping them lose weight. 

Healthy Eater has a JavaScript/React frontend and a Node.js, Express.js, postgres backend. 

[Create React App](https://github.com/facebook/create-react-app) was used to create front-end project.

Recipe Search is performed by integration with the [Spoontacular API](https://spoonacular.com/food-api)  

While the Spoontacular API does have a mealplanning feature, I chose to build my own mealplanner from the ground up. 

## User Flow

Upon visiting the site, non signed-in users will be directed to the login and registration pages. After Entering a username/password users will have access to the entire site, the homepage will recommend searching for recipes before doing anything else. 

Once they visit Recipe Search, users will enter ingredients then click "Get Recipes" to see their results. Optionally, users can add nutritional constraints to the search. 

User will be re-directed to a page containing their search results. From there, users can view additional detail about any recipe that interests them. 

From the recipe detail page users will see in-depth information about that recipe and have the option to save the recipe if they choose to.

With at least one recipe saved, users can now visit Saved Recipes, where they can view and delete their saved recipes. 

Users can now visit the mealplanner, which allows them to enter their saved meals into a weekly planner.

## Healthy Eater front-end components

1) **Register/login/logout** - for handling user authentication and authorization. Username/Password are all that is required. There is an option to login as a guest. 

2) **Recipe Search** - Allows users to search for recipes based on ingredients and nutritional constraints. Returns a list of recipes that meet the search criteria. Users can get in depth information about any recipe including steps, equipment needed, ingredients needed, nutritional information, cook time and how many people it serves. From recipe detail page, users can choose to save the recipe.

3) **Saved Recipes** - Allows users to view and delete all recipes they have saved. In-depth recipe detail can also be accessed from this page

4) **Calculate Points** - Allows users to calculate their weekly allowance of Weight Watchers Smart Points based on gender, age, height, weight and activity level. Uses 2018 version of Weight Watchers Smart Points calculation method.

5) **Mealplan** - Allows users to create a mealplan based on their saved recipes. Drop-down menu allows users to select a day and set their chosen recipe into that day. Daily points used and weekly points used will be automatically updated. Users can remove individual recipes from mealplanner or clear the entire calendar. Recipe Detail can also be viewed from this page. 

6) **APIs** - All axios calls are centralized in an API folder. All API requests to Spoontacular API are made from the back-end based on information sent to the backend by the front-end. Results are returned to the front-end. Anytime an update is made on the front-end that requires updating a table (A user saving a recipe or deleting a value from their mealplan) a request is made to the back-end and only upon succesful back-end update will the change be reflected in the front-end.

## Front-end languages: 
JavaScript, HTML5, CSS3, JSX
## Front-end libraries: 
React, Bootstrap, Formik, Axios, JSONWebToken

A map of all the React Components can be found in the frond end repository under "React_Components.jpg".

Front end npm commands listed at the bottom of the page.



## Healthy Eater Backend is divided into 4 tables which can be viewed under eater-schema.sql

In summary, the 4 tables are:
1) users - Contains user authentication information and weekly points alotment.
2) recipes - Contains recipe name and Weight Watchers points value.
3) users_recipes - JOIN table for handling the users-recipes Many-to-Many relationship.
4) user_mealplan - Contains user mealplan data.

There are 3 models - MealPlan, Recipe and User that contain all methods related to interacting with the 4 tables. 

There are 4 backend routes, defined in app.js
1) /auth - Routes related to user auth.
2) /user - Routes for getting user info and account deletion.
3) /recipes - Routes that get recipe info from Spoontacular API and manage user recipes.
4) /meals - Routes related to user mealplan.

All requests to Spoontacular API are made from the back-end.

## Back-end languages: 
JavaScript, SQL
## Back-end libraries/frameworks: 
Express, Node, postgres, Axios, PG, bcrypt, JSONWebToken, JSONschema


## How To Install Healthy Eater: 

1) Clone the repo.

To clone back-end:   git clone git@github.com:Tyler-Robison/HealthyEater_backend
To clone front-end:  git clone git@github.com:Tyler-Robison/HealthyEater_frontend

2) Use npm install to install all dependencies in both repos separately. 

3) In the back-end, secret.js contains the API key needed to interact with Spoontacular API, this file is not included in the repo. You will need to obtain a free key from [Spoontacular API](https://spoonacular.com/food-api) and put it inside a secret.js file kept in the top level of the app. If secret is placed elsewhere you will have to update all paths to it.


## Scripts:
Must be run in root directory

### Front End:

### `npm start`
Runs the app in development mode.
Open http://localhost:3000 to view it in the browser.
CTRL c to exit. 

### `npm test`
Runs all tests

### `npm test <filename>`
Runs a specific test suite

### Back End:

### `node server.js`
Starts the server
CTRL c to exit

Runs the app in the development mode.
Opens the API on port 3001 http://localhost:3001.
can also use nodemon start, this will require installing nodemon

### `npm test`
Runs all tests

### `npm test <filename>`
Runs a specific test suite

**Warning:** When running all tests in backend via npm test, you will sometimes get an error "expected password response, got message type 88" 
This can be fixed by running the failing test suite individually then running all tests again. The failing test suite will almost always be tokens.test.js or auth.test.js

Any comments or questions can be sent to tylerobison758758@gmail.com