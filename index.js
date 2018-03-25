const express = require('express');
const handlebars = require('express-handlebars');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const FILE = 'pokedex.json';
const USER_FILE = 'users.json';

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

// Set the body parser
app.use(bodyParser.json());

// Set the cookie parser
app.use(cookieParser())

// Set static folder
app.use(express.static('public'));

// Set up body-parser to automatically parse form data into object
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set up method-override for PUT and DELETE forms
app.use(methodOverride('_method'));

/**
 * ===================================
 * Routes
 * ===================================
 */
app.get('/new', (request, response) => {
  // send response with some data
  response.render('new');
});

app.get('/users/new', (request, response) => {
  // send response with some data
  response.render('register');
});

app.get('/users/login', (request, response) => {
  // send response with some data
  response.render('login');
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

app.get('/', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);
    obj.logged_in = request.cookies['logged_in'];
    response.render('home', obj);
    // response.render('home', {pokemon: obj.pokemon});
  });
});

app.post('/', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    let newPokemon = request.body;
    obj.pokemon.push(newPokemon);

    jsonfile.writeFile(FILE, obj, err2 => {
      if (err2) console.error(err2);
      response.render('home', {
        pokemon: obj.pokemon
      });
    });
  });
});

// Get data from form when new user register, encrypt pasword and save it onto json file
app.post('/users', (request, response) => {
  jsonfile.readFile(USER_FILE, (err, obj) => {
    if (err) console.error(err);

    let user_password = request.body.password;
    // Hash the user's password
    bcrypt.hash(user_password, 10, (err, hash) => {
      // Create new user with new details
      let user = {
        password: hash,
        email: request.body.email
      }

      // Push the newly registered user into the object
      obj.users.push(user);

      // Write the object into the file
      jsonfile.writeFile(USER_FILE, obj, {
        spaces: 2
      }, err2 => {
        if (err2) console.error(err2);

        // Create cookie to indicate that user is always logged in
        response.cookie('logged_in', 'true');

        // Redirect back to localhost:3000
        response.redirect('/');
        return;
      });
    });
  });
});

// Get user login details and compare with the data in the json file
app.post('/users/login', (request, response) => {

  // Redirect user to the default page if user is already logged in
  if (request.cookies['logged_in'] == 'true') {
    console.log("logged_in cookie => true");
    //redirect
    response.redirect('/');
    return;
  }
  // User is not logged in, validate user's login details
  else {
    console.log("logged_in cookie => false");
    let plainTextPassword = request.body.password;
    let user_email = request.body.email;
    let current_user;

    jsonfile.readFile(USER_FILE, (err, obj) => {
      for (var i = 0; i < obj.users.length; i++) {
        // Found the email user entered in the login page
        if (obj.users[i].email === user_email) {
          current_user = obj.users[i];
        }
      }

      if (current_user) {
        // Compare plainTextPassword with the hashed password in the json file
        bcrypt.compare(plainTextPassword, current_user.password, (err, result) => {
          if (result === true) {
            // User password has been verified to be legit
            response.cookie('logged_in', 'true');

            // Redirect user back to the default page
            response.redirect('/');
            return;
          } else {
            response.send("Invalid Password...");
            return;
          }
        });
      }
      // Cannot find the email user entered in the login page
      else {
        response.send("Invalid Email...");
        return;
      }

    });
  }
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
    jsonfile.writeFile(FILE, obj, err2 => {
      if (err2) console.error(err2);

      // redirect to GET /:id
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
    jsonfile.writeFile(FILE, obj, err2 => {
      if (err2) console.error(err2);

      // redirect to GET /:id
      response.redirect('/');
    });
  });
});

app.delete('/users/logout', (request, response) => {
  // Clear the cookie
  response.clearCookie("logged_in");

  // Redirect back to default page after clearing the cookie
  response.redirect('/');
});

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
app.listen(3000, () =>
  console.log('~~~ Tuning in to the waves of port 3000 ~~~')
);
