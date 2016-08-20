'use strict';

/*
 * Express Dependencies
 */
var port = 3000;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var routes = {
    mailchimp: require('./routes/mailchimp.js')
};

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Cache-Control');
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// For gzip compression
app.use(express.compress());
app.use(bodyParser());

app.use(express.static(__dirname + '/client'));

/* ---------- Routes ------------ */
app.get('/', function (req, res) {res.sendfile('./client/index.html')});
app.post('/api/mailchimp/early-access', routes.mailchimp.earlyAccess);

/* Start it up */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);
