const jsonfile = require('jsonfile');
const bcrypt = require('bcrypt');

module.exports = {
    show: (request, response) => {
        jsonfile.readFile('users.json', (err, obj) => {
            let users = [];
            if (obj) {
                let keys = Object.keys(obj);
                for (let i in keys) {
                    users.push(keys[i]);
                }
            }
            console.log(users);
            let context = {
                users: users
            };

            response.render('users', context);
        });
    },
    newForm: (request, response) => {
        // send response with some data
        response.render('new_user');
    },
    create: (request, response) => {
        let username = request.body.username;
        let password = request.body.password;
        // console.log(request.body.username);
        bcrypt.hash(password, 1, (err, hash) => {

            jsonfile.readFile('users.json', (err, obj) => {
                if (obj) {
                    obj[username] = hash;
                }
                else {
                    obj = {};
                    obj[username] = hash;
                }
                // console.log("obj: ", obj);
                jsonfile.writeFile('users.json', obj, (err) => {
                    if (err) console.log(err);
                    response.cookie('login', true);
                    response.redirect("/");
                });
            });
        });
    },
    logout: (request, response) => {
        // response.cookie('login');
        response.clearCookie('login');
        response.redirect("/");
    },
    login: (request, response) => {
        let textPassword = request.body.password;
        let username = request.body.username;
        jsonfile.readFile('users.json', (err, obj) => {
            let hashPassword = obj[username];
            bcrypt.compare(textPassword, hashPassword, (err, res) => {
                if (res) {
                    console.log('here');
                    response.cookie('login', true);
                    response.redirect("/");
                }
                else {
                    console.log('there');

                    response.clearCookie('login');
                    response.redirect("/users/login");
                }
            })

        });
    },
    loginForm: (request, response) => {
        response.render('login');
    }
}