//---------------------------------------------------------------------
// Import useful node librairies into the file
//---------------------------------------------------------------------
const createError = require('http-errors');
const express = require('express');
const path = require('path'); //core Node library for parsing file and directory paths
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fileupload = require("express-fileupload");
const dbMongo = require('./database/db-connect')

//---------------------------------------------------------------------
// Routes directory
//---------------------------------------------------------------------
const indexRouter = require('./routes/index');
const resultRouter = require('./routes/result');
const processRouter = require('./routes/processRequest');

//---------------------------------------------------------------------
// Creating the app
//---------------------------------------------------------------------
const app = express();

app.use(fileupload());

// view engine setup (to specify the folder where the templates will be stored)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//---------------------------------------------------------------------
// Add the middleware libraries into the request handling chain
//---------------------------------------------------------------------
app.use(logger('dev'));
app.use(express.json());
//app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

//---------------------------------------------------------------------
// Route-handling code to the request handling chain
//---------------------------------------------------------------------
app.use('/', indexRouter);
app.use('/processRequest', processRouter);
app.use('/result', resultRouter);

//---------------------------------------------------------------------
// Handler methods for errors and HTTP 404 responses
//---------------------------------------------------------------------
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//---------------------------------------------------------------------
// Export the app object
//---------------------------------------------------------------------
module.exports = app;