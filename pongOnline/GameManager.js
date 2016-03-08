var INTERVAL = 10;

function GameManager(io, roomManager){
  var GmMg = this;
  GmMg.RmMg = roomManager;

  GmMg.update = setInterval(function(){
    for(var roomId in GmMg.RmMg.rooms){
      var room = GmMg.RmMg.rooms[roomId];
      room.loop(room);
    }
  },INTERVAL);
}

module.exports = GameManager;
