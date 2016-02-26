var SETTINGS = require("./SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

function Ball(){
  BaseObejct.call(this);
  this.status.x = (SETTINGS.WIDTH-SETTINGS.BALL.WIDTH)/2;
  this.status.y = (SETTINGS.HEIGHT-SETTINGS.BALL.HEIGHT)/2;
  this.dx = 1;
  this.dy = 1;
  this.speed = 1;
  this.status.shape = "rectangle";
  this.status.width = SETTINGS.BALL.WIDTH;
  this.status.height = SETTINGS.BALL.HEIGHT;
  this.status.color = "#000000";
}
Ball.prototype = new BaseObejct();
Ball.prototype.constructor = Ball;
Ball.prototype.update = function(objects){
  this.status.x += this.dx*this.speed;
  this.status.y += this.dy*this.speed;
  if(this.status.x <= 0){
    this.dx = Math.abs(this.dx);
    console.log("changed");
  }
  if(this.status.x + this.status.width >= SETTINGS.WIDTH){
    this.dx = -Math.abs(this.dx);
    console.log("changed");
  }
  if(this.status.y <= 0)
    this.dy = Math.abs(this.dy);
  if(this.status.y + this.status.height >= SETTINGS.HEIGHT)
    this.dy = -Math.abs(this.dy);

  for(var object in objects){
    var status = objects[object].status;
    if(object != "ball"){
      if(ballCollusionCheck(this.status, status)){
        var type = ballCollusionTypeCheck(this.status, status, (this.dx>0)?(-1):(1));
        switch(type){
          case "vertical":
            this.dy = bounce(this.status.y+this.status.height/2, status.y+status.height/2, this.dy);
            break;
          case "horizontal":
            this.dx = bounce(this.status.x+this.status.width/2, status.x+status.width/2, this.dx);
            break;
        }
      }
    }
  }
};
module.exports = Ball;
function bounce (x, y, v){
  if(x<y)
    return -Math.abs(v);
  else
    return Math.abs(v);
}
function ballCollusionCheck(ball,player,dir){
  if(!dir) dir = 0;
  if(pointSquareCollusionCheck(dir+ball.x             , ball.y              , player))
    return true;
  if(pointSquareCollusionCheck(dir+ball.x + ball.width, ball.y              , player))
    return true;
  if(pointSquareCollusionCheck(dir+ball.x             , ball.y + ball.height, player))
    return true;
  if(pointSquareCollusionCheck(dir+ball.x + ball.width, ball.y + ball.height, player))
    return true;
}

function ballCollusionTypeCheck(ball,player,dir){
  if(ballCollusionCheck(ball,player,dir)){
    return "vertical";
  } else {
    return "horizontal";
  }
}

function pointSquareCollusionCheck(x,y,square){
  if(x >= square.x && x <= square.x + square.width && y >= square.y && y <= square.y + square.height )
    return true;
}
