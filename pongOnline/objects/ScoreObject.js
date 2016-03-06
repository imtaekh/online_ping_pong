var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

function Score(id,position){
  var xPos;
  switch(position){
    case "LEFT":
      xPos = SETTINGS.WIDTH/2-SETTINGS.SCORE.GAP;
      break;
    case "RIGHT":
      xPos = SETTINGS.WIDTH/2+SETTINGS.SCORE.GAP;
      break;
  }
  BaseObejct.call(this);
  this.playerId = id;
  this.status.shape = "text";
  this.status.text = {};
  this.status.text.color = {fill:"#123456"};
  this.status.text.font = "Arial";
  this.status.text.textAlign = "center";
  this.status.text.textBaseline = "middle";
  this.status.text.size = SETTINGS.SCORE.SIZE;
  this.status.text.message = undefined;
  this.status.text.x = xPos;
  this.status.text.y = SETTINGS.SCORE.Y;
}
Score.prototype = new BaseObejct();
Score.prototype.constructor = Score;
Score.prototype.update = function(room){
  this.status.text.message = room.objects[this.playerId].score;
};
module.exports = Score;
