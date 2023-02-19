const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const axios = require('axios');
const apiKey = "6a6e598f8e2846b6a04a69b1c775d471";

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(session({ 
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/myappDB");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/home", (req, res) => {
    

const options1 = axios.get('https://api.football-data.org/v4/competitions/2021/standings', {
    headers: {
        'X-Auth-Token': apiKey
    }
  })
const options2 = axios.get('https://api.football-data.org/v4/competitions/2021/matches', {
    headers: {
        'X-Auth-Token': apiKey
    }
  })

Promise.all([options1, options2])
.then((response) => {
    let {standings} = response[0].data;
    let {table} = standings[0];
    let {matches} = response[1].data;
    let currentMatchday = matches[0].season.currentMatchday;

    let filteredArray = [];
    for (let i = 0; i<39; i++){
    let individualMatchday = matches.filter( (element) => {
        return element.matchday === i
    })
    filteredArray.push(individualMatchday)
    }

    //state management

    let state = {
        currentMatchday: currentMatchday
    }

    function anotherFunc(){
        return state.currentMatchday
    }

    function setState(){
        state.currentMatchday -= 1 
        anotherFunc()
    }

    // res.send(response[1].data)
    if(req.isAuthenticated()){
        res.render('home', {
            table: table, 
            matches: matches, 
            mainArray: filteredArray, 
            currentMatchday: anotherFunc,
            state: state.currentMatchday,
            setState: setState
        })
    }else{
        res.redirect("/signin")
    }

}) 


})

app.get("/", (req, res) => {
    res.render("signup")
})
app.get("/register", (req, res) => {
    res.render("register")
})
app.get("/signin", (req, res) => {
    res.render("signin")
})

app.post("/register", (req, res) => {
    const password = req.body.password;

    User.register({username: req.body.username}, password, (err, user) => {
        if(err){
            console.log(err);
            res.redirect("/register")
        }else{
            passport.authenticate("local")(req, res, () => {
                res.redirect("/home")
            })
           } 
    })
})

app.post("/signin", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function(err) {
        if (err) {
            console.log(err); 
        }else{
            passport.authenticate("local")(req, res, () => {
                res.redirect("/home")
            })
        }
      });
    
})

app.post("/home", (req, res) => {
    req.logout(function(err) {
        if (err) { console.log(err); }
        res.redirect('/');
      });
})
 

app.listen(3000, () => {
    console.log("Server up and running");
})

