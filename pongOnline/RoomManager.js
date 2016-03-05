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
      delete RmMg.roomIndex[socket.id];
      io.to(socket.id).emit('destroy');
    });
    delete RmMg.rooms[roomId];
  };
}

module.exports = RoomManager;

function Room(id, socket0, socket1) {
  this.id = id;
  this.status = "created";
  this.players = [socket0,socket1];
  this.objects = {};
}
