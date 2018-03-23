const pokemon = require('./controllers/pokemon');
const users = require('./controllers/users');



module.exports = (app) => {

  app.get('/users/new', users.create);
  app.post('/users', users.createUser);
  app.get('/users/logout', users.logout);
  app.get('/users/login', users.login);
  app.post('/users/login', users.checkLogin);

  app.get('/new', pokemon.create);
  app.get('/:id/edit', pokemon.edit);
  app.get('/:id', pokemon.getPokemon);
  app.get('/', pokemon.home);
  app.post('/', pokemon.postCreate);
  app.post('/', pokemon.putEdit);
  app.delete('/:id', pokemon.delete);

}
