const jsonfile = require('jsonfile');
const FILE = 'pokedex.json';
let pokedexObj;

jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);
    pokedexObj = obj;
});

function getPokemonRenderPage(page, request, response) {
  // attempt to retrieve the requested pokemon
    let inputId = request.params.id;
    let pokemon = pokedexObj.pokemon.find(currentPokemon => {
      return currentPokemon.id === parseInt(inputId, 10);
    });

    if (pokemon === undefined) {
      response.render('404');
    } else {
      let context = { pokemon: pokemon };
      response.render(page, context);
    }
}

module.exports = {
  newForm: (request, response) => {
    response.render('new');
  },

  get: (request, response) => {
    getPokemonRenderPage('pokemon', request, response);
  },

  editForm: (request, response) => {
    getPokemonRenderPage('edit', request, response);
  },

  edit: (request, response) => {
    // attempt to retrieve the requested pokemon
    let inputId = request.params.id;
    let updatedPokemon = request.body;

    for (let i = 0; i < pokedexObj.pokemon.length; i++) {
      let currentPokemon = pokedexObj.pokemon[i];

      if (currentPokemon.id === parseInt(inputId, 10)) {
        updatedPokemon.id = parseInt(updatedPokemon.id, 10);
        pokedexObj.pokemon[i] = updatedPokemon;
      }
    }
    jsonfile.writeFile(FILE, pokedexObj, err2 => {
      if (err2) console.error(err2);
      response.redirect(`/${request.params.id}`);
    });
  },

  delete: (request, response) => {
    // attempt to retrieve the requested pokemon
    let inputId = request.params.id;

    for (let i = 0; i < pokedexObj.pokemon.length; i++) {
      let currentPokemon = pokedexObj.pokemon[i];
      if (currentPokemon.id === parseInt(inputId, 10)) {
        pokedexObj.pokemon.splice(i, 1);
      }
    }
    jsonfile.writeFile(FILE, pokedexObj, err2 => {
      if (err2) console.error(err2);
      response.redirect('/');
    });
  }
}