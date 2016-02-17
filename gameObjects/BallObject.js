var SETTINGS = require("./SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

function Ball(){
  BaseObejct.call(this);
  this.status.x = SETTINGS.WIDTH/2;
  this.status.y = SETTINGS.HEIGHT/2;
  this.dx = 1;
  this.dy = 1;
  this.status.shape = "circle";
  this.status.r = SETTINGS.BALL.R;
  this.status.color = "#000000";
}
Ball.prototype = new BaseObejct();
Ball.prototype.constructor = Ball;
Ball.prototype.update = function(){
  this.status.x += this.dx;
  this.status.y += this.dy;
  if(this.status.x - this.status.r <= 0 || this.status.x + this.status.r >= SETTINGS.WIDTH)
    this.dx *= -1;
  if(this.status.y - this.status.r <= 0 || this.status.y + this.status.r >= SETTINGS.HEIGHT)
    this.dy *= -1;
};
module.exports = Ball;
