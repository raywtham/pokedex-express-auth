const pokemon = require('./pokemon');
const users = require('./users');

module.exports = (app) => {
    app.get('/users', users.show);

    app.get('/new', pokemon.createForm);
    app.get('/:id/edit', pokemon.edit);
    app.get('/:id', pokemon.get);
    app.get('/', pokemon.show);
    app.post('/', pokemon.create);
    app.put('/:id', pokemon.update);
    app.delete('/:id', pokemon.delete);

    app.get('/users/new', users.newForm);
    app.post('/users', users.create);
    app.post('/users/logout', users.logout);
    app.get(`/users/login`, users.loginForm);
    app.post('/users/login', users.login);
}