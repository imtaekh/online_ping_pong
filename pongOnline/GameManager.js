var Player = require("./PlayerObject.js");
var Ball = require("./BallObject.js");

var INTERVAL = 10;

function GameManager(io, roomManager){
  var GmMg = this;
  GmMg.RmMg = roomManager;

  GmMg.update = setInterval(function(){
    for(var roomId in GmMg.RmMg.rooms){
      var room = GmMg.RmMg.rooms[roomId];
      var statuses = [];
      for(var object in room.objects){
        var obj = room.objects[object];
        obj.update(room.objects);
        statuses.push(obj.status);
      }
      io.to(room.id).emit('update',statuses);
    }
  },INTERVAL);
}

module.exports = GameManager;
