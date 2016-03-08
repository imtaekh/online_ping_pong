var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

function Countdown(count,xPos,yPos,size){
  BaseObejct.call(this);
  this.defaultCount = count?count:10;
  this.defaultSize = size?size:40;
  this.createdAt = Date.now();
  this.status.shape = "text";
  this.status.text = {
    color : {fill:"#123456",stroke:"#ffffff"},
    font : "Arial",
    lineWidth : 10,
    textAlign : "center",
    textBaseline : "middle",
    size : this.defaultSize,
    message : this.defaultCount,
    x : xPos?xPos:SETTINGS.WIDTH/2,
    y : yPos?yPos:SETTINGS.HEIGHT/2
  };
}
Countdown.prototype = new BaseObejct();
Countdown.prototype.constructor = Countdown;
Countdown.prototype.update = function(room){
  var count = this.defaultCount-Math.floor((Date.now()-this.createdAt)/1000);
  if(this.status.text.message != count && count >= 0){
    this.status.text.size = this.defaultSize;
    this.status.text.message = count;
  } else {
    this.status.text.size *= 0.997;
  }
  if(count<0){
    this.action(room);
  }
};
Countdown.prototype.action = function(room){};
module.exports = Countdown;
