var Player = require("./PlayerObject.js");
var Ball = require("./BallObject.js");
var Score = require("./ScoreObject.js");

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
      io.to(socket.id).emit('destroy');
    });
    delete RmMg.rooms[roomId];
  };
}

module.exports = RoomManager;

function Room(id, socket0, socket1) {
  this.id = id;
  this.status = "waiting";
  this.players = [socket0,socket1];
  this.objects = {};
  this.objects[socket0.id] = new Player(socket0.id, "LEFT");
  this.objects[socket1.id] = new Player(socket1.id, "RIGHT");
  this.objects.player0Score = new Score(socket0.id, "LEFT");
  this.objects.player1Score = new Score(socket1.id, "RIGHT");
  this.objects.ball = new Ball(socket0.id, socket1.id);
}
