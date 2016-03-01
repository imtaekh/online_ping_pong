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
    lobbyManager.push(socket);
    lobbyManager.dispatch(roomManager);
  });
  socket.on('disconnect', function(){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.destroy(roomIndex, lobbyManager);
    console.log('user disconnected: ', socket.id);
  });
  socket.on('keydown', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode] = true;
  });
  socket.on('keyup', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) delete roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode];
  });
});
