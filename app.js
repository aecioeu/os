// app.js
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var morgan = require('morgan')

const passport = require('passport');
const flash = require('connect-flash');


var FileStore = require('session-file-store')(session);
var fileStoreOptions = {};

const app = express();
const port = process.env.PORT || 3000;

const compression = require('compression')

app.use(compression());
app.disable('x-powered-by');
//app.use(express.static(__dirname + '/public')); // configure express to use public folder
app.use(express.static(__dirname + '/public', {
    maxAge: 86400000,
    setHeaders: function(res, path) {
        res.setHeader("Expires", new Date(Date.now() + 2592000000 * 30).toUTCString());
        res.setHeader('Cache-Control', `public, max-age=${1 * 365 * 24 * 60 * 60 * 1000}`)
    }
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// required for passport

app.use(cookieParser('secretString'));
app.use(session({
    secret: 'vidyapathaisalwaysrunning',
    saveUninitialized: true,
    cookie: { domain: 'localhost' },
    resave: true,
    store: new FileStore(fileStoreOptions),
    cookie: {
        maxAge: 1 * 365 * 24 * 60 * 60 * 1000,
        secure: false,
    }
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(morgan('combined'))

// middleware de tratamento de erro
//require('./config/https')(app); // pass passport for configuration
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/config/passport')(app, passport); // pass passport for configuration
// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport





var server = app.listen(port);
console.log('The magic happens on port ' + port);

