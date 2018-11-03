if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
const express         = require('express');
const path            = require('path');
const logger          = require('morgan');
const bodyParser      = require('body-parser');
const mongoose        = require('mongoose');
const flash           = require('connect-flash');
const passport        = require('passport');
const methodOverride  = require('method-override');
const compression     = require('compression');
const helmet          = require('helmet');    
const seedDB          = require('./config/seed');

// Routes
const indexRoutes       = require('./routes/index');
const landscapesRoutes  = require('./routes/landscapes');
const commentRoutes     = require('./routes/comments');
const userRoutes        = require('./routes/users');

// Create the Express application object
const app = express();

app.use(helmet());
  
// Set up mongoose connection
const devDbUrl = 'mongodb://localhost:27017/my_land';
const mongoDB = process.env.MONGODB_URLI || devDbUrl;
mongoose.connect(mongoDB, { useCreateIndex: true, useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

// View engine setup
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(flash()); 
// The message don't persist on every single request, it's only one time, for this reason is called flash
// Note about flash
// Work before res.redirect()
//    req.flash('info', 'Flash is back!')
//    res.redirect('/');
// And res.render()
//    res.render('index', { messages: req.flash('info') });
//
seedDB();

// Moment JS for Date
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
require('./config/passport')(passport); // pass passport for configuration
app.use(require('express-session')({
   secret: 'Node.js is great!',
   resave: false,
   saveUninitialized: false
})); 
app.use(passport.initialize());
app.use(passport.session());

/** middleware */
/** app.use: whatever function we provide to it will be called on every route 
 *  we want to do is pass that request at user to every single template
*/
app.use((req, res, next) => {
   // currentUser is acessible in each template
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

app.use(compression()); // Compress all routes

app.use('/', indexRoutes);
app.use('/landscapes', landscapesRoutes);
app.use('/landscapes/:id/comments', commentRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Listening on ${PORT}`); });