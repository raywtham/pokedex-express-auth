const express = require('express');
const handlebars = require('express-handlebars');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const FILE = 'pokedex.json';
const cookieParser = require('cookie-parser')
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
app.use(cookieParser())
// Set up body-parser to automatically parse form data into object
app.use(bodyParser.urlencoded({ extended: true }));

// Set up method-override for PUT and DELETE forms
app.use(methodOverride('_method'));

/**
 * ===================================
 * Routes
 * ===================================
 */
 app.get('/users/new', (request, response) => {
  // send response with some data
  response.render('form');
});

 app.get('/users/login', (request, response) => {
  // send response with some data
  if(request.cookies.loggedin == 1) {var loggedin = true } else { var loggedin = false}
    response.render("login", {loggedinf: loggedin,
      name : request.cookies.username});
});
 app.post('/users/login', (request, response) => {
  // send response with some data
  jsonfile.readFile('users.json', (err, obj)=>{
    bcrypt.compare(request.body.password, obj.password, function(err, res) {
    // res == true
    if(res == true){ 
      response.cookie('loggedin','1')
      response.cookie('username',obj.name)
      response.redirect('/users')
    }
    else{
      response.redirect('/users/login')

    }
  });

  })
});


 app.get('/users/logout', (request, response) => {
  // send response with some data
  response.cookie('loggedin', '0');
  response.redirect("/")
});

 app.get('/users', (request, response) => {
  // send response with some data
  if(request.cookies.loggedin == 1) {var loggedin = true } else { var loggedin = false}
    response.render("users", {loggedinf: loggedin,
      name : request.cookies.username});
});



 app.post('/users', (request, response) => {
  // send response with some data
  let obj = {}
  obj.name =   request.body.name
  bcrypt.hash(request.body.password, 10, function(err, hash) {
   console.log(hash)
   obj.password = hash
   let FILE = 'users.json'
   jsonfile.writeFile(FILE,obj,(err)=>{
    console.log(err)
    response.cookie('username', request.body.name)
    response.cookie('loggedin', '1')
    response.render("users", {name : request.body.name});

  }
  )
 })
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
     if(request.cookies.loggedin == 1) {var loggedin = true } else { var loggedin = false}

    if (err) console.error(err);
    response.render('home', { pokemon: obj.pokemon,loggedinf : loggedin });
  });
});

 app.post('/', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    let newPokemon = request.body;
    obj.pokemon.push(newPokemon);

    jsonfile.writeFile(FILE, obj, err2 => {
      if (err2) console.error(err2);
      if(request.cookies.loggedin == 1) {var loggedin = true } else { var loggedin = false}
      response.render('home', { pokemon: obj.pokemon, loggedinf : loggedin });
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
