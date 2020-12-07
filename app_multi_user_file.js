var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
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
app.get('/count', function(req,res){
    if(req.session.count){
        req.session.count++;
    }else {
        req.session.count = 1;
    }
    res.send('count: '+req.session.count);
});
app.get('/auth/logout', function(req, res){
    delete req.session.displayName;
    req.session.save(function(){
        res.redirect('/welcome');
    })
});
app.get('/welcome', function(req,res){
    if(req.session.displayName) {
        res.send(`
        <h1>Hello, ${req.session.displayName}</h1>
        <a href="/auth/logout">logout</a>
        `)
    }else {
        res.send(`
        <h1>Welcome</h1>
        <a href="/auth/login">Login</a>
        `)
    }
});
app.post('/auth/login', function(req,res){
    var uname = req.body.username;
    var pwd = req.body.password;
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if(uname === user.username) {
            return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
                if(hash === user.password){
                    req.session.displayName = user.displayName;
                    req.session.save(function(){
                        res.redirect('/welcome');
                    })
                } else {
                    res.send('Who are you?1 <a href="/auth/login">login</a>');
                }
            });
        }
    }
    // if(uname === user.username && hasher(pwd,user.salt) === user.password){
    //     req.session.displayName = user.displayName;
    //     req.session.save(function(){
    //         res.redirect('/welcome');
    //     })    
    // }else {
        // res.send('Who are you? <a href="/auth/login">login</a>');
    
});
var users = [{
    username: 'yulhee',
    password: 'O83Eq1cNqWAwgmjXt3JFYbjdPd7JJzlsdcHxEIvuZE8A3y4JtjT0tQC4nPeKO3GyCvEty+QR+B3BOmn+YuP/OJQujayExwMyjQWuRA7hYc9njwQSzfZEW7Q+0simCw+156AK1Ysw7C3ASxc8981Fi5Rr2CQUAJoZ3ZZ62T6tLxE=',
    salt: 'lS49d56KFVPB5MJZtg3qSqE8uj9DJMaDiHxhBcm1OWTGJC5kPJoHgPJjozBXfNkvlSAIF3bWJmDjlV3yvcrVyw==',
    displayName:'Yulhee'
  }];
app.post('/auth/register',function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
            username:req.body.username,
            password:hash,
            salt:salt,
            displayName:req.body.displayName
        };
        users.push(user);
        req.session.displayName = req.body.displayName;
        req.session.save(function(){
            res.redirect('/welcome');
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
    `;
    res.send(output);
});

app.listen(3003, function(){
    console.log('connected 3003 port!!!');
});