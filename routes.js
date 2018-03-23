// const users = require('./controllers/users')
const jsonfile = require('jsonfile')
const bcrypt = require('bcrypt');
// const cookieParser = require('cookie-parser');

const FILE = 'pokedex.json';

module.exports = (app) => {

  app.get('/users/new', (req, res) => {
    res.render('signup');
  });

  app.post('/users', (req, res) => {
    console.log(req.body);

    jsonfile.readFile("users.json", (err, obj) => {
      if (err) console.error(err);

      bcrypt.hash(req.body.password, 1, (err, hash) => {
        obj[req.body.name] = hash;

        jsonfile.writeFile("users.json", obj, {spaces: 2}, (err2) => {
          console.log(err2);
        });
        res.cookie("loggedin", true);
        res.redirect("/");
      });
    });
  });

  app.get('/users/logout', (req, res) => {
    res.clearCookie("loggedin");
    res.redirect("/");
  });

  app.get('/users/login', (req, res) => {
    res.render('login');
  });

  app.post('/users/login', (req, res) => {
    let name = req.body.name;
    let password = req.body.password;
    // console.log(password);
    bcrypt.hash(password, 1, (err, hash) => {
      bcrypt.compare(password, hash, (err, results) => {
        console.log(results);
        if (results) {
          res.cookie("loggedin", true);
          res.redirect("/");
        } else {
          res.render("login");
        }
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

      response.render('home', { pokemon: obj.pokemon, loggedin: request.cookies.loggedin });
    });
  });

  app.post('/', (request, response) => {
    jsonfile.readFile(FILE, (err, obj) => {
      if (err) console.error(err);

      let newPokemon = request.body;
      obj.pokemon.push(newPokemon);

      jsonfile.writeFile(FILE, obj, (err2) => {
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
}
