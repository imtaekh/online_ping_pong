var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

var COLLUSION_TYPE = { NO_COLLUSION: -1, VERTICAL: 1, HORIZONTAL: 2, EDGE:3 };

function Ball(player0Id, player1Id){
  BaseObejct.call(this);
  this.playerIds = [player0Id,player1Id];
  this.dynamic ={};
  this.speed = 4;
  this.dynamic = angleToVelocity(20);
  this.move = true;
  this.status.shape = "rectangle";
  this.status.rect = {
    x : SETTINGS.WIDTH/2,
    y : SETTINGS.HEIGHT/2,
    width : SETTINGS.BALL.WIDTH,
    height : SETTINGS.BALL.HEIGHT,
    color : {fill:"#000000"},
    test:true
  };
}
Ball.prototype = new BaseObejct();
Ball.prototype.constructor = Ball;
Ball.prototype.update = function(room){
  if(this.move&&room.status=="playing"){
    var ball = this.status.rect;
    ball.x += this.dynamic.xVel*this.speed;
    ball.y += this.dynamic.yVel*this.speed;
    /* dedug mode
    if(ball.x <= 50 || ball.x >= SETTINGS.WIDTH - 50 ){
    this.speed = 0.2;
      } else {
      this.speed = 2;
    }
    /**/

    if(ball.x <= 0 - ball.width*2){
      room.objects[this.playerIds[1]].score++;
      this.dynamic = bounce(90,this.dynamic.angle);
      this.initialize();
    }
    if(ball.x >= SETTINGS.WIDTH + ball.width*2){
      room.objects[this.playerIds[0]].score++;
      this.dynamic = bounce(90,this.dynamic.angle);
      this.initialize();
    }
    if(ball.y - ball.height/2 <= 0 + SETTINGS.BORDER_WIDTH){
      this.dynamic = bounce(0,this.dynamic.angle);
    }

    if(ball.y + ball.height/2 >= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH){
      this.dynamic = bounce(0,this.dynamic.angle);
    }

    for(var object in room.objects){
      if(room.objects[object].role == "player"){
        var playerStat = room.objects[object].status.rect;
        var collusionType = ballCollusionCheck(ball, playerStat, this.dynamic.angle);
        switch(collusionType){
          case COLLUSION_TYPE.NO_COLLUSION:
            break;
          case COLLUSION_TYPE.VERTICAL:
            this.dynamic = bounce(0,this.dynamic.angle);
            console.log("vertical");
            break;
          case COLLUSION_TYPE.HORIZONTAL:
            this.dynamic = bounce(90,this.dynamic.angle);
            console.log("horizontal");
            break;
          case COLLUSION_TYPE.EDGE:
            this.dynamic.angle+=180;
            this.dynamic=angleToVelocity(this.dynamic.angle);
            console.log("edge");
            break;
        }
      }
    }
  }
};

Ball.prototype.initialize = function(objects){
  var ball = this.status.rect;
  ball.x = SETTINGS.WIDTH/2;
  ball.y = SETTINGS.HEIGHT/2;
};

module.exports = Ball;

function bounce(serfaceAngle,angle){
  var newAngle = serfaceAngle*2-angle;
  return angleToVelocity(newAngle);
}

function angleToVelocity(angle){
  angle = angle%360;
  if(angle <0) angle += 360;
  return {
    angle : angle,
    xVel : Math.cos(angle/180*Math.PI),
    yVel : -Math.sin(angle/180*Math.PI)
  };
}

function Point(x,y){
  return {x:x,y:y};
}

function ballCollusionCheck(ballStat,playerStat,ballAngle){
  var points=[
    new Point(ballStat.x - ballStat.width/2, ballStat.y - ballStat.height/2),
    new Point(ballStat.x + ballStat.width/2, ballStat.y - ballStat.height/2),
    new Point(ballStat.x - ballStat.width/2, ballStat.y + ballStat.height/2),
    new Point(ballStat.x + ballStat.width/2, ballStat.y + ballStat.height/2),
  ];
  var collusions = [];
  points.forEach(function(point,index){
    if(pointSquareCollusionCheck(point.x,point.y, playerStat)){
      collusions.push(new Point(point.x,point.y));
    }
  });
  if(collusions.length === 0){
    return COLLUSION_TYPE.NO_COLLUSION  ;
  } else if(collusions.length == 2){
      if(collusions[0].x == collusions[1].x){
        return COLLUSION_TYPE.HORIZONTAL;
      } else {
        return COLLUSION_TYPE.VERTICAL;
      }
  } else {
    var playerToBallAngle = getAngle(playerStat,ballStat);
    if((ballAngle<90||ballAngle>270) && playerStat.x<ballStat.x && (playerToBallAngle<90||playerToBallAngle>270)){
      return COLLUSION_TYPE.VERTICAL;
    }else if((ballAngle>90&&ballAngle<270) && playerStat.x>ballStat.x && (playerToBallAngle>90&&playerToBallAngle<270)){
      return COLLUSION_TYPE.VERTICAL;
    }else {
      return COLLUSION_TYPE.EDGE;
    }
  }

}
function getAngle(startPoint,endPoint){
  var angle = Math.atan(-(endPoint.y-startPoint.y)/(endPoint.x-startPoint.x))/Math.PI*180;
  if(startPoint.x>endPoint.x){
    angle += Math.sign(angle)*180;
  }
  if(angle <0) angle += 360;
  return angle;
}
function pointSquareCollusionCheck(x,y,square){
  if(x >= square.x-square.width/2 && x <= square.x+square.width/2 && y >= square.y-square.height/2 && y <= square.y+square.height/2 )
    return true;
}
