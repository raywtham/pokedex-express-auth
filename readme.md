# Pokedex Express App (with Authentication)

For this exercise, we will continue building our Pokedex web app - setting up our server to allow users to register and login with authentication.

The starter code in this repository builds upon the previous exercise's ([pokedex-express](https://github.com/wdi-sg/pokedex-express)).

## Getting Started

1. Fork and clone this repository to your computer
2. Run `yarn install` to install dependencies
3. Look in the starter file called `index.js`, run `nodemon` to start local server on port 3000
4. Open `localhost:3000` on your browser and see the home page

#### Note on comments:

The comments in this file are deliberately verbose meant to orientate you to an Express app for the first time. Feel free to remove any or all comments.

## Deliverables

* Expose a new endpoint that intercepts GET requests to `/users/new`, which responds with a HTML page with a new user registration `form` that has these fields: `name` and `password`

* Point the form to submit data to the route (`/users/new`) using POST method

* Using `bcrypt` hash the password before saving all the user data into `users.json`

* Save a cookie to record that the user is currently logged in then redirect to the root `'/'` endpoint

* Expose a new endpoint that intercepts GET requests to `/users/logout`, which clears the cookie's loggedin status and redirects to `'/'`

* Expose a new endpoint that intercepts GET requests to `/users/login`, which responds with a HTML page with a user login `form` that has these fields: `name` and `password`

* Point the form to submit data to the route (`/users/login`) using POST method

* Use `bcrypt` to compare the password in the `form` with the password saved in the JSON file. Save the loggedin status in the cookie and redirect to '/' if successful

## Further

\* \* \*
