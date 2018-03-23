const express = require('express');
const handlebars = require('express-handlebars');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const FILE = 'pokedex.json';
const USERFILE = 'users.json';

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

// Set up cookie-parser
app.use(cookieParser());

/**
 * ===================================
 * Routes
 * ===================================
 */

//GET methods
//create signup form
app.get('/users/new', (request,response) => {
  response.render('signUp');
});

//create login form
app.get('/users/login', (request,response) => {
  response.render('login');
});

app.get('/users/logout', (request,response) => {
  response.cookie('logged_in', 'false');
  response.redirect("/");
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
    let context = {
      pokemon: obj.pokemon,
      status: false
    }
    response.render('home', context);
  });
});

//OTHER methods
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

app.post('/users', (request,response) => {
  let info = request.body;
  //delete submit
  delete info["submit"];
  console.log(info);

  bcrypt.hash(info.password, 10, (err, hash) => {
    console.error(err);
    console.log(hash);
    info.password = hash;
    console.log(info);

    jsonfile.writeFile(USERFILE,info,err2 =>{
      if (err2) console.error(err2);
      response.cookie('logged_in', 'true');
      response.redirect("/");
    })
  });
});

app.post('/users/login', (request,response) => {
  
  jsonfile.readFile(USERFILE, (err,obj) => {
    if (err) console.log(err);
    console.log(obj);
    //current input
    let info = request.body;
    //delete submit
    delete info["submit"];
    bcrypt.hash(info.password, 20, (err2, hash) => {
      info.password = hash;
    });

    //compare with old input
    bcrypt.compare(info.password,obj.password, function(err3, res) {
      if (err3) console.error(err3);
      if(res === true ){
        response.cookie('logged_in', 'true');

        jsonfile.readFile(FILE, (err4, obj2) => {
          if (err4) console.error(err4);
          console.log(obj2.pokemon);
          let context = {
            pokemon: obj2.pokemon,
            status: true
          }
          response.render('home', context);
        });
      }else{
        response.redirect("/users/login");
      }
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
