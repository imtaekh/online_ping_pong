var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

function UserObject() {
  var color="#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
  }
  this.status = {};
  this.status.x = 0;
  this.status.y = 0;
  this.status.color = color;
  this.keypress = [];
}

app.use(express.static(path.join(__dirname,"public")));

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

  socket.on('keyStatusUpdate', function(keypress){
    objects[socket.id].keypress=keypress;
  });
});

var LEFT=37;
var UP=38;
var RIGHT=39;
var DOWN=40;

var intervarl = setInterval(function(){
  var idArray=[];
  var statusArray={};
  for(var id in io.sockets.clients().connected){
    if(objects[id].keypress[LEFT])
      objects[id].status.x-= 2;
    if(objects[id].keypress[UP])
      objects[id].status.y-= 2;
    if(objects[id].keypress[RIGHT])
      objects[id].status.x+= 2;
    if(objects[id].keypress[DOWN])
      objects[id].status.y+= 2;

    idArray.push(id);
    statusArray[id]=objects[id].status;
  }
  var update = {
    idArray:idArray,
    statusArray:statusArray
  };
  io.emit('update',idArray, statusArray);
},10);
http.listen('3000', function(){
  console.log("server on!");
});
