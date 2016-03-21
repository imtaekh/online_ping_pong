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

var SETTINGS = require("./pongOnline/SETTINGS.js");

var lobbyManager = new (require('./pongOnline/LobbyManager.js'))(io);
var roomManager = new (require('./pongOnline/RoomManager.js'))(io);
var gameManager = new (require('./pongOnline/GameManager.js'))(io, roomManager);

io.on('connection', function(socket){
  io.to(socket.id).emit('connected', SETTINGS.CLIENT_SETTINGS);
  console.log('user connected: ', socket.id);

  socket.on('waiting', function(){
    //console.log('waiting from '+socket.id);
    lobbyManager.push(socket);
    lobbyManager.dispatch(roomManager);
  });
  socket.on('disconnect', function(){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.destroy(roomIndex);
    lobbyManager.kick(socket);
    console.log('user disconnected: ', socket.id);
  });
  socket.on('keydown', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode] = true;
  });
  socket.on('ready', function(){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.rooms[roomIndex].objects[socket.id].ready = true;
  });
  socket.on('keyup', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) delete roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode];
  });
  socket.on('mousemove', function(x,y){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.rooms[roomIndex].objects[socket.id].mouse.move={x:x,y:y};
  });
  socket.on('click', function(x,y){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.rooms[roomIndex].objects[socket.id].mouse.click={x:x,y:y};
  });
});
