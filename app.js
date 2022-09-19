


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

const socket = require("socket.io");

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
//app.use(morgan('combined'))

// middleware de tratamento de erro
//require('./config/https')(app); // pass passport for configuration
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/config/passport')(app, passport); // pass passport for configuration
// routes ======================================================================

require("./app/routes.js")(app, passport); 



var server = app.listen(port);
console.log('The magic happens on port ' + port);

const io = socket(server);

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


var activeUsers = new Set()


io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });
});

setInterval(() => {
  console.log(activeUsers)
  
}, 1000);
 

/*
connectToWhatsApp();
//start("");
async function start(client) {
  app.listen(config.port, async function () {

    
   
   var fs = require('fs');

if (!fs.existsSync('./sessions')){
    fs.mkdirSync('./sessions', { recursive: true });
}
    //await init(); // inicia o treino da IA
    console.log("Servidor Iniciado e escutando na porta " + config.port);
  });

  require("./app/routes.js")(app, passport); // load our routes and pass in our app and fully configured passport
  // end start
}

async function connectToWhatsApp() {
  const client = makeWAclientet({
    //logger: P({ level: 'debug' }),
    auth: state,
    printQRInTerminal: true,
    version: [2, 2204, 13], 
  });

  await start(client);
  

  client.ev.on("connection.update", (update) => {
    const { connection } = update;
    if (connection === "close") {
      console.log("closed connection ");
     
      process.exit( );


    } else if (connection === "open") {
      console.log("opened connection");
    }
  });

  //const botNumber = client.user.id.includes(':') ? client.user.id.split(':')[0] + '@s.whatsapp.net' : client.user.id

  client.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (
      !msg.key.fromMe &&
      m.type === "notify" &&
      m.messages[0].key.remoteJid !== "status@broadcast"
    ) {
      console.log("Enviando mensagem para: ", m.messages[0].key.remoteJid);
      await processMessage(msg, client);
    }
  });



  //client.ev.on("presence.update", (m) => console.log(m));
  //client.ev.on("chats.update", (m) => console.log(m));
  //client.ev.on("contacts.update", (m) => console.log(m));

  client.ev.on("creds.update", saveState);
}

*/


