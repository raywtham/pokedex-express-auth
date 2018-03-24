const express = require('express');
const handlebars = require('express-handlebars');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const FILE = 'pokedex.json';
const USERSFILE = 'users.json';
const cookieParser = require('cookie-parser');


/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

app.use(cookieParser());
// Set handlebars to be the default view engine
app.engine('handlebars', handlebars.create().engine);
app.set('view engine', 'handlebars');

// Set static folder
app.use(express.static('public'));

// Set up body-parser to automatically parse form data into object
app.use(bodyParser.urlencoded({ extended: true }));

// Set up method-override for PUT and DELETE forms
app.use(methodOverride('_method'));

/**
 * ===================================
 * Routes
 * ===================================
 */
app.get('/new', (request, response) => {
  // send response with some data
  response.render('new');
});

app.get('/users/new', (request, response) => {

  response.render("signup");
})

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

    var visits = request.cookies['logged_in'];
    var notlogin = !visits;

    console.log(notlogin);
    var context ={
    	pokemon: obj.pokemon,
    	login: visits,
    	notlogin: notlogin
    };

    response.render('home', context);
  });
});

app.post("/users/login", (request, response)=>{

	let loginPassword = request.body.password;

	let loginEmail = request.body.email;

	bcrypt.hash(loginPassword, 1, (err, hash) => {
		console.log(hash);

		jsonfile.readFile(USERSFILE, (err, obj) => {
			if (err) console.error(err);

			for (var i=0; i<obj.users.length; i++){

				if(obj.users[i].email === loginEmail){
					console.log(obj.users[i].email);
					console.log(loginEmail);
					let oldInput = obj.users[i].password;
					console.log(oldInput);

					bcrypt.compare(loginPassword, oldInput, function(err, res) {
						if( res === true ){
							console.log("same");
							response.cookie("logged_in", "true");
							response.redirect("/");
						}  
						else {
							console.log("not same");
							response.send("Password is not correct");
						}
					})

				}
//Question to check: Why I can't include a statement to indicate wrong email?//
//My whole post route sometimes gives incorrect answer when I include it. Othertimes,
//it post an error message "Cannot set headers after they are sent to the client"
///////////////////////////////////////////////////////////////////////////////

				// else {
				// 	response.send("Wrong email");
				// 	return console.log("wrong email");

				// 	// response.send("Wrong Email");	// response.send("Done");
				}
		})
	})
})


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

app.get("/users/login", (request, response) => {

  response.render("login")
})

//New account creation

app.post("/users", (request, response) =>{
  var plainText = request.body.password;

  var user = request.body;
    //hash = hashed password (using salt)
    console.log(request.body.password);

    bcrypt.hash(plainText, 1, (err, hash) => {

      let user = {
                  name: request.body.name,
                  email: request.body.email,
                  password: hash
                  
              };

      jsonfile.readFile(USERSFILE, (err, obj) => {

        // console.log(obj);
        obj.users.push(user);
        console.log("obj", obj);

        jsonfile.writeFile(USERSFILE, obj, err2 => {
          if (err2) console.error(err2);

          response.cookie("login", 'true');
          response.redirect("/")

        })
      })
    })
  })

app.get('/users/logout', (request, response) =>{
  // request.cookie("login", 'false');
  response.clearCookie("login");
  response.redirect("/");
})


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

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
app.listen(3000, () =>
  console.log('~~~ Tuning in to the waves of port 3000 ~~~')
);
