//require the files that everything here links to
const pokemon = require('./controllers/pokemon');
const users = require('./controllers/users');

//wrap contents in this
module.exports = (app) => {

  /*
   *  =========================================
   *  =========================================
   *  =========================================
   *
   *  USERS
   *
   *  =========================================
   *  =========================================
   *  =========================================
   */

  app.get("/users/login", users.goToLogin);
  app.post("/users/login", users.logInUser);

  app.get("/users/logout", users.logoutUser);

  app.get("/users/new", users.goToRegister);

  app.post("/users", users.saveNewUser);

  /*
   *  =========================================
   *  =========================================
   *  =========================================
   *
   *  pokemon
   *
   *  =========================================
   *  =========================================
   *  =========================================
   */


  app.get("/new", pokemon.goToPokemonCreation);

  app.get("/:id/edit", pokemon.editBasedOnId);

  app.get("/:id", pokemon.getPokemonStats);
  app.put("/:id", pokemon.savePokemonEdit);
  app.delete("/:id", pokemon.deletePokemon);

  app.get("/", pokemon.goToHome);
  app.post("/", pokemon.saveNewPokemon);

};