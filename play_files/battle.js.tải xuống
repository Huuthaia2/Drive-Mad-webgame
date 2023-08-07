var Battle=(function(){
var root={};
var ui;
root.ADgameCnt =0;


var handPos=[
    [143,211],
    [164,202],
    [194,224],
    [256,292],
    [285,289],
    [309,252],
    [302,214],
    [248,210],
    [168,288],
    [123,280],
    [114,246],
    [142,209]
]
var handIndex=0;
var speed=6;
function updateHand(){
    var dx=handPos[handIndex][0]-ui.hand.x;
    var dy=handPos[handIndex][1]-ui.hand.y;
    if((Math.abs(dx)+Math.abs(dy))<speed){
        ui.hand.x=handPos[handIndex][0];
        ui.hand.y=handPos[handIndex][1];
        handIndex+=1;
        if(handIndex===handPos.length){
            handIndex=0;
        }
    }else{
        var dis=Math.sqrt(dx*dx+dy*dy);
        ui.hand.x+=dx*speed/dis;
        ui.hand.y+=dy*speed/dis;
    }
}

var combo=0;
var lastCombo;
var KillTime=0;
var KillCombo=0;

root.showUpgrade=function (){
    var img=new Laya.Image("ui/f_pic_lv.png");
    img.anchorX=0.5;
    img.x=Laya.stage.width/2;
    img.y=Laya.stage.height/2;
    Laya.stage.addChild(img);
    Laya.Tween.to(img,{y:img.y-200,alpha:0.5},1000,null,Laya.Handler.create(null,function (){
        img.destroy();
    }
    ))
}

root.setKillTime = function(val){
    KillTime = val;
}

root.getKillCombo = function(){
    return KillCombo;
}

root.setKillCombo = function(val){
    return KillCombo = val;
}


root.update=function (){
    var ma=Actor.actors[0];
    var sx=Laya.stage.width/2;
    var sy=Laya.stage.height/2;
    var maxShow=8;
    if(KillTime>0){
        KillTime --;
    }
    else{
        KillCombo=0;
    }
    
    var infos=[];
    for(var i=0;i<Actor.actors.length;i++){
        var a=Actor.actors[i];
        var s=(a.level-1)*a.level/2;
       infos.push({
           name:a.nameInfo.text,
           photo:a.countryInfo.skin,
           score:(s*Actor.expRatial+a.exp)*10,
           isMain:i===0
       })  
    };

    var sortedInfo=[];
    for(var i=0;i<infos.length;i++){
        var info=infos[i];
        var targetPos=-1;
        
        for(var j=0;j<sortedInfo.length;j++){
            if(info.score>=sortedInfo[j].score){
                targetPos=j;
                break;
            }  
        };
        if(targetPos===-1){
            sortedInfo.push(info);
        }else{
            sortedInfo=sortedInfo.slice(0,targetPos).concat([info]).concat(sortedInfo.slice(targetPos));
        }
    };

    for(var i=0;i<sortedInfo.length;i++){
        if(sortedInfo[i].isMain){
            World.rank=(i+1);
            break;
        }
    };
    

    for(var i=0;i<5;i++){
        var item=ui.p0.getChildByName("item"+i);
        item.getChildByName("photo").skin=sortedInfo[i].photo;
        item.getChildByName("pName").text=sortedInfo[i].name;
        item.getChildByName("pScore").text=sortedInfo[i].score;
        if(sortedInfo[i].isMain){
            item.getChildByName("pName").color="#00ff00";
            item.getChildByName("pScore").color="#00ff00";
        }else{
            item.getChildByName("pName").color="#ffffff";
            item.getChildByName("pScore").color="#ffffff";
        }
    };
    var a=Actor.actors[0];
    var s=(a.level-1)*a.level/2;
    ui.yourScore.getChildByName("pScore").text=(s*Actor.expRatial+a.exp)*10;


    for(var i=0;i<root.flags.length;i++){
        var f=root.flags[i];
        var a=Actor.actors[i+1];
        f.visible=false;
        if(a.dead===true){
            continue;
        }

        f.skin=a.countryInfo.skin;
        var dx=a.x-ma.x;
        var dy=a.y-ma.y;
        if(dx>(sx*-1)/World.sceneScale && dx<(sx/World.sceneScale) && dy>(sy*-1/World.sceneScale) && dy<(sy/World.sceneScale)){
            continue;
        }

        if(maxShow>0){
            f.visible=true;
            maxShow-=1;
        }else{
            continue;
        }
        f.x=sx+gmath.clamp(dx*World.sceneScale,sx*-1,sx);
        // f.x/=World.sceneScale;
        f.y=sy+gmath.clamp(dy*World.sceneScale,sy*-1,sy);
        // console.log(f.x,f.y);
        // f.y/=World.sceneScale;
        var extraDis=Math.abs(Math.abs(dx)-sx)+Math.abs(Math.abs(dy)-sy);
        var s=1-Math.min(0.5,extraDis*0.0001);
        f.scale(s,s);
    };

    
    
    var remainCount=World.gameTime*60-World.frameCount;
    if(remainCount<=600){
        if(remainCount%60===0){
            root.showCount(remainCount/60);
        }
    }
    var remain=Math.floor(remainCount/60);  
    ui.remain.value=remain;
    if(remain===0){
        for(var i=0;i<sortedInfo.length;i++){
            if(sortedInfo[i].name===User.name){
                World.rank=i+1;
            }
        };
        Battle.hideCount();
        World.end();
    }
}


root.showReport=function (){
     ui.report.visible=true;
     ui.report.y=-400;
     var lastKill=World.kill;
     ui.reportC.skin="ui/report"+Math.min(7,World.kill)+".png";
     ui.report.scale(1,1);
     Laya.Tween.from(ui.report,{y:ui.report.y+300,scaleX:1.5,scaleY:1.5},300,Laya.Ease.backOut);
     Laya.timer.once(3000,null,function (){
         if(World.kill===lastKill){
            ui.report.visible=false;
         }
     });
   

}

root.showCount=function (n){
    ui.warning.visible=true;
    ui.warning.text=(n-1);
    g.tweenFrom(ui.warning,{scaleX:2,scaleY:2},300);
}
root.hideCount=function (){
    ui.warning.visible=false;
}



root.showCombo=function (){
    combo+=1;
    ui.combo.value=combo;
    ui.comboCount.visible=true;
    ui.comboCount.scale(1,1);
    ui.comboCount.alpha=1;
    Laya.Tween.from(ui.comboCount,{scaleX:0,scaleY:0},150);
    (function (c){
        Laya.timer.once(5000,null,function (){
            if(combo===c){
                combo=0;
                Laya.Tween.to(ui.comboCount,{
                    alpha:0
                },100,null,Laya.Handler.create(null,function (){
                    ui.comboCount.visible=false;
                }
                ))
            }
        }
    )

    })(combo)
}

root.showReborn=function (){
    // platform.showBannerAd(1,'bd6f3fea86073d1940c6b0de8b948f50');
    root.bg.visible=true;
    // platform.showBannerAd(1,'bd6f3fea86073d1940c6b0de8b948f50');
    //EventMgr.getInstance().on(EEvent.bannerload,this,this.showBanner);
    this.buffType=gmath.getRandomInt(3);
    ui.reborn.visible=true;
    this.buffReborn=ui.reborn.getChildByName("buffReborn");
    this.normalReborn= ui.reborn.getChildByName("normalReborn");
    
    this.actor=ui.reborn.getChildByName("actor");this.actor.skin="hero/f_hero_"+(User.actor+1)+".png";
    this.weapon=ui.reborn.getChildByName("weapon");this.weapon.skin=Actor.actors[0].weapon.weapon.skin;this.weapon.visible=false;
    this.shield=ui.reborn.getChildByName("shield");
    this.title=ui.reborn.getChildByName("buff");
    this.tail=ui.reborn.getChildByName("tail");
    this.shield.visible=false;

    // this.normalReborn.visible=false;
    // Laya.timer.once(GameConst.IsReadytime1,this,function(){
    //     this.normalReborn.visible = true;
    // });
    // Laya.timer.once(GameConst.IsReadytime2,this,function (){
    //     platform.ShowBanner();
    //     Laya.timer.once(500,this,function(){
    //         this.normalReborn.y = 815;
    //     }) 
    // })
    // if(GameConst.IsReady){
    //     this.normalReborn.y = 915;
    // }
    // else{
    //     this.normalReborn.y = 815;
    // }
    // this.normalReborn.y = 815;
    
    // root.refreshBtn();
    
    this.normalReborn.visible=true;
    if(this.buffType===0){
        this.weapon.visible=true;
        this.title.skin="ui/f_pic_pow.png";
    }else if(this.buffType===1){
        this.title.skin="ui/f_pic_spe.png";
    }else{
        this.shield.visible=true;
        this.title.skin="ui/f_pic_shi.png";
    }

    // var bmpSpeed=0.008;
    // var bmpSpeed2=0.009;
    this.buffReborn.scale(1,1);
    // function bump(){
    //     buffReborn.scaleX+=bmpSpeed;
    //     if(buffReborn.scaleX>=1.05){
    //         buffReborn.scaleX=1.05;
    //         bmpSpeed*=-1;
    //     }
    //     if(buffReborn.scaleX<=0.95){
    //         buffReborn.scaleX=0.95;
    //         bmpSpeed*=-1;
    //     }
    //     if(buffType===1){
    //         var img=new Laya.Image("effect/energyTail.png");
    //         img.anchorX=0.5;
    //         img.anchorY=0.5;
    //         tail.addChildAt(img,0);
    //         var s=Math.random()*2+1;
    //         img.scale(s,s);
    //         Laya.Tween.to(img,{y:Math.random()*-300,scaleX:0.3,scaleY:0.3,alpha:0.3},300,null,Laya.Handler.create(null,function (){
    //             img.destroy();
    //         }
    //         ))   
    //     }

    //     shield.scaleX+=bmpSpeed2;
        
    //     if(shield.scaleX>=1.05){
    //         shield.scaleX=1.05;
    //         bmpSpeed2*=-1;
    //     }
    //     if(shield.scaleX<=0.95){
    //         shield.scaleX=0.95;
    //         bmpSpeed2*=-1;
    //     }
       
    //     shield.scaleY=shield.scaleX;
    //     weapon.scaleX=shield.scaleX;
    //     weapon.scaleY=shield.scaleX;
        
    //     buffReborn.scaleY=buffReborn.scaleX;
    // }
    
    // function hideReborn(){
    //         ui.reborn.visible=false;
    //         root.bg.visible=false;
    //         buffReborn.off("click",null,onBuffReborn);
    //         normalReborn.off("click",null,onNormalReborn);
    //         Laya.timer.clear(null,bump);
    //         World.continue();    
    // }
    
    // function onBuffReborn(){
    //     // platform.playInterstitial(function (){
    //     //     platform.logEvent("buffReborn");
    //     //     hideReborn();
    //     //     Actor.reborn(Actor.actors[0],buffType);
    //     // });
    //     platform.showVideoAd(1,'fe34eaf35bc86e9dccc58b3eb67c594f');
    //     Laya.timer.clear(null,bump);
    // }
    // function onNormalReborn(){
    //     hideReborn();
    //     Actor.reborn(Actor.actors[0],3);
    // }
    
    this.buffReborn.on("click",this,this.onBuffReborn);
    this.normalReborn.on("click",this,this.onNormalReborn);

    Laya.timer.frameLoop(1,this,this.bump);


    ui.reborn.scale(1,1);
    // Laya.Tween.from(ui.reborn,{scaleX:0,scaleY:0},300);

}


root.refreshBtn = function(){
    if(GameConst.IsBattleReborn){
        var needAdCnt = GameConst.MustBattleReborn;
        var IsFirstBlood = GameConst.IsFirstBlood;
        if(this.firstblood && IsFirstBlood){
            this.buffReborn.height = 200;
        }
        else if(root.ADgameCnt<needAdCnt){
            this.buffReborn.height = 155;
        }
        else{
            
            this.buffReborn.height = 107;
        }
    }
}


root.hideReborn = function(){

    // platform.destroyBannerAd();
    //EventMgr.getInstance().off(EEvent.bannerload,this,this.showBanner);
    ui.reborn.visible=false;
    root.bg.visible=false;
    this.buffReborn.off("click",this,this.onBuffReborn);
    this.normalReborn.off("click",this,this.onNormalReborn);
    Laya.timer.clear(this,this.bump);
    World.continue();
}

root.onBuffReborn = function(){
    platform.showVideoAd(1,'192b18af70a69561dc5bb65996815bee');
    root.ADgameCnt ++;
    // root.refreshBtn();
}

root.onNormalReborn = function(){
    this.hideReborn();
    Actor.reborn(Actor.actors[0],3);
}


var bmpSpeed=0.008;
var bmpSpeed2=0.009;
root.bump =function(){
    this.buffReborn.scaleX+=bmpSpeed;
        if(this.buffReborn.scaleX>=1.05){
            this.buffReborn.scaleX=1.05;
            bmpSpeed*=-1;
        }
        if(this.buffReborn.scaleX<=0.95){
            this.buffReborn.scaleX=0.95;
            bmpSpeed*=-1;
        }
        if(this.buffType===1){
            var img=new Laya.Image("effect/energyTail.png");
            img.anchorX=0.5;
            img.anchorY=0.5;
            this.tail.addChildAt(img,0);
            var s=Math.random()*2+1;
            img.scale(s,s);
            Laya.Tween.to(img,{y:Math.random()*-300,scaleX:0.3,scaleY:0.3,alpha:0.3},300,null,Laya.Handler.create(null,function (){
                img.destroy();
            }
            ))   
        }

        this.shield.scaleX+=bmpSpeed2;
        
        if(this.shield.scaleX>=1.05){
            this.shield.scaleX=1.05;
            bmpSpeed2*=-1;
        }
        if(this.shield.scaleX<=0.95){
            this.shield.scaleX=0.95;
            bmpSpeed2*=-1;
        }
       
        this.shield.scaleY=this.shield.scaleX;
        this.weapon.scaleX=this.shield.scaleX;
        this.weapon.scaleY=this.shield.scaleX;
        
        this.buffReborn.scaleY=this.buffReborn.scaleX;
    }


root.show=function(){
    ui.visible=true;
    ui.WudiFengHuoLun.visible = false;
    ui.buffRebornText.visible = false;
    this.AdCompleted1 = false;
    this.AdCompleted2 = false;
    this.firstblood = true;
    EventMgr.getInstance().on(EEvent.ShowAdCompleted,this,this.ShowAdCompleted);
    EventMgr.getInstance().on(EEvent.CloseShowAd,this,this.CloseShowAd);
    ui.reborn.visible=false;
    Laya.timer.frameLoop(1,null,updateHand);
    ui.report.visible=false;
    ui.stick.visible=false;
    root.ADgameCnt = 0;
    if(User.isNewbie){
        World.gameTime=40;
    }else{
        World.gameTime=90;
    }
    ui.remain.value=World.gameTime;
    ui.kill.value=0;
    combo=0;
    ui.combo.value=0;
    ui.tutorial.visible=true;
    ui.comboCount.visible=false;

    ui.yourScore.getChildByName("photo").skin=User.photo;
    ui.yourScore.getChildByName("pName").text=User.name;
    ui.yourScore.getChildByName("pScore").text=0;
    
    var count=3;
    ui.countDown.visible=true;
    ui.countDown.skin="ui/countDown3.png";
    Laya.timer.loop(800,null,function tmp(){
        count-=1;
        if(count!==0){
            ui.countDown.skin="ui/countDown"+count+".png";
        }else{
            ui.countDown.visible=false;
            ui.tutorial.visible=false;
            Laya.timer.frameLoop(1,null,World.update);
            Laya.timer.clear(null,updateHand);
            Laya.timer.clear(null,tmp);
        }
    }
    )
}
root.hide=function(){
    EventMgr.getInstance().off(EEvent.ShowAdCompleted,this,this.ShowAdCompleted);
    EventMgr.getInstance().off(EEvent.CloseShowAd,this,this.CloseShowAd);
    ui.visible=false;
}

root.ShowAdCompleted = function(pos){
    if(pos==1){
        this.AdCompleted1 = true;
    }
    if(pos==2){
        this.AdCompleted2 = true;
        
    }
    
}

root.CloseShowAd = function(pos){
    if(this.firstblood){
        this.firstblood = false;
        ui.buffRebornText.visible = true;
        Laya.timer.once(3000,null,function(){
        ui.buffRebornText.visible = false;
        })
        this.AdCompleted1 = false;
        this.hideReborn();
        Actor.reborn(Actor.actors[0],this.buffType);
        return;
    }


    if(this.AdCompleted1){
        this.AdCompleted1 = false;
        this.hideReborn();
        Actor.reborn(Actor.actors[0],this.buffType);
    }
    
    
}



root.init=function(){
    ui=new battleUI();
    Laya.stage.addChild(ui);
    ui.visible=false;
    root.ui=ui;

    var bg=new Laya.Sprite();
    bg.graphics.drawRect(0,0,Laya.stage.width,Laya.stage.height,"#000000");
    bg.alpha=0.8;
    ui.addChildAt(bg,0);
    root.bg=bg;
    bg.visible=false;

    root.flags=[];
    for(var i=0;i<(Actor.numOfPlayers-1);i++){
        var f=new Laya.Image();
        f.anchorX=0.5;
        f.anchorY=0.5;
        f.visible=false;
        ui.addChild(f);
        root.flags.push(f);
    };


    ui.stick.alpha=0.4;

    ui.btn_close.on(Laya.Event.CLICK,this,function(){
        root.onNormalReborn();
    })
}
return root;
})();
