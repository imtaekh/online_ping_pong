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
  this.status.shape = "rectangle";
  this.status.height = SETTINGS.PLAYER.HEIGHT;
  this.status.width = SETTINGS.PLAYER.WIDTH;
  this.status.y = (SETTINGS.HEIGHT-this.status.height)/2;
  switch(position){
    case "LEFT":
      this.status.x = SETTINGS.BORDER_WIDTH;
      break;
    case "RIGHT":
      this.status.x = SETTINGS.WIDTH-SETTINGS.BORDER_WIDTH -this.status.width;
      break;
  }
  this.status.color = color;
  this.id = id;
  this.keypress = [];
}
Player.prototype = new BaseObejct();
Player.prototype.constructor = Player;
Player.prototype.update = function(){
  if(this.keypress[LEFT] && this.status.x - UNIT >= 0)
    this.status.x -= UNIT;
  if(this.keypress[UP] && this.status.y - UNIT >= 0)
    this.status.y -= UNIT;
  if(this.keypress[RIGHT] && this.status.x + this.status.width + UNIT <= SETTINGS.WIDTH)
    this.status.x += UNIT;
  if(this.keypress[DOWN] && this.status.y + this.status.height + UNIT <= SETTINGS.HEIGHT)
    this.status.y += UNIT;
};

module.exports = Player;
