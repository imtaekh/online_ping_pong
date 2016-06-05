var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");
var Spark = require("./SparkObject.js");

var COLLUSION_TYPE = { NO_COLLUSION: -1, UP: 1, RIGHT: 2, DOWN: 3, LEFT: 4, SMASH_TYPE_1: 5 ,SMASH_TYPE_2: 6, STRAIGHT: 7};
var QUADRANT = { FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4 };
var TO = { RIGHT: "RIGHT", LEFT: "LEFT", UP: "UP", DOWN: "DOWN" };

function Ball(player0Id, player1Id){
  BaseObejct.call(this);
  this.playerIds = [player0Id,player1Id];
  this.dynamic ={};
  this.speed = 4;
  this.boostCount = 0;
  this.boostCountMax = 100;
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
  var object;
  var playerStat;
  if(this.serve&&this.serve.isOn){
    for(object in room.objects){
      if(object == this.serve.player){
        playerStat = room.objects[object].status.rect;
        ball.y = playerStat.y;
        if(playerStat.x<SETTINGS.WIDTH/2){
          ball.x = playerStat.x+ball.width/2+playerStat.width/2;
        } else {
          ball.x = playerStat.x-ball.width/2-playerStat.width/2;
        }
        if(room.status=="playing" && --this.serve.count<0){
          this.serve.isOn=false;
          var newAngle;
          if(playerStat.x<SETTINGS.WIDTH/2 && playerStat.y<SETTINGS.HEIGHT/2){
            newAngle = -SETTINGS.SERVE_ANGLE;
          } else if(playerStat.x<SETTINGS.WIDTH/2 && playerStat.y>SETTINGS.HEIGHT/2){
            newAngle = +SETTINGS.SERVE_ANGLE;
          } else if(playerStat.x<SETTINGS.WIDTH/2 && playerStat.y==SETTINGS.HEIGHT/2){
            newAngle = getRandomSign()*SETTINGS.SERVE_ANGLE;
          } else if(playerStat.x>SETTINGS.WIDTH/2 && playerStat.y<SETTINGS.HEIGHT/2){
            newAngle = 180+SETTINGS.SERVE_ANGLE;
          } else if(playerStat.x>SETTINGS.WIDTH/2 && playerStat.y>SETTINGS.HEIGHT/2){
            newAngle = 180-SETTINGS.SERVE_ANGLE;
          } else if(playerStat.x>SETTINGS.WIDTH/2 && playerStat.y==SETTINGS.HEIGHT/2){
            newAngle = 180+getRandomSign()*SETTINGS.SERVE_ANGLE;
          }
          this.dynamic = angleToVelocity(newAngle);
        }
      }
    }
  } else if(room.status=="playing"){
    if(this.boostCount >0){
      this.boostCount--;
      var boost;
      if(this.boostCount>(this.boostCountMax/2)){
        this.status.rect.color.fill = "#FF0000";
        boost = 2*this.speed;
      }else{
        this.status.rect.color.fill = "#000000";
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
      ball.color.fill = "#000000";
    }
    if(ball.x >= SETTINGS.WIDTH + ball.width*2){
      room.objects[this.playerIds[0]].score++;
      this.serve= new Serve(this.playerIds[1]);
      ball.color.fill = "#000000";
    }
    if(ball.y - ball.height/2 <= 0 + SETTINGS.BORDER_WIDTH){
      this.dynamic = bounce(0,this.dynamic.angle);
    }

    if(ball.y + ball.height/2 >= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH){
      this.dynamic = bounce(0,this.dynamic.angle);
    }

    for(object in room.objects){
      if(room.objects[object].role == "player"){
        playerStat = room.objects[object].status.rect;
        var collusionType = ballCollusionCheck(ball, playerStat, this.dynamic.angle);

        switch(collusionType){
          case COLLUSION_TYPE.NO_COLLUSION:
            break;
          case COLLUSION_TYPE.UP:
            if(getUpDown(this.dynamic.angle)==TO.DOWN) this.dynamic = bounce(0,this.dynamic.angle);
            else this.dynamic = angleToVelocity(this.dynamic.angle-5);
            //console.log("UP");
            break;
          case COLLUSION_TYPE.DOWN:
            if(getUpDown(this.dynamic.angle)==TO.UP) this.dynamic = bounce(0,this.dynamic.angle);
            else this.dynamic = angleToVelocity(this.dynamic.angle+5);
            //console.log("DOWN");
            break;
          case COLLUSION_TYPE.LEFT:
            if(getLeftRight(this.dynamic.angle)==TO.RIGHT) this.dynamic = bounce(90,this.dynamic.angle);
            //console.log("LEFT");
            break;
          case COLLUSION_TYPE.RIGHT:
            if(getLeftRight(this.dynamic.angle)==TO.LEFT) this.dynamic = bounce(90,this.dynamic.angle);
            //console.log("RIGHT");
            break;
          case COLLUSION_TYPE.SMASH_TYPE_1:
            this.dynamic = smash(this.dynamic.angle);
            this.boostCount = this.boostCountMax;
            room.effects = room.effects.concat(GenerateSparks(ball.x,ball.y));
            //console.log("SMASH_TYPE_1");
            break;
          case COLLUSION_TYPE.SMASH_TYPE_2:
            this.dynamic = slide(this.dynamic.angle);
            this.boostCount = this.boostCountMax;
            room.effects = room.effects.concat(GenerateSparks(ball.x,ball.y));
            //console.log("SMASH_TYPE_2");
            break;
          case COLLUSION_TYPE.STRAIGHT:
            this.dynamic = stratght(this.dynamic.angle);
            //console.log("STRAIGHT");
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

function GenerateSparks(x,y){
  var sparkArray = [];
  for(var i=0;i<Math.random()*10+5;i++){
    sparkArray.push(new Spark(x,y));
  }
  return sparkArray;
}
function stratght(angle){
  var newAngle = getBouncedAngle(90,angle);
  if(angle == 180 || angle === 0){
    newAngle = getRandomSign()*SETTINGS.STRAIGHT_ADJUST;
  } else {
    var adj = getRandomSign()*SETTINGS.STRAIGHT_ADJUST;
    switch(getQuadrant(newAngle)){
      case QUADRANT.FIRST:
      case QUADRANT.THIRD:
        newAngle += adj;
        break;
      case QUADRANT.SECOND:
      case QUADRANT.FOURTH:
        newAngle -= adj;
        break;
    }
  }
  return angleToVelocity(newAngle);
}
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
  switch(getQuadrant(newAngle)){
    case QUADRANT.FIRST:
    case QUADRANT.THIRD:
      newAngle += adj;
      break;
    case QUADRANT.SECOND:
    case QUADRANT.FOURTH:
      newAngle -= adj;
      break;
  }
  return angleToVelocity(newAngle);
}

function smash(angle){
  var newAngle = trimAngle(angle+180);
  var adj = SETTINGS.EDGE_SHOOT_ANGLE_ADJUST;
  switch(getQuadrant(newAngle)){
    case QUADRANT.FIRST:
    case QUADRANT.THIRD:
      newAngle -= adj;
      break;
    case QUADRANT.SECOND:
    case QUADRANT.FOURTH:
      newAngle += adj;
      break;
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
  ballAngle = trimAngle(ballAngle);
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
  var type = COLLUSION_TYPE.NO_COLLUSION;
  var sAngle = SETTINGS.STRATGHT_ANGLE;
  var eAngle = SETTINGS.EDGE_ANGLE;

  if(collusions.length === 0) return type;
  var p2bAngle = getAngle(playerStat,ballStat);
  var p2bLeftRight = getLeftRight(p2bAngle);
  var p2bUpDown = getUpDown(p2bAngle);
  switch(collusions.length){
    case 1:
      var bLeftRight = getLeftRight(ballAngle);
      var bUpDown = getUpDown(ballAngle);
      if(bLeftRight == p2bLeftRight){
        type = (p2bUpDown == TO.UP)?COLLUSION_TYPE.UP:COLLUSION_TYPE.DOWN;
      } else {
        if((ballAngle > eAngle && ballAngle < 180-eAngle) || (ballAngle > 180+eAngle && ballAngle < 360-eAngle))
          type = (bUpDown != p2bUpDown)?COLLUSION_TYPE.SMASH_TYPE_1:COLLUSION_TYPE.SMASH_TYPE_2;
        else
          type = (p2bLeftRight == TO.LEFT)?COLLUSION_TYPE.LEFT:COLLUSION_TYPE.RIGHT;
      }
      break;
    case 2:
      if(collusions[0].x == collusions[1].x){
        if(ballAngle < sAngle || ballAngle > 360-sAngle || (ballAngle < 180+sAngle && ballAngle > 180-sAngle))
          type = COLLUSION_TYPE.STRAIGHT;
        else
          type = (p2bLeftRight == TO.LEFT)?COLLUSION_TYPE.LEFT:COLLUSION_TYPE.RIGHT;
      } else {
        type = (p2bUpDown == TO.UP)?COLLUSION_TYPE.UP:COLLUSION_TYPE.DOWN;
      }
      break;
    case 3: // it will never happen
      break;
    case 4: // you can put recursive function here if you want to be perfect
      break;
  }
  return type;
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

function getRandomSign(){
  return Math.random() < 0.5 ? -1 : 1;
}

function pointSquareCollusionCheck(x,y,square){
  if(x >= square.x-square.width/2 && x <= square.x+square.width/2 && y >= square.y-square.height/2 && y <= square.y+square.height/2 )
    return true;
}
