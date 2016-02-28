var SETTINGS = require("./SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

function Score(id,position){
  BaseObejct.call(this);
  this.playerId = id;
  this.status.shape = "text";
  this.status.color = "#123456";
  this.status.font = "Arial";
  this.status.textAlign = "center";
  this.status.size = SETTINGS.SCORE.SIZE;
  this.status.text = undefined;
  this.status.y = SETTINGS.SCORE.Y;
  switch(position){
    case "LEFT":
      this.status.x = SETTINGS.WIDTH/2-SETTINGS.SCORE.GAP;
      break;
    case "RIGHT":
      this.status.x = SETTINGS.WIDTH/2+SETTINGS.SCORE.GAP;
      break;
  }
}
Score.prototype = new BaseObejct();
Score.prototype.constructor = Score;
Score.prototype.update = function(objects){
  this.status.text = objects[this.playerId].score;
};
module.exports = Score;
