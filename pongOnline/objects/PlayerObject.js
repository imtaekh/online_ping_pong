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
  this.ready = false;
  this.keypress = {};
  this.mouse = {
    move:{x:undefined,y:undefined},
    click:{x:undefined,y:undefined}
  };

  this.status.rect = {
    height : SETTINGS.PLAYER.HEIGHT,
    width : SETTINGS.PLAYER.WIDTH,
    x : xPos,
    y : SETTINGS.HEIGHT/2,
    color : {fill:color}
  };
}
Player.prototype = new BaseObejct();
Player.prototype.constructor = Player;
Player.prototype.update = function(room){
  var player = this.status.rect;
  if(room.status == "countdown" || room.status == "playing"){
    if(this.keypress[UP]){
      moveUp(player);
      this.mouse.click = null;
    }
    if(this.keypress[DOWN]){
      moveDown(player);
      this.mouse.click = null;
    }
    if(this.mouse.click && ((this.mouse.click.x < player.x+50 && this.mouse.click.x > player.x-50)||(this.mouse.click.x === null))){
      if(this.mouse.click.y<player.y-5){
        moveUp(player);
      } else if (this.mouse.click.y>player.y+5){
        moveDown(player);
      } else {
        this.mouse.click = null;
      }
    }
  }
};

module.exports = Player;

function moveUp(player){
  if(player.y - player.height/2 - UNIT >= 0 + SETTINGS.BORDER_WIDTH)
   player.y -= UNIT;
}
function moveDown(player){
  if(player.y + player.height/2 + UNIT <= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH)
    player.y += UNIT;
}
