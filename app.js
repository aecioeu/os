


const config = require("./config.json");



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
const port = process.env.PORT || 80;

const socket = require("socket.io", {
  cors: {
    origin: '*',
  }
});


const compression = require('compression')
app.use(compression());
app.disable('x-powered-by');
//app.use(express.static(__dirname + '/public')); // configure express to use public folder
app.use(express.static(__dirname + '/public', {
    maxAge: 86400000,
    setHeaders: function(res, path) {
      res.setHeader('Cache-Control', 'no-cache')
       // res.setHeader("Expires", new Date(Date.now() + 2592000000 * 30).toUTCString());
      //  res.setHeader('Cache-Control', `public, max-age=${1 * 365 * 24 * 60 * 60 * 1000}`)
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
//app.use(morgan('combined'))

// middleware de tratamento de erro
//require('./config/https')(app); // pass passport for configuration
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/config/passport')(app, passport); // pass passport for configuration
// routes ======================================================================

var server = app.listen(port);
console.log('The magic happens on port ' + port);
global.io = socket(server);
require("./app/routes.js")(app, passport); 
//global.io = require('socket.io').listen(server);



/*
var clients = {}; 

setInterval( function() {

  var msg = Math.random();
  io.emit('message', msg);
  console.log (msg);

}, 1000);

io.on("connection", function (client) {  
  console.log('askdoksdo')
  client.on("join", function(name){
    console.log("Joined: " + name);
      clients[client.id] = name;
      client.emit("update", "You have connected to the server.");
      client.broadcast.emit("update", name + " has joined the server.")
  });

  client.on("send", function(msg){
    console.log("Message: " + msg);
      client.broadcast.emit("chat", clients[client.id], msg);
  });

  client.on("disconnect", function(){
    console.log("Disconnect");
      io.emit("update", clients[client.id] + " has left the server.");
      delete clients[client.id];
  });
});
*/

/*
var users = {}


io.on("connection", function (socket) {
  
  console.log('👾 New socket connected! >>', socket.id)
  //io.sockets.emit('getCountTasks', 'clients');


  socket.on('new-connection', (data) => {
    // captures event when new clients join
    console.log(`new-connection event received`, data)
    // adds user to list
    users[socket.id] = data.username
    console.log('users :>> ', users)
    // emit welcome message event
    socket.emit('welcome-message', {
      user: 'server',
      message: `Welcome to this Socket.io chat ${data.username}. There are ${
        Object.keys(users).length
      } users connected`,
    })
    
  })


  socket.on("disconnect", () => {
    //delete users[socket.id];
    io.emit("user disconnected", socket.id);
  });
});*/




