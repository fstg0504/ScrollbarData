

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();


app.set('port', (process.env.PORT ||8080));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.location('/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
