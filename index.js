const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile');
const cookieParser = require('cookie-parser');

const methodOverride = require('method-override');


// Why does express-validator throw errors with the lodash dependency?! D:
// const {check, validationResult} = require('express-validator/check');
// const {matchedData, sanitize} = require('express-validator/filter');


// Hackish way to create a https server in addition to the standard http one, and use the http library to redirect requests to the https one. Courtesy of https://blog.cloudboost.io/everything-about-creating-an-https-server-using-node-js-2fc5c48a8d4e. This method should not be used in production as it adds delays to requests. An nginx/apache server is still needed to run alongside the node.js one to handle the traffic.
// const fs = require('fs');
// const key = fs.readFileSync('encryption/private.key');
// const cert = fs.readFileSync('encryption/localhost.crt');
// const ca = fs.readFileSync('encryption/intermediate.crt');
// const options = {
//     key: key,
//     cert: cert,
//     ca: ca
// };
// const https = require('https');
// const http = require('http');
// const forceSSL = require('express-force-ssl');

// const mongojs = require('mongojs');
// const db = mongojs('userAuthLesson', ['users']);
// const ObjectId = mongojs.ObjectId;

// Setup the Handlebars templating engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// For forcing connections over https
// app.use(forceSSL);

// Setting up Mongoose, connect it to the database, and set up the schema for users and construct its model
const mongoose = require('mongoose');
const mongodb = 'mongodb://127.0.0.1/test';
mongoose.connect(mongodb);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

const Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'A name is required!']
    },
    email: {
        type: String,
        required: [true, 'Please provide an e-mail address!']
    },
    password: {
        type: String,
        required: [true, "Can't do without a password!"]
    }
})

let userModel = mongoose.model('users', userSchema);


/**
 * Middleware setup
 */
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(methodOverride('_method'));

// app.use(expressValidator());

/**
 * To write an init function to populate the database if it hasn't already been initiated.
 * These functions are here to abstract away the db library. I'm currently switching between mongojs and mongoose, and while the former looks easier to use now, the latter seems more suited for more complicated operations.
 */

function dbInit() {
    userModel.find({}, 'name', function(error, users){
        if (error) {
            throw new Error(error);
        } else {
            if (users.length === 0) {
                // initialise stuff here
            }
        }
    })
}

function dbUserInputValidate(user) {
    // validate the user object
    // it should have the username, email, password fields
    // it should also NOT already exist in the database
    if (user == null || user.name == null || user.email == null || user.password == null) {
        return false;
    } else {
        return true;
    }
}

function dbFindUserByName(name, callBackFunc) {
    userModel.findOne({"name": name}, 'name email password', callBackFunc(error, user));
}

function dbFindUserByEmail(email, callBackFunc) {
    userModel.findOne({"email": email}, 'name email password', callBackFunc(error, user))
}


function dbSaveUser(user) {
    // if it does exist, an update should be triggered instead of a new user saved
    if (dbUserInputValidate(user)) {
        let newUser = new userModel({
            name: user.name,
            email: user.email,
            password: user.password
        })
        
        // Save the user
        newUser.save((err) => {
            if (err) {
                throw new Error(err);
            } else {
                console.log(`${user.name} saved in database`)
            }
        });

        return true;
    } else {
        return false;
    }
}

function dbUpdateUser(newUserData) {
    // attempt to update the info of a SINGLE record to avoid accidentally changing all records
    userModel.findOne({"name": name}, 'name email password', function(error, user){
        if (error) {
            throw new Error(error);
        } else {
            user.name = newUserData.name;
            user.email = newUserData.email;
            user.password = newUserData.password;
            user.save();
            return true;
        }
    });
}

/**
 * Routes
 */
app.post('/users/login', async function (request, response) {
    // userInput will have a username and password field
    let userInput = request.body;
    let hash = '';
    let user = {};
    userModel.findOne({"name": userInput.name}, 'name email password', function(error, savedUser){
        if (savedUser !== null) {
            user = savedUser;
            hash = user.password;
            bcrypt.compare(userInput.password, hash, function(error, result){
                if (result) {
                    bcrypt.hash(user.name, saltRounds, function(error, hash) {
                        response.cookie('status1', hash, {maxAge: 86400000});
                        response.cookie('status2', user.email, {maxAge: 86400000});
                        response.redirect('/');
                    })
                } else {
                    response.send('Wrong password!');
                }
            })
        } else {
            response.send('User does not exist!');
        }
    });
})

app.post('/users', function (request, response) {
    // userInput should have 3 keys: name, email, password
    let userInput = request.body;

    // attempt to retrieve the user from the database. only proceed if the user doesn't already exist.
    userModel.findOne({"name": userInput.name}, 'name email password', function(error, user){
        if (user !== null) {
            response.send('User already exists!');
            return;
        } else {
            // user is the object that we are going to store in the database
            let user = {};
            bcrypt.hash(userInput.name, saltRounds)
                .then(function(hashedName){
                    bcrypt.hash(userInput.password, saltRounds)
                        .then(function (hashedPassword) {
                            user.name = userInput.name;
                            user.email = userInput.email;
                            user.password = hashedPassword;
                            dbSaveUser(user);
                            response.cookie('status1', hashedName, {maxAge: 86400000});
                            response.cookie('status2', userInput.email, {maxAge: 86400000});
                            response.redirect('/');
                        });
                })
        }
    });
})

app.get('/users/new', (request, response) => {
    let context = {};
    response.render('register', context);
});

app.get('/users/login', (request, response) => {
    response.render('login')
})

app.get('/users/logout', (request, response) => {
    response.clearCookie('status1');
    response.clearCookie('status2');
    response.redirect('/');
})

app.get('/', function (request, response) {
    let context = {'loginStatus': false};
    // By default, the user is assumed not to be logged in. But if the cookies status1 and status2 exist, we check. Status2 is used to retrieve the user's name, if possible, which is then hashed and compared to status1. If there's a match, yeah he's verified and we'll let him in.
    if (request.cookies['status1']  && request.cookies['status2']) {
        let email = request.cookies['status2'], nameHash = request.cookies['status1'];
        userModel.findOne({"email": email}, 'name email password', function(error, user){
            if (user.name !== undefined) {
                bcrypt.compare(user.name, nameHash, function(error, result){
                    if (result) {
                        context.loginStatus = true;
                        context.name = user.name;
                    } else {
                        context.loginStatus = false;
                    }
                    response.render('home', context);
                })
            }
        })
    } else {
        response.render('home', context);
    }
});

app.listen(3000, () => {
    console.log('Set sail for fail!')
})

// https.createServer(options, app).listen(443);
// http.createServer(app).listen(80);
