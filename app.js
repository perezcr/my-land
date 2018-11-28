const express = require('express');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const favicon = require('serve-favicon');
const compression = require('compression');
const helmet = require('helmet');    
const routes = require('./routes');
const errorHandlers = require('./handlers/errorHandlers');
require('./handlers/passport');

// Create our Express app
const app = express();

// Helmet helps you secure your Express apps by setting various HTTP headers.
app.use(helmet());
  
// View engine setup
app.set('views', path.join(__dirname, 'views')) // this is the folder where we keep our ejs files
app.set('view engine', 'ejs'); // we use the engine EJS

// app.use() : Whatever function we provide to it will be called on every route 
// Serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));

// A favicon is a visual cue that client software, like browsers, use to identify a site.
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.urlencoded({ extended: true }));

// HTTP request logger middleware for node.js
app.use(logger('dev'));

// Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
app.use(methodOverride('_method'));

// The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
// The message don't persist on every single request, it's only one time, for this reason is called flash
// Note about flash
// res.redirect()
//    req.flash('info', 'Flash is back!')
//    res.redirect('/');
// res.render()
//    res.render('index', { messages: req.flash('info') });
app.use(flash()); 

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
})); 

// Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// Pass variables to our templates + all requests
// We want to do is pass that request at user to every single template
const { getNotificacionsNotRead } = require('./controllers/notificationController');
app.use(async function(req, res, next){
  // res.locals.x is acessible in each template
  res.locals.currentUser = req.user || undefined;
  res.locals.moment = require('moment'); // Moment JS for Date
  res.locals.notifications = await getNotificacionsNotRead(req.user);
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Compress all routes
app.use(compression()); 

// Handle routes
app.use('/', routes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// One of our error handlers will see if these errors are mongoose-local errors
app.use(errorHandlers.mongooseLocalErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  // Development Error Handler - Prints stack trace
  app.use(errorHandlers.developmentErrors)
}

// Production error handler
app.use(errorHandlers.productionErrors)

// Done! we export it so we can start the site in start.js
module.exports = app;