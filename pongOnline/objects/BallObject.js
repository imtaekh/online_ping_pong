var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

var COLLUSION_TYPE = { NO_COLLUSION: -1, VERTICAL: 1, HORIZONTAL: 2, EDGE_SMASH: 3 ,EDGE_SLIDE: 4, EDGE_BACK: 5};
var QUADRANT = { FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4 };
var TO = { RIGHT: "RIGHT", LEFT: "LEFT", UP: "UP", DOWN: "DOWN" };

function Ball(player0Id, player1Id){
  BaseObejct.call(this);
  this.playerIds = [player0Id,player1Id];
  this.dynamic ={};
  this.speed = 4;
  this.boostCount = 0;
  this.boostCountMax = 60;
  this.dynamic = undefined;
  this.serve = new Serve(player0Id,-1);
  this.status.shape = "rectangle";
  this.status.rect = {
    x : SETTINGS.WIDTH/2,
    y : SETTINGS.HEIGHT/2,
    width : SETTINGS.BALL.WIDTH,
    height : SETTINGS.BALL.HEIGHT,
    color : {fill:"#000000"}
  };
}
Ball.prototype = new BaseObejct();
Ball.prototype.constructor = Ball;
Ball.prototype.update = function(room){
  var ball = this.status.rect;

  if(this.serve&&this.serve.isOn){
    for(var object in room.objects){
      if(object == this.serve.player){
        var playerStat = room.objects[object].status.rect;
        ball.y = playerStat.y;
        if(playerStat.x<SETTINGS.WIDTH/2){
          ball.x = playerStat.x+ball.width/2+playerStat.width/2;
        } else {
          ball.x = playerStat.x-ball.width/2-playerStat.width/2;
        }
        if(room.status=="playing" && --this.serve.count<0){
          this.serve.isOn=false;
          var newAngle;
          if(playerStat.x<SETTINGS.WIDTH/2){
            newAngle = 50-(playerStat.y/SETTINGS.HEIGHT)*100;
          } else {
            newAngle = 130+(playerStat.y/SETTINGS.HEIGHT)*100;
          }
          this.boostCount = 0;
          this.dynamic = angleToVelocity(newAngle);
        }
      }
    }
  } else if(room.status=="playing"){
    if(this.boostCount >0){
      this.boostCount--;
      var boost;
      if(this.boostCount>(this.boostCountMax/2)){
        this.status.rect.color={fill:"#FF0000"};
        boost = 2*this.speed;
      }else{
        this.status.rect.color={fill:"#000000"};
        boost = 2*this.speed*(this.boostCount*2/this.boostCountMax);
      }
      ball.x += this.dynamic.xVel*(this.speed+boost);
      ball.y += this.dynamic.yVel*(this.speed+boost);
    }else{
      ball.x += this.dynamic.xVel*this.speed;
      ball.y += this.dynamic.yVel*this.speed;
    }
    /* dedug mode
    if(ball.x <= 50 || ball.x >= SETTINGS.WIDTH - 50 ){
    this.speed = 0.2;
      } else {
      this.speed = 2;
    }
    /**/

    if(ball.x <= 0 - ball.width*2){
      room.objects[this.playerIds[1]].score++;
      this.serve= new Serve(this.playerIds[0]);
    }
    if(ball.x >= SETTINGS.WIDTH + ball.width*2){
      room.objects[this.playerIds[0]].score++;
      this.serve= new Serve(this.playerIds[1]);
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
          case COLLUSION_TYPE.EDGE_SMASH:
            this.dynamic = smash(this.dynamic.angle);
            this.boostCount = this.boostCountMax;
            console.log("EDGE_SMASH");
            break;
          case COLLUSION_TYPE.EDGE_SLIDE:
            this.dynamic = slide(this.dynamic.angle);
            console.log("EDGE_SLIDE");
            break;
          case COLLUSION_TYPE.EDGE_BACK:
            this.dynamic = bounce(0,this.dynamic.angle);
            console.log("EDGE_BACK");
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

function Serve(playerId,count){
  return {
    isOn:true,
    player:playerId,
    count:count?count:100
  };
}

function bounce(serfaceAngle,angle){
  var newAngle = getBouncedAngle(serfaceAngle,angle);
  return angleToVelocity(newAngle);
}

function getBouncedAngle(serfaceAngle,angle){
  return serfaceAngle*2-angle;
}

function slide(angle){
  var newAngle = getBouncedAngle(90,angle);
  var adj = SETTINGS.EDGE_SHOOT_ANGLE_ADJUST;
  if(getQuadrant(newAngle) == QUADRANT.FIRST){
    newAngle += adj;
  } else if(getQuadrant(newAngle) == QUADRANT.SECOND){
    newAngle -= adj;
  } else if(getQuadrant(newAngle) == QUADRANT.THIRD){
    newAngle += adj;
  } else if(getQuadrant(newAngle) == QUADRANT.FOURTH){
    newAngle -= adj;
  }
  return angleToVelocity(newAngle);
}

function smash(angle){
  var newAngle = trimAngle(angle+180);
  var adj = SETTINGS.EDGE_SHOOT_ANGLE_ADJUST;
  if(getQuadrant(newAngle) == QUADRANT.FIRST && newAngle>0+adj){
    newAngle -= adj;
  } else if(getQuadrant(newAngle) == QUADRANT.SECOND && newAngle<180-adj){
    newAngle += adj;
  } else if(getQuadrant(newAngle) == QUADRANT.THIRD && newAngle<180+adj){
    newAngle -= adj;
  } else if(getQuadrant(newAngle) == QUADRANT.FOURTH && newAngle<360-adj){
    newAngle += adj;
  } else{
    var randomAngle = Math.random()*adj;
    if(getLeftRight(newAngle) == TO.LEFT){
      newAngle = 180-adj/2+randomAngle;
    } else if(getLeftRight(newAngle) == TO.RIGHT){
      newAngle = 0-adj/2+randomAngle;
    }
  }
  return angleToVelocity(newAngle);
}

function trimAngle(angle){
    angle = angle%360;
    if(angle <0) angle += 360;
    return angle;
}

function angleToVelocity(angle){
  return {
    angle : trimAngle(angle),
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
    if(getLeftRight(ballAngle) == getLeftRight(playerToBallAngle) && ((getLeftRight(ballAngle) == TO.LEFT && ballStat.x < SETTINGS.WIDTH/2) || (getLeftRight(ballAngle) == TO.RIGHT && ballStat.x > SETTINGS.WIDTH/2))){
      return COLLUSION_TYPE.EDGE_BACK;
    }else {
      if(getUpDown(ballAngle) != getUpDown(playerToBallAngle)||ballAngle === 0 || ballAngle ==180){
        return COLLUSION_TYPE.EDGE_SMASH;
      } else {
        return COLLUSION_TYPE.EDGE_SLIDE;
      }
    }
  }
}

function getQuadrant(angle){
  angle = trimAngle(angle);
  if(angle >= 0 && angle <90){
    return QUADRANT.FIRST;
  } else if (angle >= 90 && angle <180){
    return QUADRANT.SECOND;
  } else if (angle >= 180 && angle <270){
    return QUADRANT.THIRD;
  } else {
    return QUADRANT.FOURTH;
  }
}

function getLeftRight(angle){
  angle = trimAngle(angle);
  if(angle<90||angle>270)
    return TO.RIGHT;
  else
    return TO.LEFT;
}

function getUpDown(angle){
  angle = trimAngle(angle);
  if(angle>0&&angle<180)
    return TO.UP;
  else
    return TO.DOWN;
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
