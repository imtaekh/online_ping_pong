var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var path    = require('path');

app.use(express.static(path.join(__dirname,"public")));

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log("server on!");
});

keyPress=[];
objects={};

io.on('connection', function(socket){
  console.log('user connected: ', socket.id);

  objects[socket.id] = new UserObject();

  socket.on('disconnect', function(){
    delete objects[socket.id];
    io.emit('disconnect',socket.id);
    console.log('user disconnected: ', socket.id);
  });

  socket.on('keydown', function(keyCode){
    objects[socket.id].keypress[keyCode]=true;
  });
  socket.on('keyup', function(keyCode){
    delete objects[socket.id].keypress[keyCode];
  });
});

var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

var update = setInterval(function(){
  var idArray=[];
  var statusArray={};
  for(var id in io.sockets.clients().connected){
    if(objects[id].keypress[LEFT])  objects[id].status.x -= 2;
    if(objects[id].keypress[UP])    objects[id].status.y -= 2;
    if(objects[id].keypress[RIGHT]) objects[id].status.x += 2;
    if(objects[id].keypress[DOWN])  objects[id].status.y += 2;

    idArray.push(id);
    statusArray[id]=objects[id].status;
  }
  io.emit('update',idArray, statusArray);
},10);

function UserObject() {
  var color="#";
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
