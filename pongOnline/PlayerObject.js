var SETTINGS = require("./SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var UNIT = 2;

function Player(id,position){
  BaseObejct.call(this);
  var color = "#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
  }
  this.role = "player";
  this.status.shape = "rectangle";
  this.status.height = SETTINGS.PLAYER.HEIGHT;
  this.status.width = SETTINGS.PLAYER.WIDTH;
  this.status.y = (SETTINGS.HEIGHT-this.status.height)/2;
  switch(position){
    case "LEFT":
      this.status.x = SETTINGS.PLAYER.GAP;
      break;
    case "RIGHT":
      this.status.x = SETTINGS.WIDTH-SETTINGS.PLAYER.GAP -this.status.width;
      break;
  }
  this.status.color = color;
  this.id = id;
  this.score = 0;
  this.keypress = {};
}
Player.prototype = new BaseObejct();
Player.prototype.constructor = Player;
Player.prototype.update = function(objects){
  if(this.keypress[UP] && this.status.y - UNIT >= 0 + SETTINGS.BORDER_WIDTH)
    this.status.y -= UNIT;
  if(this.keypress[DOWN] && this.status.y + this.status.height + UNIT <= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH)
    this.status.y += UNIT;
};

module.exports = Player;
