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
  LbMg.dispatch = function(RmMg){
    if(LbMg.dispatching) return;
    LbMg.dispatching = true;

    while(LbMg.lobby.length > 1){
      var player0 = LbMg.lobby.splice(0,1);
      var player1 = LbMg.lobby.splice(0,1);
      //console.log("player0: ,player0);
      RmMg.create(player0[0],player1[0]);
    }
    LbMg.dispatching = false;
  };
}
module.exports = LobbyManager;
