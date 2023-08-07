var Sign=(function(){
var root={};
var ui;
root.ADgameCnt=0;
root.needAdCnt=0;

root.checkCanSign=function (){
    if(User.signTime===null){
        return true;
    }
    var t=new Date().getTime();
    if((t-User.signTime)>(24*3600000) && User.signCount<7){//
        return true;
    }
    return false;
}





root.show=function(){
    ui.visible=true;
    // platform.showBannerAd(1,'fa92fb0b006ed493c12e89df5b287cc7');
    ui.btnClose.visible = false;
    if(GameConst.IsReady){
        ui.btnClose.y = 900;
    }
    else{
        ui.btnClose.y = 761;
    }
    Laya.timer.once(GameConst.IsReadytime1,null,function(){
        ui.btnClose.visible = true;
    });
     Laya.timer.once(GameConst.IsReadytime2,null,function(){
        Laya.timer.once(500,null,function(){
            ui.btnClose.y = 761;
        })
        platform.ShowBanner();
    });
    
    
    

    if(root.checkCanSign()){
        
        ui.btnText.text="Gain Prize"
    }else{
        ui.btnText.text="Close"
    }
    for(var i=0;i<7;i++){
        var msk=ui["item"+i].getChildByName("msk")
        if(i<User.signCount){
            msk.visible=true;
        }else{
            msk.visible=false;
        }
        var today= ui["item"+i].getChildByName("today")
        if(i===User.signCount){
            today.visible=true;
        }else{
            today.visible=false;
        }
    };
}
var rewards=[
    ["a",4],
    ["a",6],
    ["a",9],
    ["a",11],
    ["a",13],
    ["a",15],
    ["w",42],
    ["a",7]
];
root.rewards=rewards;

// root.showBanner = function(){
//     Laya.timer.once(300,this,function (){
//         if(ui.visible){
//             ui.btnClose.visible = true;
//             ui.btnClose.y = 761;
//         }   
//     })
// }

function gain(){
    var item=ui["item"+User.signCount];
    if(rewards[User.signCount][0]==="w"){
        // User.weapons[rewards[User.signCount][1]-1].own=true;
    }else{
        User.actors[rewards[User.signCount][1]-1].own=true;
    }
    if(User.signCount===6){
        User.actors[6].own=true;
    }
    item.getChildByName("msk").visible=true;
    item.getChildByName("today").visible=true;
    User.signCount+=1;
    User.signTime=new Date().getTime();
    Main.setSignRedDot();
    Laya.Tween.to(item,{scaleX:1.2,scaleY:1.2},100,null,Laya.Handler.create(null,function (){
        Laya.Tween.to(item,{scaleX:1,scaleY:1},100);
    }
    ))
}

root.hide=function(){
    EventMgr.getInstance().off(EEvent.bannerload,this,this.showBanner);
    // platform.destroyBannerAd();
    ui.visible=false;
   
}
root.init=function(){
    ui=new main_WsignUI();
    Cord.adjustUI(ui);

    var bg=new Laya.Sprite();
    bg.graphics.drawRect(0,0,Laya.stage.width,Laya.stage.height,"#0");
    bg.alpha=0.8;
    ui.addChildAt(bg,0);

    root.ui=ui;
    Laya.stage.addChild(ui);
    ui.visible=false;

    ui.btnClose.on('click',null,function(){
        if(GameConst.IsEndAd){
            root.ADgameCnt ++;
            if(root.needAdCnt===0){
                var rd=Math.floor(Math.random()*100);
                if(rd<20){
                    root.needAdCnt = 3;
                }
                else if(rd<80){
                    root.needAdCnt = 4;
                }
                else{
                    root.needAdCnt = 5;
                }
            }
            if(root.ADgameCnt >= root.needAdCnt){
                platform.showVideoAd(1,'192b18af70a69561dc5bb65996815bee');
                root.needAdCnt = 0;
                root.ADgameCnt = 0;
            }
        }
        Laya.SoundManager.playSound("sound/btn.mp3");
        if(ui.btnText.text==="Close"){
            root.hide();
            Main.show();
            
        }else{
            ui.btnText.text="Close";
            gain();
        }
    })
    
}
return root;
})();
