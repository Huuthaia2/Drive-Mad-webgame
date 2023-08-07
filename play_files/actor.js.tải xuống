var Actor=(function(){
var root={};

root.numOfPlayers=50;
root.actors=[];
root.numOfHero=19;
root.numOfWeapon=45;
var hitInterval=3;
var attackInterval=40;
root.ad5=false;


root.opMove=function (){
    root.actors[0].moving=true;
}
root.opStop=function (){
    root.actors[0].moving=false;
}
root.opChangeDir=function (a){
    root.actors[0].dir=a;
}

function tryHit(a){
    if(a.dead===true)return;
    for(var i=0;i<root.actors.length;i++){
        var t=root.actors[i];
        if(a===t)continue;
        if(t.dead===true)continue;
        if(t.extraShield>0)continue;
        if(t===root.actors[0] && User.isNewbie)continue;
        var dx=t.x-a.x;
        var dy=t.y-a.y;
        var r1=getAttackRadius(a);
        var r2=getRadius(t.level);
        var r=r1+r2;
        if((dx*dx+dy*dy)<(r*r)){
            var ang=gmath.pAngle(dx,dy);
            var ddir=gmath.trunkDir(ang-a.dir);
            if(ddir<180||ddir>290){
                kill(a,t);
            }
        }
    };
}

root.tryMoveHit = function(a){
    if(a.dead===true)return;
    for(var i=0;i<root.actors.length;i++){
        var t=root.actors[i];
        if(a===t)continue;
        if(t.dead===true)continue;
        if(t.extraShield>0)continue;
        var dx=t.x-a.x;
        var dy=t.y-a.y;
        var r1=getRadius(a.level);
        var r2=getRadius(t.level);
        var r=r1+r2;
        if((dx*dx+dy*dy)<(r*r)){
                kill(a,t);
        }
    };
}

root.update=function (dlt){
    for(var i=0;i<root.actors.length;i++){
        var a=root.actors[i];

        if(a.dead===true)continue;

        //武器变大
        if(a.extraWeapon>0){
            a.extraWeapon-=1;
            if(a.extraWeapon===0){
                (function (a){
                    Laya.Tween.to(a.weapon,{scaleX:2,scaleY:2},1500);
                })(a)
            }
        }

        if(a.extraSpeed>0){
            a.extraSpeed-=1;
        }
        if(a.extraShield>0){
            a.extraShield-=1;
        }

        if(a.WudiSpeed>0){
            a.WudiSpeed-=1;
        }

        //位移
        var r;
        if(a.atkCounter>0){
            a.atkCounter-=1;
        }
        if(a.moving===true){
            var speedup = a.level>10?(a.level-10)*0.04+2:2;
            speedup = Math.min(2.5,speedup);
            var spd=a.extraSpeed>0?a.speed*speedup:a.speed;
            
            if(a.WudiSpeed>0){
                spd =20;    
            }
            spd*=dlt/(1000/60);
            a.x+= spd*  Math.cos( gmath.angToArc(a.dir));
            a.y+= spd*  Math.sin( gmath.angToArc(a.dir));
            
            if(a===root.actors[0]){
                var dust=new Laya.Image(
                    a.extraSpeed>0?"effect/energyTail.png":"effect/dust.png");
                dust.x=a.x;
                dust.y=a.y;
                dust.anchorX=0.5;
                var s=getNormalScale(a.level)*3;
                dust.scale(s,s);
                dust.anchorY=1;
                dust.rotation=a.dir-90;
                World.mapLayer.addChild(dust);
                Laya.Tween.to(dust,{alpha:0,},300,null,Laya.Handler.create(null,function (){
                    dust.destroy();
                }
                ));
                if(IsWuDi){
                    root.tryMoveHit(a);
                }
                else{
                    a.rotBody.rotation=a.dir;
                }

            }
            else{
                a.rotBody.rotation=a.dir;
            }
        }else{
            if(a.atkCounter===0 && !IsWuDi){
                // console.log("atk")
                a.atkCounter=attackInterval;
                (function (a){
                    EF.playDg(a);
                    Laya.timer.once(50,null,function (){
                        if(a===root.actors[0]){
                            Laya.SoundManager.playSound("sound/hit"+(1+gmath.getRandomInt(3))+".mp3");
                        }
                        tryHit(a);
                    });
                    Laya.Tween.to(a.weapon,{rotation:-210},100,null,Laya.Handler.create(null,function (){
                              Laya.Tween.to(a.weapon,{rotation:0},150);
                    }));

                })(a)
            }
        }
        JOB.checkWeapon(a,getRadius(a.level));
        var margin=JOB.getMargin();//边界检测
        var hitMargin=false;
        if(a.x<margin){
            a.x=margin;
            hitMargin=true;
        }
        if(a.x>(JOB.maxRow*100-margin)){
            a.x=JOB.maxRow*100-margin;
            hitMargin=true;
        }
        if(a.y<margin){
            a.y=margin;
            hitMargin=true;
        }
        if(a.y>(JOB.maxCol*100-margin)){
            a.y=JOB.maxCol*100-margin;
            hitMargin=true;
        }

        a.sp.x=a.x;
        a.sp.y=a.y;


        //处理AI
        // if(a.hitWallCounter<0)a.hitWallCounter-=1;
        if(i!==0){
            if(hitMargin){
                a.dir=gmath.pAngle(3750-a.x,3750-a.y);
            }else{
                AI.check(a);
            }

        }

    };
}

var expRatial=3;
root.expRatial=expRatial;
root.getExp=function (a,exp){
    a.exp+=exp;
    if(a===root.actors[0]){
        if(a.level<15){
            expRatial = 3;
            root.expRatial=3;
        }
        else if(a.level<20){
            expRatial = 5;
            root.expRatial=5;
        }
        else if(a.level<30){
            expRatial = 8;
            root.expRatial=8; 
            }
        else{
            expRatial = 20;
            root.expRatial=20; 
        }
    }
    
    while(a.exp>=a.level*expRatial){
        a.exp-=a.level*expRatial;
        a.level+=1;
        a.weapon.weapon.skin="weapon/f_wq_"+(a.level>root.numOfWeapon?45:a.level)+".png";

        // a.weapon.weapon.scale(0,0);
        // Laya.Tween.to(a.weapon.weapon,{scaleX:a.extraWeapon>0?4:2,scaleY:a.extraWeapon>0?4:2},1500,Laya.Ease.backOut);
        var s=getNormalScale(a.level);
        s= Math.min(s,2.3);
        a.sp.scale(s,s);
        if(a===root.actors[0]){
            a.levelLable.text=a.level;
            if(a.level>User.weaponLevel){
                User.weaponLevel=a.level;
            }
            Battle.showUpgrade();
            Laya.SoundManager.playSound("sound/levelup.mp3")
            var r=Math.floor(a.level/3);
            r = Math.min(r,8);
            // World.setScale(0.9**r);
            World.setScale(Math.pow(0.9,r));
           
        }
    }
    if(a===root.actors[0]){
        a.expMask.graphics.clear();
        a.expMask.graphics.drawPie(25,25,25,270,270+360*a.exp/(a.level*expRatial),"#000000");
    }
}

root.reborn=function (a,type){
    a.x=Math.random()*7500;
    a.y=Math.random()*7500;
    if(a!==root.actors[0]){
        while(true){
            var dx=root.actors[0].x-a.x;
            var dy=root.actors[0].y-a.y;
            if(Math.abs(dx)<1000&&Math.abs(dy<1000)){
                a.x=Math.random()*7500;
                a.y=Math.random()*7500;
            }else{
                break;
            }
        }
    }
    a.dead=false;
    a.sp.visible=true;
    a.moving=true;
    if(type===0){//武器变大
        a.extraWeapon=600;
        a.extraSpeed=600;
        Laya.Tween.to(a.weapon,{scaleX:4,scaleY:4},1500);
    }else if(type===1){//移速增加
        a.extraSpeed=600;
    }else if(type===2){//护盾
        a.extraShield=600;
        a.extraSpeed=600;
        var img=new Laya.Image("effect/shield.png");
        img.anchorX=0.5;
        img.anchorY=0.5;
        a.sp.addChild(img);
        var imgCount=0;
        var imgSpeed=0.008;
        Laya.timer.frameLoop(1,null,function tmp(){
            imgCount+=1;
            img.scaleX+=imgSpeed;
            if(img.scaleX>=1.05){
                img.scaleX=1.05;
                imgSpeed*=-1;
            }
            if(img.scaleX<=0.95){
                img.scaleX=0.95;
                imgSpeed*=-1;
            }
            img.scaleY=img.scaleX;
            if(imgCount===600){
                img.destroy();
                Laya.timer.clear(null,tmp);
            }
        })
    }else if(type===3){
        a.level=1;
        a.weapon.weapon.skin="weapon/f_wq_1.png";
        var s=getNormalScale(a.level);
        a.sp.scale(s,s);
    }else{
        a.level=Math.max(a.level,1+gmath.getRandomInt(Math.floor(root.actors[0].level/2+Math.random()*root.actors[0].level/2)));
        a.weapon.weapon.skin="weapon/f_wq_"+a.level+".png";
        var s=getNormalScale(a.level);
        a.sp.scale(s,s);
        a.extraWeapon=0;
        a.extraSpeed=0;
        a.extraShield=0;
    }
    if(a===root.actors[0]){
            a.levelLable.text=a.level;
            var r=Math.floor(a.level/3);
            // World.setScale(0.9**r);
            World.setScale(Math.pow(0.9,r));
        }
    a.sp.alpha=0;
    Laya.Tween.to(a.sp,{alpha:1},300);
}


var IsWuDi = false;
root.setbuff = function(a,type){
    if(a!==root.actors[0]) return;
    switch(type){
        case 1:
        a.extraWeapon=300;
        Laya.Tween.to(a.weapon,{scaleX:3,scaleY:3},1500);
        break;
        case 2:
        a.extraSpeed=300;
        break;
        case 3:
        a.extraShield=100;
        var img=new Laya.Image("effect/shield.png");
        img.anchorX=0.5;
        img.anchorY=0.5;
        a.sp.addChild(img);
        var imgCount=0;
        var imgSpeed=0.008;
        Laya.timer.frameLoop(1,null,function tmp(){
            imgCount+=1;
            img.scaleX+=imgSpeed;
            if(img.scaleX>=1.05){
                img.scaleX=1.05;
                imgSpeed*=-1;
            }
            if(img.scaleX<=0.95){
                img.scaleX=0.95;
                imgSpeed*=-1;
            }
            img.scaleY=img.scaleX;
            if(imgCount===600 || a.extraShield===0){
                img.destroy();
                Laya.timer.clear(null,tmp);
            }
        })
        break;
        case 4:
            IsWuDi = true;
            var wudiCount = 0;
            var rotation = 0;
            a.WudiSpeed = 90;
            Laya.timer.frameLoop(1,null,function WudiTmp(){
                wudiCount ++;
                a.rotBody.rotation +=300;
                a.weapon.weapon.visible = false;
                if(wudiCount===90 || a.dead === true){
                IsWuDi=false;
                a.weapon.weapon.visible = true;
                Laya.timer.clear(null,WudiTmp);
                }
            });
        break;
    }
}


function kill(a,target){
    target.dead=true;
    target.sp.visible=false;
    EF.play({x:target.x,y:target.y},"die");
    // root.getExp(a,(1+target.level)*target.level/2+target.exp);
    root.getExp(a,1);

    var n=(10+a.level*2);
    var angBase=gmath.pAngle(target.x-a.x,target.y-a.y);
    for(var i=0;i<n;i++){
        JOB.throwWeapon({
            x:target.x,
            y:target.y,
            r:getRadius(target.level)+100,
            ang:(angBase-n/2*3+i*3)
        })
    };

    if(a===root.actors[0]){
        Battle.setKillTime(600);
        var killCombo = Battle.getKillCombo();
        if(!IsWuDi){
            killCombo ++;
        }
        
        Battle.setKillCombo(killCombo);
        if(killCombo>=3){
            root.setbuff(a,4);
            Battle.setKillCombo(0);
            // Battle.ui.WudiFengHuoLun.visible = false;
            // Laya.timer.once(1500,null,function(){
            //     Battle.ui.WudiFengHuoLun.visible = false;
            // })
        }       
        platform.logEvent("userKill");
        World.shaker.play();
        World.kill+=1;
        Battle.showCombo();
        Battle.showReport();
        Battle.ui.kill.value=World.kill;
        Laya.SoundManager.playSound("sound/dead.mp3");
    }
    if(target===root.actors[0]){
        World.pause();
        Battle.showReborn();
        Battle.setKillCombo(0);
        // Laya.timer.once(300,null,World.end)
        return;
    }else{
        Laya.timer.once(3000,null,function (){
            root.reborn(target,4);
        }
        )
    }


}



function getNormalScale(l){
    return 0.3+l*0.08;
}
root.getNormalScale=getNormalScale;

function getRadius(l){
    return getNormalScale(l)*100;
}
root.getRadius=getRadius;

function getAttackRadius(a){
    return getNormalScale(a.level)*300*(a.extraWeapon>0?2:1);
}
root.getAttackRadius=getAttackRadius;



function reset(a,info){
    a.sp.visible=true;
    a.hitInterval=0;
    a.body.skin=info.skin1;
 //   a.weapon.weapon.skin=info.skin2;
    a.weapon.weapon.skin="weapon/f_wq_"+(info.level)+".png";
    a.nameInfo.text=info.name;
    // a.countryInfo.skin=info.country;
    a.sp.x=info.x;
    a.sp.y=info.y;
    a.moving=true;
    a.extraWeapon=0;
    a.extraSpeed=0;
    if(info.ad5){
        a.extraSpeed=300;
    }
    a.WudiSpeed = 0;
    a.extraShield=0;
    if(a===root.actors[0]){
        a.levelLable.text=info.level;
        a.expMask.graphics.clear();
    }
    //(a===root.actors[0]?false:true);
    a.dead=false;
    a.x=info.x;
    a.y=info.y;
    a.level=info.level;
    a.speed=5;
    a.dir=Math.random()*360;
    a.rotBody.rotation=a.dir;
    a.exp=0;
    a.atkCounter=0;

    var s=getNormalScale(a.level);
    a.sp.scale(s,s);

    a.aiCounter=0;
    a.hitWallCounter=0;
    a.guardRadius=200;
    a.attackRadius=Math.random()*0.9;
    a.target=null;
    a.chaseCounter=0;
    a.canChase=0;
}



function create(i){
    var a={};
    a.sp=new Laya.Sprite();
    a.rotBody=new Laya.Sprite();
    a.body=new Laya.Image();
    a.body.anchorX=0.5;
    a.body.anchorY=0.65;
    a.body.rotation=-90;
    a.weapon=new Laya.Sprite();
    a.weapon.y=50;
    a.weapon.weapon=new Laya.Image();
    a.weapon.weapon.anchorX=0.5;
    a.weapon.weapon.anchorY=0.9;
    a.weapon.weapon.rotation=-90;
    a.weapon.weapon.y=20;
    a.weapon.weapon.x=-10;
    a.weapon.scale(2,2);
    a.weapon.addChild(a.weapon.weapon)
    a.rotBody.addChild(a.weapon);
    a.shadow=new Laya.Image("hero/f_hero_y.png");
    a.shadow.anchorX=0.5;
    a.shadow.anchorY=0.5;
    a.shadow.x=0;
    a.shadow.y=0;
    a.sp.visible=false;
    a.sp.addChild(a.shadow);
    a.sp.addChild(a.rotBody);
    a.rotBody.addChild(a.body);
    a.info=new Laya.Sprite();
    a.info.y=-140;
    a.sp.addChild(a.info);
    a.nameInfo=new Laya.Label();
    a.nameInfo.align="left";
    a.nameInfo.fontSize=30;
    a.nameInfo.color="#ffffff";
    a.nameInfo.x=-50;
    a.countryInfo=new Laya.Image(
    );
    a.countryInfo.anchorX=0.5;
    a.countryInfo.anchorY=0.5;
    a.countryInfo.width=50;
    a.countryInfo.height=50;
    a.countryInfo.x=-80;
    a.countryInfo.y=15;
    if(i===0){
        a.levelLable=new Laya.Label();
        a.countryInfo.addChild(a.levelLable);
        a.levelLable.align="center";
        a.levelLable.fontSize=30;
        a.levelLable.width=60;
        a.levelLable.height=30;
        a.levelLable.anchorX=0.5;
        a.levelLable.anchorY=0.5;
        a.levelLable.x=25;
        a.levelLable.y=25;
        a.levelLable.color="#ffffff";

        a.expMask=new Laya.Sprite();
        a.expCircle=new Laya.Image();
        a.countryInfo.addChild(a.expCircle);
        a.expCircle.skin="ui/f_dar_1.png";
        a.expCircle.anchorX=0.5;
        a.expCircle.anchorY=0.5;
        a.expCircle.width=50;
        a.expCircle.height=50;

        a.expCircle.x=25;
        a.expCircle.y=25;

        a.expCircle.mask=a.expMask;
    }

    a.info.addChild(a.countryInfo);
    a.info.addChild(a.nameInfo);
    World.actorLayer.addChildAt(a.sp,0);

    return a;
}

root.reset=function (){
    var poses=[];
    function inPoses(p){
        for(var i=0;i<poses.length;i++){
            if(p[0]===poses[i][0]&& p[1]===poses[i][1])return true;
        };
        return false;
    }

    for(var i=0;i<root.actors.length;i++){
        var info={};
        if(i===0){
            info.skin1="hero/f_hero_"+User.actors[User.actor].skin+".png";
            info.skin2="weapon/f_wq_"+User.weapons[User.weapon].skin+".png";
            info.name=User.name;
            // info.country="ui/f_dar_2.png";
            if(root.ad5===true){
                info.level=5;
                root.ad5=false;
                info.ad5 = true;
            }else{
                info.level=1;
                info.ad5 = false;
            }
        }else{
            info.skin1="hero/f_hero_"+(1+gmath.getRandomInt(root.numOfHero))+".png";
            info.skin2="weapon/f_wq_"+(1+gmath.getRandomInt(root.numOfWeapon))+".png";
            info.name=(getData((1+gmath.getRandomInt(102))));
            // info.country="hero/gq"+(1+gmath.getRandomInt(16))+".png";
            info.level=1;
        }
        var p=[gmath.getRandomInt(21),gmath.getRandomInt(21)];
        while(inPoses(p)){
            p=[gmath.getRandomInt(21),gmath.getRandomInt(21)];
        }
        poses.push(p);
        info.x=p[0]*350+Math.random()*20;
        info.y=p[1]*350+Math.random()*20;
        reset(root.actors[i],info);
    };
}


root.init=function (){
    for(var i=0;i<root.numOfPlayers;i++){
        root.actors.push(create(i));
    };
}

return root;
})();
