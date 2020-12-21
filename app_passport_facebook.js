var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();


var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: '1234DSFs@adf1234!@#$asd',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host:'localhost',
        port:3306,
        user:'root',
        password:'',
        database:'o2'
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/count', function(req,res){
    if(req.session.count){
        req.session.count++;
    }else {
        req.session.count = 1;
    }
    res.send('count: '+req.session.count);
});
app.get('/auth/logout', function(req, res){
    req.logout();
    req.session.save(function(){
        res.redirect('/welcome');
    })
});
app.get('/welcome', function(req,res){
    if(req.user && req.user.displayName) {
        res.send(`
        <h1>Hello, ${req.user.displayName}</h1>
        <a href="/auth/logout">logout</a>
        `)
    }else {
        res.send(`
        <h1>Welcome</h1>
        <p>
        <a href="/auth/login">Login</a>
        </p>
        <p>
        <a href="/auth/register">Register</a>
        </p>
        `)
    }
});
passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user.authId);
});
passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if(user.authId === id){
            done(null, user);
        }
    }
});
passport.use(new LocalStrategy(
    function(username, password, done){
        var uname = username;
        var pwd = password;
        for(var i=0; i<users.length; i++){
            var user = users[i];
            if(uname === user.username) {
                return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
                    if(hash === user.password){
                        console.log('LocalStrategy', user);
                        done(null, user);
                    } else {
                        done(null,false);
                    }
                });
            }
        }
        done(null, false);
    }
));
passport.use(new FacebookStrategy({
    clientID: '',
    clientSecret: '',
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId = 'facebook:' + profile.id;
    for (var i=0; i<users.length; i++){
        var user = users[i];
        if(user.authId === authId){
            return done(null,user);
        }
    }
    var newuser = {
        'authId':authId,
        'displayName':profile.displayName,
    };
    users.push(newuser);
    done(null, newuser);
  }
));
app.post(
    '/auth/login', 
    passport.authenticate(
        'local', 
        { 
            successRedirect: '/welcome',
            failureRedirect: '/auth/login',
            failureFlash: false 
        }
    )
);
app.get(
    '/auth/facebook',
     passport.authenticate(
         'facebook'
        )
    );
app.get(
    '/auth/facebook/callback',
  passport.authenticate(
      'facebook', 
      { 
        successRedirect: '/welcome',
        failureRedirect: '/auth/login' 
    })
);
var users = [{
    authId: 'local:yulhee',
    username: 'yulhee',
    password: 'O83Eq1cNqWAwgmjXt3JFYbjdPd7JJzlsdcHxEIvuZE8A3y4JtjT0tQC4nPeKO3GyCvEty+QR+B3BOmn+YuP/OJQujayExwMyjQWuRA7hYc9njwQSzfZEW7Q+0simCw+156AK1Ysw7C3ASxc8981Fi5Rr2CQUAJoZ3ZZ62T6tLxE=',
    salt: 'lS49d56KFVPB5MJZtg3qSqE8uj9DJMaDiHxhBcm1OWTGJC5kPJoHgPJjozBXfNkvlSAIF3bWJmDjlV3yvcrVyw==',
    displayName:'Yulhee'
  }];
app.post('/auth/register',function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
            authId:'local:'+req.body.username,
            username:req.body.username,
            password:hash,
            salt:salt,
            displayName:req.body.displayName
        };
        users.push(user);
        req.login(user, function(err){
            req.session.save(function(){
                res.redirect('/welcome');
        });  
    });
    });
});
app.get('/auth/register', function(req,res){
    var output = `
    <h1>Login</h1>
    <form action="/auth/register" method="post">
    <p>
    <input type="text" name="username" placeholder="username">
    </p>
    <p>
    <input type="password" name="password" placeholder="password">
    </p>
    <p>
    <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
    <input type="submit">
    </p>
    </form>
    `;
    res.send(output);
});
app.get('/auth/login', function(req,res){
    var output = `
    <h1>Login</h1>
    <form action="/auth/login" method="post">
    <p>
    <input type="text" name="username" placeholder="username">
    </p>
    <p>
    <input type="password" name="password" placeholder="password">
    </p>
    <p>
    <input type="submit">
    </p>
    </form>
    <a href="/auth/facebook">facebook</a>
    `;
    res.send(output);
});

app.listen(3003, function(){
    console.log('connected 3003 port!!!');
});