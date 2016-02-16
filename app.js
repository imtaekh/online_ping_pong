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

var SETTINGS = {
  WIDTH : 600, HEIGHT : 400, BACKGROUND_COLOR : "#FFFFFF"
};

var lobbyManager = new (require('./gameObjects/LobbyManager.js'))(io);
var roomManager = new (require('./gameObjects/RoomManager.js'))(io,SETTINGS);

io.on('connection', function(socket){
  console.log('user connected: ', socket.id);
//  console.log('$  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $  $\n', socket);

  lobbyManager.push(socket);
  lobbyManager.dispatch(roomManager);

  io.to(socket.id).emit('connected', SETTINGS);

  socket.on('disconnect', function(){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex){
      roomManager.destroy(roomIndex, lobbyManager);
    }
    lobbyManager.kick(socket);
    lobbyManager.dispatch(roomManager);
    console.log('user disconnected: ', socket.id);
    //console.log(socket);
  });
  socket.on('keydown', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex)
      roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode] = true;
  });
  socket.on('keyup', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex)
      delete roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode];
  });
});
