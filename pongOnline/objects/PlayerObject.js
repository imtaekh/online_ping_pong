var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var UNIT = 2;

function Player(id,position){
  BaseObejct.call(this);
  var color = "#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
  }
  var xPos;
  switch(position){
    case "LEFT":
      xPos = SETTINGS.PLAYER.GAP;
      break;
    case "RIGHT":
      xPos = SETTINGS.WIDTH-SETTINGS.PLAYER.GAP-SETTINGS.PLAYER.WIDTH;
      break;
  }
  this.role = "player";
  this.status.shape = "rectangle";
  this.id = id;
  this.score = 0;
  this.keypress = {};
  this.mouse = {
    move:{x:undefined,y:undefined},
    click:{x:undefined,y:undefined}
  };

  this.status.rect = {
    height : SETTINGS.PLAYER.HEIGHT,
    width : SETTINGS.PLAYER.WIDTH,
    x : xPos,
    y : (SETTINGS.HEIGHT-SETTINGS.PLAYER.HEIGHT)/2,
    color : {fill:color}
  };
}
Player.prototype = new BaseObejct();
Player.prototype.constructor = Player;
Player.prototype.update = function(room){
  var player = this.status.rect;
  if(this.keypress[UP] && player.y - UNIT >= 0 + SETTINGS.BORDER_WIDTH)
    player.y -= UNIT;
  if(this.keypress[DOWN] && player.y + player.height + UNIT <= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH)
    player.y += UNIT;
};

module.exports = Player;
