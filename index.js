const express = require('express');
const handlebars = require('express-handlebars');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const FILE = 'pokedex.json';

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

app.use(cookieParser());

// Set up body-parser to automatically parse form data into object
app.use(bodyParser.urlencoded({ extended: true }));

// Set up method-override for PUT and DELETE forms
app.use(methodOverride('_method'));

/**
 * ===================================
 * Routes
 * ===================================
 */

`ADD A NEW USER`

app.get('/users/new', (request, response) => {
  response.clearCookie('logged-in');
  response.render('register');
});

app.post('/users', (request, response) => {
  jsonfile.readFile('users.json', (err, obj) => {
    if (err) console.error(err);

    var name = request.body.name;
    var password = request.body.password;

    // hash the password
    bcrypt.hash(password, 10, (err, hash) => {

      // create new user object
      let newUser = {
        name: name,
        hash: hash
      }

      // add to users.json
      if (obj.users === undefined) obj.users = [];
      obj.users.push(newUser);

      jsonfile.writeFile('users.json', obj, {spaces: 4}, function(err2) {
        if (err2) console.error(err2);

        // Save a cookie to record that the user is currently logged in
        response.cookie('logged-in', 'true');
        // then redirect to the root '/' endpoint
        response.redirect(301,'/');
      });
    });
  });
});

'USER LOG IN'

// Expose a new endpoint that intercepts GET requests to /users/logout
app.get('/users/logout', (request, response) => {
  console.log('logging out');
  // clears the cookie's loggedin status
  response.clearCookie('logged-in');
  // redirects to '/'
  response.redirect(301,'/');
});

// Expose a new endpoint that intercepts GET requests to /users/login, which responds with a HTML page with a user login form that has these fields: name and password
app.get('/users/login', (request, response) => {
  response.clearCookie('logged-in');
  response.render('login');
});

// Point the form to submit data to the route (/users/login) using POST method
app.post('/users/login', (request, response) => {
  // Use bcrypt to compare the password in the form with the password saved in the JSON file. Save the loggedin status in the cookie and redirect to '/' if successful

  var name = request.body.name;
  var password = request.body.password; // plain text

  // find name
  jsonfile.readFile('users.json', (err, obj) => {
    if (err) console.error(err);
    var notFound = true;

    var currUser;
    for (var i=0;i<obj.users.length;i++) {
      var user = obj.users[i];
      // user found
      if (user.name === name) {
        currUser = user;
      }
    }

    if (currUser) {
      // retrive hash
      var hash = currUser.hash;
      // check if password is correct
      bcrypt.compare(password, hash, function(err, res) {
        console.log(hash);
        if( res === true ){
          // set cookie
          response.cookie('logged-in', 'true');
          response.redirect(301,'/');
          return;
        }
        else {
          console.log('incorrect password');
          response.send("password incorrect!");
          return;
        }
      });
    }
    else if (currUser === undefined) {
      // if name not found - redirect to /users/new
      console.log('user not found');
      response.redirect('/users/new');
      return;
    }
  });
});

app.get('/new', (request, response) => {
  // send response with some data
  response.render('new');
});

app.get('/:id/edit', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    // attempt to retrieve the requested pokemon
    let inputId = request.params.id;
    let pokemon = obj.pokemon.find(currentPokemon => {
      return currentPokemon.id === parseInt(inputId, 10);
    });

    if (pokemon === undefined) {
      // return 404 HTML page if pokemon not found
      response.render('404');
    } else {
      // return edit form HTML page if found
      let context = {
        pokemon: pokemon
      };

      response.render('edit', context);
    }
  });
});

app.get('/:id', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    // attempt to retrieve the requested pokemon
    let inputId = request.params.id;
    let pokemon = obj.pokemon.find(currentPokemon => {
      return currentPokemon.id === parseInt(inputId, 10);
    });

    if (pokemon === undefined) {
      // return 404 HTML page if pokemon not found
      response.render('404');
    } else {
      // return pokemon HTML page if found
      let context = {
        pokemon: pokemon
      };

      response.render('pokemon', context);
    }
  });
});

`HOMEPAGE`
app.get('/', (request, response) => {
  console.log('im here - load homepage');
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    // retrived logged-in cookie if it exists
    var logged_in_cookie = request.cookies['logged-in'];
    var logged_in;
    if (logged_in_cookie !== undefined) logged_in = true;
    else logged_in = false;
    var context = {
      pokemon: obj.pokemon,
      logged_in: logged_in
    }
    response.render('home', context);
  });
});

`ADD A NEW POKEMON`
app.post('/', (request, response) => {
  console.log('im here - add a new pokemon');
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    let newPokemon = request.body;
    newPokemon.id = parseInt(newPokemon.id); // convert to integer
    obj.pokemon.push(newPokemon);

    jsonfile.writeFile(FILE, obj, {spaces: 4}, function(err2) {
      if (err2) console.error(err2);
      response.render('home', { pokemon: obj.pokemon });
    });

  });
});

app.put('/:id', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    // attempt to retrieve the requested pokemon
    let inputId = request.params.id;
    let updatedPokemon = request.body;

    for (let i = 0; i < obj.pokemon.length; i++) {
      let currentPokemon = obj.pokemon[i];

      if (currentPokemon.id === parseInt(inputId, 10)) {
        // convert input id from string to number before saving
        updatedPokemon.id = parseInt(updatedPokemon.id, 10);

        // update pokedex object
        obj.pokemon[i] = updatedPokemon;
      }
    }
    // save pokedex object in pokedex.json file
    jsonfile.writeFile(FILE, obj, {spaces: 4}, function(err2) {
      if (err2) console.error(err2);
      response.redirect(`/${request.params.id}`);
    });
  });
});

app.delete('/:id', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    // attempt to retrieve the requested pokemon
    let inputId = request.params.id;

    for (let i = 0; i < obj.pokemon.length; i++) {
      let currentPokemon = obj.pokemon[i];

      if (currentPokemon.id === parseInt(inputId, 10)) {
        // convert input id from string to number before saving
        obj.pokemon.splice(i, 1);
      }
    }
    // save pokedex object in pokedex.json file
    jsonfile.writeFile(FILE, obj, {spaces: 4}, err2 => {
      if (err2) console.error(err2);

      // redirect to GET /:id
      response.redirect('/');
    });
  });
});

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
app.listen(3000, () =>
  console.log('~~~ Tuning in to the waves of port 3000 ~~~')
);
