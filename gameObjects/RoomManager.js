function RoomManager(io, SETTINGS){
  var RmMg = this;
  RmMg.rooms = [];

  RmMg.create = function(socket0,socket1){
    var roomNum = socket0.id+socket1.id;
    var room = new Room(roomNum,socket0,socket1);
    socket0.join(roomNum);
    socket1.join(roomNum);
    io.to(roomNum).emit("in");
    RmMg.rooms.push(room);
    console.log("Room Created :", roomNum);
  };
  RmMg.findRoomIndex = function(socket){
    var roomIndex = null;
    RmMg.rooms.some(function(room,index){
      for(var object in room.objects){
        var obj = room.objects[object];
        if(obj.id == socket.id){
          roomIndex = index;
          return true;
        }
      }
    });
    return roomIndex;
  };
  RmMg.update = setInterval(function(){
    RmMg.rooms.forEach(function(room){
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
      io.to(room.num).emit('update',statuses);
    });
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

function Room(num, player0, player1) {
  this.num = num;
  this.status = "waiting";
  this.players = [player0,player1];
  this.objects = {};
  this.objects[player0.id]= new Obj("player",player0.id);
  this.objects[player1.id]= new Obj("player",player1.id);
  this.objects.ball= new Obj("ball");
}

module.exports = RoomManager;
