var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());

var products = {
    1:{title: 'The history of web 1'},
    2:{title: 'The next web'}
};
app.get('/products', function(req, res){
    var output = '';
    for(var i in products){
        output += `
        <li>
            <a href="/cart/${i}">${products[i].title}</a>
        </li>`
    }
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
});

app.get('/count', function(req, res){
    if(req.cookies.count){
        var count = parseInt(req.cookies.count);
    } else {
        var count = 0;
    }
    count = count+1;
    res.cookie('count', count);
    res.send('count: '+count);
});
app.listen(3003, function(){
    console.log('connected 3003 port!!!');
});