const express = require('express');
const handlebars = require('express-handlebars');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const FILE = 'users.json';

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

// Set handlebars to be the default view engine
app.engine('handlebars', handlebars.create().engine);
app.set('view engine', 'handlebars');

// Set static folder
app.use(express.static('public'));

// Set up body-parser to automatically parse form data into object
app.use(bodyParser.urlencoded({ extended: true }));

// Set up method-override for PUT and DELETE forms
app.use(methodOverride('_method'));

app.use(cookieParser());
/**
 * ===================================
 * Routes
 * ===================================
 */

app.get('/users/new',(req,resp)=>{
	resp.render('register');
});

app.post('/users',(req,resp)=>{
	let pwInput=req.body.password;
	let emailInput=req.body.email;
	bcrypt.hash(pwInput,1,(err,hash)=>{
		let userAdd={
					email:emailInput,
					dbPw:hash
					}
		jsonfile.readFile(FILE,(err,obj)=>{
			obj.users.push(userAdd);
			jsonfile.writeFile(FILE,obj,(err)=>{
				console.log("writeFile error", err);
			});
		});
	})
	resp.cookie('loggedIn','true');
	resp.redirect("/");
});

app.get('/users/logout',(req,resp)=>{
	resp.clearCookie('loggedIn');
	resp.send('cleared');
});

app.get('/users/login',(req,resp)=>{
	resp.render('login');
});

app.post('/users/login',(req,resp)=>{
	let pwInput=req.body.password;
	let emailInput=req.body.email;
	let dbPw = null;
	jsonfile.readFile(FILE,(err,obj)=>{
		for(i=0;i<obj.users.length;i++){
			if(emailInput==obj.users[i].email){
				dbPw=obj.users[i].dbPw;
			}
		}
		bcrypt.compare(pwInput,dbPw,(err,res)=>{
			if(res==true){
				resp.cookie('loggedIn','true');
				resp.redirect('/');
			}else{
				resp.send('Incorrect PW!')
			}
		});
	});
});

app.get('/',(req,resp)=>{
	let loggedInStatus=null;
	if(req.cookies.loggedIn=="true"){
		loggedInStatus=true;
	}

	let context={
		loggedIn:loggedInStatus
	};
	resp.render('home',context);
})

app.listen(3000,()=>{console.log("server running")});