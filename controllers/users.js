const jsonfile = require('jsonfile');
const bcrypt = require('bcrypt');
const USERFILE = 'users.json';
let userDB;

jsonfile.readFile(USERFILE, (err, obj) => {
  userDB = obj;
})

module.exports = {

  newForm: (request, response) => {
    response.render('new_user');
  },

  createUser: (request, response) => {
    let usernameInput = request.body.username;
    let passwordInput = request.body.password;
    let userObj = {};
    bcrypt.hash(passwordInput, 10, (err, hash) => {
      userObj["username"] = usernameInput;
      userObj["passwordHash"] = hash;
      userDB.users.push(userObj);
      jsonfile.writeFile(USERFILE, userDB, {spaces: 2}, (err) => {
        if (err) {
          console.log(err);
        }
      })
    })
    response.cookie('loggedIn', true);
    response.redirect('/');
  },

  loginForm: (request, response) => {
    response.render('login');
  },

  login: (request, response) => {
    let usernameInput = request.body.username;
    let passwordInput = request.body.password;
    let user = userDB.users.find((user) => {
      return user.username === usernameInput;
    });

    bcrypt.compare(passwordInput, user.passwordHash, function(err, auth) {
      if (auth === true) {
        response.cookie('loggedIn', true);
        response.redirect('/');
      } else {
        response.send("Invalid password");
      }
    })
  },

  logout: (request, response) => {
    response.clearCookie("loggedIn");
    response.redirect('/');
  }
}