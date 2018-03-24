const FILE = 'pokedex.json';
const jsonfile = require('jsonfile');

module.exports = {
  create: (request, response) => {
    // send response with some data
    response.render('new');
  },

  edit: (request, response) => {
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
  },

  getPokemon: (request, response) => {
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
  },

  home: (request, response) => {
    jsonfile.readFile(FILE, (err, obj) => {
      if (err) console.error(err);

      response.render('home', { pokemon: obj.pokemon, loggedin: request.cookies.loggedin });
    });
  },

  postCreate: (request, response) => {
    jsonfile.readFile(FILE, (err, obj) => {
      if (err) console.error(err);

      let newPokemon = request.body;
      obj.pokemon.push(newPokemon);

      jsonfile.writeFile(FILE, obj, (err2) => {
        if (err2) console.error(err2);
        response.render('home', { pokemon: obj.pokemon });
      });
    });
  },

  putEdit: (request, response) => {
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
  },

  delete: (request, response) => {
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
  }
};
