var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var path    = require('path');

app.use(express.static(path.join(__dirname,"public")));

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log("server on!: http://localhost:3000/");
});

var objects = {};
var rooms = [];
var lobbyManager = new (require('./gameObjects/LobbyManager.js'))(io);
// console.log(lobby);

io.on('connection', function(socket){

  console.log('user connected: ', socket.id);
//  console.log('$  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $\n', socket);

  var found = findRoom(socket);
  if(!found){
    lobbyManager.dispatch();
  }

  objects[socket.id] = new Obj();
  io.to(socket.id).emit('connected', SETTINGS);

  socket.on('disconnect', function(){
    delete objects[socket.id];
    lobbyManager.kick(socket);
    console.log('user disconnected: ', socket.id);
    //console.log(socket);
  });
  socket.on('keydown', function(keyCode){
    objects[socket.id].keypress[keyCode]=true;
  });
  socket.on('keyup', function(keyCode){
    delete objects[socket.id].keypress[keyCode];
  });
});

var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var UNIT = 2;
var INTERVAL = 10;
var SETTINGS = {
  WIDTH : 600, HEIGHT : 400, BACKGROUND_COLOR : "#FFFFFF"
};

var update = setInterval(function(){
  var statuses = [];
  for(var id in io.sockets.clients().connected){
    var obj = objects[id];
    if(obj.keypress[LEFT] && obj.status.x - UNIT >= 0)
      obj.status.x -= UNIT;
    if(obj.keypress[UP] && obj.status.y - UNIT >= 0)
      obj.status.y -= UNIT;
    if(obj.keypress[RIGHT] && obj.status.x + obj.status.width + UNIT <= SETTINGS.WIDTH)
      obj.status.x += UNIT;
    if(obj.keypress[DOWN] && obj.status.y + obj.status.height + UNIT <= SETTINGS.HEIGHT)
      obj.status.y += UNIT;

    statuses.push(obj.status);
  }
  io.emit('update',statuses);
},INTERVAL);

function findRoom (socket){
  var entered = false;
  rooms.some(function(room, num){
    if(room.status == "waiting" && room.player.length<2){
      room.player[length] = socket.id;
      entered = true;
      return true;
    }
  });
  if(!entered){
    lobbyManager.push(socket);
    io.to(socket.id).emit('waiting');
  }
  return entered;
}

function Obj() {
  var color = "#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
  }
  this.status = {};
  this.status.x = 0;
  this.status.y = 0;
  this.status.height = 20;
  this.status.width = 20;
  this.status.color = color;
  this.keypress = [];
}

function Room(num) {
  this.num = num;
  this.status = "waiting";
  this.player = [];
}
