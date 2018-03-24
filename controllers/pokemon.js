const jsonfile = require('jsonfile');

const FILE = 'pokedex.json';

//wrap contents in this
module.exports = {
      //rewrote starter code
      goToPokemonCreation: (request, response) => {
            // send response with some data, i.e, respond with a rendering of new.handlebars
            response.render('new');
      },

      editBasedOnId: (request, response) => {
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

      getPokemonStats: (request, response) => {
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

      //Qn 9
      goToHome: (request, response) => {
            jsonfile.readFile(FILE, (err, obj) => {
                  if (err) console.error(err);
                  //variable for whether loggedIn or not
                  let showButtons;
                  //try to get the cookie
                  let visits = request.cookies["visits"];
                  //set variable for variableLogInText
                  let variableLogInText;
                  //if no cookie
                  if (visits === undefined) {
                        showButtons = true;
                        //tell the user that he/she is not logged in
                        variableLogInText = "You are not logged in!";
                  } else {
                        showButtons = false;
                        //tell the user that he/she is logged in
                        variableLogInText = "Hi, you're logged in!";
                  };

                  let context = {
                        pokemon: obj.pokemon,
                        logInText: variableLogInText,
                        showLoginButtons: showButtons
                  }
                  response.render('home', context);
            });
      },

      saveNewPokemon: (request, response) => {
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
      },

      savePokemonEdit: (request, response) => {
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

      deletePokemon: (request, response) => {
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

      //end starter code
};