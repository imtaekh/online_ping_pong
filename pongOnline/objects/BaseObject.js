function BaseObject() {
  this.status = {};
  this.status.x = 0;
  this.status.y = 0;
}
BaseObject.prototype.update = function(){};
module.exports = BaseObject;
