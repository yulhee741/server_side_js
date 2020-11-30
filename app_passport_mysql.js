var app =require('./config/mysql/express')();
var passport = require('./config/mysql/passport')(app);

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

var auth = require('./routes/mysql/auth')(passport);
app.use('/auth/', auth);

app.listen(3003, function(){
    console.log('connected 3003 port!!!');
});