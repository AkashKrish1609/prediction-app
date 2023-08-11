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
app.use(bodyParser.json());
app.use(session({ 
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://sankar1609:sankar2002@cluster0.pit9omq.mongodb.net/myappDB");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

const matchesSchema = new mongoose.Schema({
    userId: String,
    matchId: Number,
    homeScore: Number,  
    awayScore: Number
})

const Match = new mongoose.model("Match", matchesSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/home", (req, res) => {
    


const options1 = axios.get('https://api.football-data.org/v4/competitions/PL/standings', {
    headers: {
        'X-Auth-Token': apiKey
    }
  })
const options2 = axios.get('https://api.football-data.org/v4/competitions/PL/matches', {
    headers: {
        'X-Auth-Token': apiKey
    }
  })

Promise.all([options1, options2])
.then((response) => {
    let {standings} = response[0].data;
    let {table} = standings[0];
    let {matches} = response[1].data;
    let currentMatchday =  matches[0].season.currentMatchday;


    let filteredArray = [];
    for (let i = 0; i<39; i++){
    let individualMatchday = matches.filter( (element) => {
        return element.matchday === i
    })
    filteredArray.push(individualMatchday)
    }

    function ScoreAlgorithm (actualScore, predictedScore) {
        let accuracyPercentage = Math.max(0, (1 - Math.abs(actualScore - predictedScore) / actualScore)) * 100;
        return accuracyPercentage
    }

    function totalScore(homeS, homeP, awayS, awayP){
        let homeAverage = ScoreAlgorithm(homeS, homeP);
        let awayAverage = ScoreAlgorithm(awayS, awayP);
        let result;
        return result = ((homeAverage + awayAverage)/2 ).toFixed(2)+ "%";
    }

    // res.send(response[1].data)
    if(req.isAuthenticated()){
        const userId = req.user.id;
        Match.find({userId: userId}, function(err, foundUser) {
            if(err){
                res.render('home', {
                    table: table, 
                    matches: matches, 
                    mainArray: filteredArray, 
                    currentMatchday: currentMatchday
                })
            }else if(foundUser){
                res.render('home', {
                    table: table, 
                    matches: matches, 
                    mainArray: filteredArray, 
                    currentMatchday: currentMatchday,
                    foundUser: foundUser,
                    totalScore: totalScore
                })
            }
           
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
    res.render("signIn")
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

app.post("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { console.log(err); }
        res.redirect('/');
      });
})



app.post("/home", (req, res) => {
const { matchId, homeTeamScore, awayTeamScore } = req.body;
const userId = req.user.id
// console.log(matchId, homeTeamScore, awayTeamScore, req.user.id);

const match = new Match({
    userId: userId,
    matchId: matchId,
    homeScore: homeTeamScore,
    awayScore: awayTeamScore
})

match.save()
// User.findById(req.user.id, (err, foundUser) => {
//     if (err) {
//       console.log(err);
//     return;
//     }else if(foundUser){

//     }
// })

})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server up and running on ${port}`);
})

