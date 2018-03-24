const express = require('express');
const jsonfile = require('jsonfile');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require("cookie-parser");
const app = express();
const FILE = 'pokedex.json';

app.engine('handlebars', handlebars.create().engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.static('public'));

require('./routes')(app);

app.get('/', (request, response) => {
  let loggedIn;
  if ("loggedIn" in request.cookies) {
    loggedIn = true; 
  } else {
    loggedIn = false;
  };
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);
    response.render('home', { pokemon: obj.pokemon,
                              user: {"logged_in": loggedIn},
                            });
  });
});

app.post('/', (request, response) => {
  jsonfile.readFile(FILE, (err, obj) => {
    if (err) console.error(err);

    let newPokemon = request.body;
    obj.pokemon.push(newPokemon);

    jsonfile.writeFile(FILE, obj, err2 => {
      if (err2) console.error(err2);
      response.render('home', { pokemon: obj.pokemon });
    });
  });
});

app.listen(3000, () =>
  console.log('~~~ Tuning in to the waves of port 3000 ~~~')
);
