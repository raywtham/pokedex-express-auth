const express = require('express');
const handlebars = require('express-handlebars');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const FILE = 'pokedex.json';
const USERDATA = 'user.json';

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
app.use(bodyParser.urlencoded({ extended: true }));

// Set up method-override for PUT and DELETE forms
app.use(methodOverride('_method'));

app.use(cookieParser());

/**
 * ===================================
 * Routes
 * ===================================
 */

 // direct to register page
app.get('/users/new', (request, response) => {
  response.render('register');
});

// login page
app.get('/users/login', (request, response) => {
  response.render('login');
});

// logout page
app.get('/users/logout', (request, response) => {
  response.clearCookie('loggedIn');
  response.redirect('/');
});

// user login page
app.post('/users/login', (request, response) => {
  jsonfile.readFile(USERDATA, (err, obj) => {
    if (err) console.error(err);

    let inputEmail = request.body.email;
    let inputPassword = request.body.password;
    let allUserData = obj.user;

    for(let i=0; i<allUserData.length; i++) {
      // match input email to database
      if(inputEmail === allUserData[i].email) {
        // match valid password
        bcrypt.compare(inputPassword, allUserData[i].password, (err, res) => {
          if (res === true) {
            // login successful
            console.log("Login Successful");
            response.cookie('loggedIn', 'true');
            response.redirect('/');
          } else {
            // invalid password
            console.log("Invalid Password");
            response.send("Invalid Password")
          }
        });
        return inputEmail;
      } else {
        // emaill not found in database
        console.log("Invalid Email");
        response.send("Invalid Email");
      }
    };
  });
});

// to receive the registration details into user.json
app.post('/users', (request, response) => {
  // read current user.json file
  jsonfile.readFile(USERDATA, (err, obj) => {
    if (err) console.error(err);

    let inputEmail = request.body.email;
    let inputPassword = request.body.password;
    let hiddenPassword = null;
    // encrypt password
    bcrypt.hash(inputPassword, 1, (err, hash) => {
      hiddenPassword = hash;
      // push new registration details into user.json
      obj.user.push({email: inputEmail, password: hiddenPassword});
      // rewrite update user.json
      jsonfile.writeFile(USERDATA, obj, {spaces: 2}, err2 => {
        if (err2) console.error(err2);
        response.cookie('loggedIn', 'true');
        response.redirect('/');
      });
    });
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

app.get('/', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);
    obj.loggedin = request.cookies['loggedIn'];
    response.render('home', { pokemon: obj.pokemon });
  });
});

app.post('/', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    let newPokemon = request.body;
    obj.pokemon.push(newPokemon);

    jsonfile.writeFile(FILE, obj, err2 => {
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

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
app.listen(3000, () =>
  console.log('~~~ Tuning in to the waves of port 3000 ~~~')
);
