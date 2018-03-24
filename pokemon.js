const jsonfile = require('jsonfile');
const FILE = 'pokedex.json';

module.exports = {
    createForm: (request, response) => {
        response.render('pokemon/new')
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
    get: (request, response) => {
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
    show: (request, response) => {
        jsonfile.readFile(FILE, (err, obj) => {
            if (err) console.error(err);
            let context = {
                pokemon: obj.pokemon,
                login: request.cookies.login
            };
            // console.log(typeof(request.cookies.login));
            response.render('home', context);
        });
    },
    create: (request, response) => {
        jsonfile.readFile(FILE, (err, obj) => {
            if (err) console.error(err);

            let newPokemon = request.body;
            obj.pokemon.push(newPokemon);

            jsonfile.writeFile(FILE, obj, err2 => {
                if (err2) console.error(err2);
                response.render('home', { pokemon: obj.pokemon });
            });
        });
    },
    update: (request, response) => {
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
}