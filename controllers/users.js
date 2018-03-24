const jsonfile = require('jsonfile');

const bcrypt = require('bcrypt');

const userFILE = "userDex.json"

//wrap contents in this
module.exports = {
      //Qn 1 - 4
      goToRegister: (request, response) => {
            response.render("form");
      },

      saveNewUser: (request, response) => {
            //read the userDex file
            jsonfile.readFile(userFILE, (err, obj) => {
                  //console log any errors
                  if (err) console.error(err);


                  //decide what id to assign to this user
                  //obj refers to the users file (the file that we read)
                  let newUserId = obj.users.length + 1;

                  //request.body refers to the form that sent the request (filled with information the user keyed in)
                  //if username has been taken, re-render the same creation page with extra takenText
                  for (let i = 0; i < obj.users.length; i++) {
                        if (request.body.registerName == obj.users[i].username) {
                              let context = {
                                    takenText: "Username has already been taken! Please choose something else!"
                              };
                              response.render("form", context);
                        };
                  };

                  //hash the password
                  //has to be wrapped around the rest of the function, prolly due to js taking time for the hash to occur
                  bcrypt.hash(request.body.registerPassword, 1, (err, hash) => {

                        //add the id, username and password into the obj, place new obj into a variable
                        let newUser = {
                              "id": newUserId,
                              "username": request.body.registerName,
                              //passwords stored on server must be hashed
                              "password": hash
                        };

                        //push the newUser into currentObj, and save as new var
                        obj.users.push(newUser);

                        //write the obj into userDex.json
                        jsonfile.writeFile(userFILE, obj, err2 => {
                              let visits = 1;
                              // set cookie
                              response.cookie('visits', visits);
                              // redirect the client
                              response.redirect("/");
                        });
                  });
            });
      },

      //Qn 5
      logoutUser: (request, response) => {
            //remove cookie
            response.clearCookie("visits");
            //redirect user
            response.redirect("/");
      },

      //Qn 6
      goToLogin: (request, response) => {
            response.render("loginForm");
      },

      //Qn 7 + 8
      //side note: how to say if for all values of i, a match is not found (i.e, no usernames found). Cause if i use an else statement, it'll run the moment one username return is false.
      logInUser: (request, response) => {
            //read the userDex
            jsonfile.readFile(userFILE, (err, obj) => {
                  //for each user
                  for (let i = 0; i < obj.users.length; i++) {
                        //check if user matches the username field. if username in database matches the request.body username (submitted through form)
                        if (obj.users[i].username == request.body.username) {
                              //compare passwords using bcrypt.compare
                              bcrypt.compare(request.body.password, obj.users[i].password, (err, res) => {
                                    //if the results do not match
                                    if (res === false) {
                                          //re-render the page telling the user he/she has entered the wrong password
                                          let context = {
                                                wrongPassword: "You have entered the wrong password! Do you need help?"
                                          };

                                          response.render("loginForm", context);
                                          //else if the passwords match
                                    } else if (res === true) {
                                          // get the currently set cookie
                                          var visits = request.cookies['visits'];

                                          // see if there is a cookie
                                          if (visits === undefined) {
                                                // set a default value if it doesn't exist
                                                visits = 1;

                                          } else {
                                                // if a cookie exists, make a value thats 1 bigger
                                                visits = parseInt(visits) + 1;
                                          }
                                          // set the cookie
                                          response.cookie('visits', visits);

                                          //redirect to home page
                                          response.redirect("/");
                                    };
                              });
                        };
                  };
            });
      }
};