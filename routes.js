const pokemon = require('./controllers/pokemon')
const users = require('./controllers/users')

module.exports = (app) => {
  app.get('/new', pokemon.newForm),
  app.get('/:id/edit', pokemon.editForm),
  app.get('/:id', pokemon.get),
  app.put('/:id', pokemon.edit),
  app.delete('/:id', pokemon.delete),

  app.get('/users/new', users.newForm),
  app.post('/users', users.createUser),
  app.get('/users/login', users.loginForm),
  app.post('/users/login', users.login),
  app.get('/users/logout', users.logout)
}