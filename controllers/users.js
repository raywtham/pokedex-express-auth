const jsonfile = require('jsonfile')
const bcrypt = require('bcrypt');

module.exports = {
  create: (req, res) => {
    res.render('signup');
  },

  createUser: (req, res) => {
    console.log(req.body);

    jsonfile.readFile("users.json", (err, obj) => {
      if (err) console.error(err);

      bcrypt.hash(req.body.password, 1, (err, hash) => {
        obj[req.body.name] = hash;

        jsonfile.writeFile("users.json", obj, {spaces: 2}, (err2) => {
          console.log(err2);
        });
        res.cookie("loggedin", true);
        res.redirect("/");
      });
    });
  },

  logout: (req, res) => {
    res.clearCookie("loggedin");
    res.redirect("/");
  },

  login: (req, res) => {
    res.render('login');
  },

  checkLogin: (req, res) => {
    let name = req.body.name;
    let password = req.body.password;
    jsonfile.readFile("users.json", (err, obj) => {
      let hashDb = obj[name];
        bcrypt.compare(password, hashDb, (err, results) => {
          console.log(results);
          if (results) {
            res.cookie("loggedin", true);
            res.redirect("/");
          } else {
            res.render("login");
          }
        });
    });

  }
}
