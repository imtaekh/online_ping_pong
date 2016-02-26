var Player = require("./PlayerObject.js");
var Ball = require("./BallObject.js");

var INTERVAL = 10;

function RoomManager(io){
  var RmMg = this;
  RmMg.rooms = {};
  RmMg.roomIndex = {};

  RmMg.create = function(socket0,socket1){
    var roomId = socket0.id+socket1.id;
    var room = new Room(roomId,socket0,socket1);
    socket0.join(roomId);
    socket1.join(roomId);
    io.to(roomId).emit("in");
    RmMg.rooms[roomId] = room;
    RmMg.roomIndex[socket0.id] = roomId;
    RmMg.roomIndex[socket1.id] = roomId;
    console.log("Room Created :", roomId);
  };
  RmMg.destroy = function(roomId, LbMg){
    var room = RmMg.rooms[roomId];
    room.players.forEach(function(socket){
      LbMg.push(socket);
      delete RmMg.roomIndex[socket.id];
    });
    delete RmMg.rooms[roomId];
  };
  RmMg.update = setInterval(function(){
    for(var roomId in RmMg.rooms){
      var room = RmMg.rooms[roomId];
      var statuses = [];
      for(var object in room.objects){
        var obj = room.objects[object];
        obj.update();
        statuses.push(obj.status);
      }
      io.to(room.id).emit('update',statuses);
    }
  },INTERVAL);
}

module.exports = RoomManager;

function Room(id, socket0, socket1) {
  this.id = id;
  this.status = "waiting";
  this.players = [socket0,socket1];
  this.objects = {};
  this.objects[socket0.id] = new Player(socket0.id, "LEFT");
  this.objects[socket1.id] = new Player(socket1.id, "RIGHT");
  this.objects.ball = new Ball();
}
