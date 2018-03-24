const express = require('express');
const handlebars = require('express-handlebars');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
//remember to require relevant library
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');

const FILE = 'pokedex.json';
const userFILE = "userDex.json"

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

// Set handlebars to be the default view engine
app.engine('handlebars', handlebars.create().engine);
app.set('view engine', 'handlebars');

// Set static folder
app.use(express.static('public'));

// Set up body-parser to automatically parse form data into object
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set up method-override for PUT and DELETE forms
app.use(methodOverride('_method'));

//ask express to use cookie parser (to use cookies)
app.use(cookieParser());
//no require for bcrypt

/**
 * ===================================
 * Routes
 * ===================================
 */

//require the routes file
require("./routes")(app);

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
app.listen(3000, () =>
  console.log('~~~ Tuning in to the waves of port 3000 ~~~')
);