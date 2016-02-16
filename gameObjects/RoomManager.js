function RoomManager(io, SETTINGS){
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
        // console.log(obj);
        switch (obj.role) {
          case "player":
            if(obj.keypress[LEFT] && obj.status.x - UNIT >= 0)
              obj.status.x -= UNIT;
            if(obj.keypress[UP] && obj.status.y - UNIT >= 0)
              obj.status.y -= UNIT;
            if(obj.keypress[RIGHT] && obj.status.x + obj.status.width + UNIT <= SETTINGS.WIDTH)
              obj.status.x += UNIT;
            if(obj.keypress[DOWN] && obj.status.y + obj.status.height + UNIT <= SETTINGS.HEIGHT)
              obj.status.y += UNIT;
            break;
          case "ball":
            break;
          default:
        }
        statuses.push(obj.status);
      }
      io.to(room.id).emit('update',statuses);
    }
  },INTERVAL);
}

var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var UNIT = 2;
var INTERVAL = 10;

function Obj(role, id) {
  var color = "#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
  }
  this.role = role;
  this.status = {};
  this.status.x = 0;
  this.status.y = 0;
  this.status.height = 20;
  this.status.width = 20;

  switch (role) {
    case "player":
      this.status.color = color;
      this.id = id;
      this.keypress = [];
      break;
    case "ball":
      this.status.color = "#000000";
      break;
    default:
  }
}

function Room(id, socket0, socket1) {
  this.id = id;
  this.status = "waiting";
  this.players = [socket0,socket1];
  this.objects = {};
  this.objects[socket0.id]= new Obj("player",socket0.id);
  this.objects[socket1.id]= new Obj("player",socket1.id);
  this.objects.ball= new Obj("ball");
}

module.exports = RoomManager;
