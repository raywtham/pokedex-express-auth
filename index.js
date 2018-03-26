const express = require('express');
const handlebars = require('express-handlebars');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');

const FILE = 'pokedex.json';
const USERDATA = 'users.json';

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

/**
 * ===================================
 * Routes
 * ===================================
 */
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
    response.render('home', { pokemon: obj.pokemon });
  });
});

app.get('/users/new', (request, response) => {
  response.render('register');
});

app.get('/users/login', (request, response) => {
  response.render('login');
});

app.post('/users/login', (request, response) => {
  jsonfile.readFile( USERDATA, ( err, obj ) => {
    //check if user exit
    for (let i=0; i<obj.user.length; i++){
      if (request.body.username == obj.user[i].username){
        var match = true;
        var hash = obj.user[i].password;
      }    
    }

    //return error if username incorrect
    if (match == undefined){
      response.send('Username does not exist.');
    }

    if (match === true){   //Username exists

      bcrypt.compare(request.body.password, hash, (err, result) => { //run bcryot compare
          if (result === true) {
            response.cookie('loggedin', true);
            response.send('Logged in'); //Pass - Cookie! - Redirect.

          } else {
            response.send("Log in fail, <a href='/users/login'>Try again</a>");
            //Fail - Wrong pass
          }
      });
    }
  });
});

app.post('/users', (request, response) => {
  jsonfile.readFile(USERDATA, (err,obj) =>{
    userid = request.body.username;
    //read userdata
    
    //check if user exist
    //if exist, err. cannot overwrite
    for (let i=0; i<obj.user.length; i++){
      if (userid == obj.user[i].username){
        response.send('User already exist, please use another name');
      }
    }

    //Hash PW
    bcrypt.hash(request.body.password, 10, (err, hash) => {
      
      let userinfo = {
        username: request.body.username,
        password: hash
      }
    obj.user.push(userinfo);

    jsonfile.writeFile(USERDATA, obj, err2 => {
      if (err2) console.error(err2);

      // redirect to GET /:id
      response.redirect('/');
    //if okay, hash the password,
    //write username and hash into file
    //render home
      });
    });
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
