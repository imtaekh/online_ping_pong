function LobbyManager(io){
  var LbMg = this;
  LbMg.lobby = [];
  LbMg.updating = false;

  //Enter lobby
  LbMg.push = function(socket){
    LbMg.lobby.push(socket);
  };

  //Leave lobby
  LbMg.kick = function(socket){
    var index = LbMg.lobby.indexOf(socket);
    if(index >= 0) LbMg.lobby.splice(index,1);
    //console.log("index :", index);
    //console.log("length :", LbMg.lobby.length);
  };

  //Clean lobby -- delete null elements in lobby array
  LbMg.clean = function(){
    var sockets = LbMg.lobby;
    LbMg.lobby = sockets.filter(function(socket){ return socket !== null; });

  };

  //Make rooms for users in lobby
  LbMg.dispatch = function(){
    if(LbMg.dispatching) return;
    LbMg.dispatching = true;
    if(LbMg.lobby.length > 1){
      LbMg.lobby.forEach(function(socket){
        if(socket.connected){
          socket.join("room");
        }
        LbMg.lobby[LbMg.lobby.indexOf(socket)] = null;
      });
      LbMg.clean();
      console.log(LbMg.lobby.length);
      io.to("room").emit('in');
    }
    LbMg.dispatching = false;
  };
}
module.exports = LobbyManager;
