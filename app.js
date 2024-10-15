var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
require('dotenv').config()

const mongouri = process.env.MONGO_URI;
const mongo_username = process.env.MONGO_USERNAME || "";
const mongo_password = process.env.MONGO_PASSWORD || "";

if (mongouri == "") {
    console.log("MONGO_URI is empty");
    console.log("Check .env file");
    process.exit(1);
}

mongoose.connect(mongouri, {
    user: mongo_username,
    pass: mongo_password,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error when connecting to mongodb: " + err);
});


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
