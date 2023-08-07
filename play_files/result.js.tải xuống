var Result=(function(){
var root={};
var ui;

root.ADgameCnt=0;
root.needAdCnt=0;
root.ADgameCnt1=0;
root.needAdCnt1=0;

root.lvlup=false;
function getExp(){
    if(World.rank===1){
        return 100;
    }
    if(World.rank===2){
        return 80;
    }
    if(World.rank===3){
        return 60;
    }
    return Math.floor((60-World.rank)*0.5);
}


function playExplode(){
    function explode(){
        count-=1;
        var num=3+Math.floor(Math.random()*3);
        for(var i=0;i<num;i++){
            var ef=new Laya.Image();
            ef.skin="effect/lizi"+Math.floor(1+Math.random()*4)+".png";
            ef.x=100+Math.random()*500;
            ef.y=100+Math.random()*100;
            ef.speedY=1;
            ef.scaleX=Math.random()*0.6;
            ef.scaleY=ef.scaleX;
            ef.rotation=Math.random()*360;
            ef.speedX=Math.random()*5*(ef.x-320)>0?1:-1;
            ui.addChild(ef);
            (function(e){
                var life=Math.random()*180;
                Laya.timer.frameLoop(1,null,function tmp(){
                    life-=1;
                    e.x+=e.speedX*1;
                    if(Math.abs(e.speedX)>0.05){
                        e.speedX-=0.05*e.speedX/Math.abs(e.speedX);
                    }else{
                        e.speedX=0;
                    }
                    e.y+=ef.speedY;
                    e.speedY+=0.2;
                    if(life<=0){
                        e.destroy();
                        Laya.timer.clear(null,tmp);
                    }
                })
            })(ef);
        };

        if(count===0){
            Laya.timer.clear(null,explode);
        }
    }
    var count=60;
    Laya.timer.frameLoop(1,null,explode);

}

root.show=function(){
    if(User.loginNum > 1){
        platform.playInterstitial();
    }

    ui.visible=true;
    // Boss.show();

    ui.btnNext.visible = true;
    // platform.showBannerAd(1,'c056df467ce7ce9bdeac4a5742ff7136'); 
     ui.btnNext.y = 761;

    // if(GameConst.IsReady){
    //     ui.btnNext.y = 861;
    // }
    // else{
    //     ui.btnNext.y = 761;
    // }
    // Laya.timer.once(GameConst.IsReadytime1+300,null,function(){
    //     ui.btnNext.visible = true;
    // });
    //EventMgr.getInstance().on(EEvent.bannerload,this,this.showBanner);
    // Laya.timer.once(GameConst.IsReadytime2+300,null,function (){
        
    //     Laya.timer.once(500,null,function(){
    //         ui.btnNext.y = 761;
    //     }) 
    //     platform.ShowBanner(); 
    // })
    root.ADgameCnt = 0;
    root.lvlup=false;
    ui.btnAd.visible = true;
    this.AdCompleted1 = false;
    EventMgr.getInstance().on(EEvent.ShowAdCompleted,this,this.ShowAdCompleted);
    EventMgr.getInstance().on(EEvent.CloseShowAd,this,this.CloseShowAd);
    if(User.isNewbie){
        User.isNewbie=false;
    }
    platform.logEvent("gameEnd");
    // platform.logEvent("resultRank-"+World.rank);
    
    ui.playerLevel.pos(23,177);
    ui.rank.text=World.rank;
    ui.ADExp.value = getExp()*3;
    World.clear();
    Main.setUserInfo(ui.playerLevel);
    Laya.Tween.from(ui.playerLevel,{x:-300},300);
    Laya.Tween.from(ui.botPanel,{y:900},300);
    Laya.timer.frameLoop(1,null,update);
    if(User.getExp(getExp())>0){
        root.lvlup=true;
    }

    // root.refreshBtn();
    if(World.rank===1){
        playExplode();
        Laya.SoundManager.playSound("sound/win.mp3");
        User.winCount+=1;
        ui.winLogo.visible=true;
        ui.loseLogo.visible=false;
        ui.lightBg.visible=false;
        Laya.Tween.from(ui.winLogo,{scaleX:2,scaleY:2},300,null,Laya.Handler.create(null,function (){
            ui.lightBg.visible=true;
            Laya.Tween.from(ui.lightBg,{scaleX:0,scaleY:0},300);
            root.shaker.start();
        }
        ))
    }
    else{

        Laya.SoundManager.playSound("sound/lose.mp3");
        ui.winLogo.visible=false;
        ui.lightBg.visible=false;
        ui.loseLogo.visible=true;
        Laya.Tween.from(ui.loseLogo,{scaleX:2,scaleY:2},300);
    }
    ui.kill.value=World.kill;
    ui.exp.value=getExp();
}

root.refreshBtn = function(){
    if(GameConst.Isresult){
        var needAdCnt = GameConst.Mustresult;
        ui.btnAd.height = 170;
        if(root.ADgameCnt>=needAdCnt){
            ui.btnAd.height = 128;
        }
    }
}


function update(){
    ui.lightBg.rotation+=1;
}

root.ShowAdCompleted = function(pos){
    if(pos==1){
        this.AdCompleted1 = true;
    }   
}

root.CloseShowAd = function(){
    if(this.AdCompleted1){
        if(User.getExp(getExp()*2)>0){
              root.lvlup=true;  
            };
        ui.btnAd.visible = false;
        ui.exp.value=getExp()*3;
    }  
}

// root.showBanner = function(){
//     Laya.timer.once(300,this,function (){
//         if(ui.visible){
//             ui.btnNext.visible = true;
//             ui.btnNext.y = 270;
//         }
           
//     })
// }

root.hide=function(){
    // platform.destroyBannerAd();
    //EventMgr.getInstance().off(EEvent.bannerload,this,this.showBanner);
    EventMgr.getInstance().off(EEvent.ShowAdCompleted,this,this.ShowAdCompleted);
    EventMgr.getInstance().off(EEvent.CloseShowAd,this,this.CloseShowAd);
    root.shaker.stop();
    Laya.timer.clear(null,update);
    ui.visible=false;
    Main.show();
    platform.showinterstitialAd();
}
root.init=function(){
    ui=new resultUI();
    Cord.adjustUI(ui);
    root.ui=ui;
    ui.visible=false;
    var bg=new Laya.Sprite();
    bg.graphics.drawRect(0,0,Laya.stage.width,Laya.stage.height,"#000000");
    bg.alpha=0.8;
    ui.addChildAt(bg,0);
    Laya.stage.addChild(ui);

    ui.btnNext.on('click',null,function(){

        Laya.SoundManager.playSound("sound/btn.mp3");
        
        // platform.playInterstitial(function (){
        // }
        // )
        if(GameConst.IsOpenBanner){
            root.ADgameCnt1 ++;
            if(root.needAdCnt1===0){
                var rd=Math.floor(Math.random()*100);
                if(rd<20){
                    root.needAdCnt1 = 3;
                }
                else if(rd<80){
                    root.needAdCnt1 = 4;
                }
                else{
                    root.needAdCnt1 = 5;
                }
            }
            if(root.ADgameCnt1 >= root.needAdCnt1){
                Laya.timer.once(300,this,root.hide);
                platform.showVideoAd(1,'192b18af70a69561dc5bb65996815bee');
                root.needAdCnt1 = 0;
                root.ADgameCnt1 = 0;
            }
            else{
                root.hide();
            }
        }
        else{
            root.hide();
        }
        
    });
    ui.btnAd.on("click",null,function (){
        Laya.SoundManager.playSound("sound/btn.mp3");
        platform.showVideoAd(1,'80ac47b14c1beff0f5ae8b8f5acdea38');
        root.ADgameCnt ++;
        // root.refreshBtn();
        // platform.playVideo(function (){

        //     platform.logEvent("doubleReward");
        //     if(User.getExp(getExp()*2)>0){
        //       root.lvlup=true;  
        //     };
        //     root.hide();
        // }
        // )
    }
    )
    root.shaker=g.createShaker(ui.btnAd);


    
    Main.initUserInfo(ui.playerLevel);
}
return root;
})();
