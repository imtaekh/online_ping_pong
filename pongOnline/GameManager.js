var Player = require("./objects/PlayerObject.js");
var Ball = require("./objects/BallObject.js");
var Score = require("./objects/ScoreObject.js");

var INTERVAL = 10;

function GameManager(io, roomManager){
  var GmMg = this;
  GmMg.RmMg = roomManager;

  GmMg.update = setInterval(function(){
    for(var roomId in GmMg.RmMg.rooms){
      var room = GmMg.RmMg.rooms[roomId];
      var statuses = [];
      switch(room.status){
        case "created":
          room.status="playing";
          room.objects[room.players[0].id] = new Player(room.players[0].id, "LEFT");
          room.objects[room.players[1].id] = new Player(room.players[1].id, "RIGHT");
          room.objects.player0Score = new Score(room.players[0].id, "LEFT");
          room.objects.player1Score = new Score(room.players[1].id, "RIGHT");
          room.objects.ball = new Ball(room.players[0].id, room.players[1].id);
          break;
      }
      for(var object in room.objects){
        var obj = room.objects[object];
        obj.update(room);
        statuses.push(obj.status);
      }
      io.to(room.id).emit('update',statuses);
    }
  },INTERVAL);
}

module.exports = GameManager;
