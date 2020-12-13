var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var sha256 = require('sha256');
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
        password:'!khc532412',
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

    var user = [{
      username: 'yulhee',
      password: '82f7f7f41f4177fef6e9a00f5baff24a602828e442fad353a827c798f4f82e18',
      salt: '!@#!@aaa',
      displayName:'Yulhee'
    },
    {
      username: 'yulhee2',
      password: '5f5fc966ac85eb0cf7e85a99e6d94a81eaeb6493916ca1c9f1ce28c7d633901f',
      salt: '!%#$@#bbb',
      displayName:'Yulhee2' 
    }];
    var uname = req.body.username;
    var pwd = req.body.password;
    if(uname === user.username && sha256(pwd+user.salt) === user.password){
        req.session.displayName = user.displayName;
        req.session.save(function(){
            res.redirect('/welcome');
        })    
    }else {
        res.send('Who are you? <a href="/auth/login">login</a>');
    }
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