var Match=(function(){
var root={};
var ui;
var n;
function update(){
    if(Math.random()>0.8){
        n+=1+gmath.getRandomInt(Math.floor(Actor.numOfPlayers*0.1));
    }
    if(n>Actor.numOfPlayers)
    n=Actor.numOfPlayers;
    ui.playerNum.text=n+"/"+Actor.numOfPlayers;
    if(n===Actor.numOfPlayers){
        Laya.timer.clear(null,update);
        g.once(500,root.hide);
    }
    ui.loading.rotation+=3;
}

root.show=function(){
     platform.logEvent("matchStarted");
    ui.visible=true;
    n=1;
    ui.matchingPanel.scale(1,1);
    Laya.Tween.from(ui.matchingPanel,{scaleX:0,scaleY:0},300);
    ui.playerNum.text="1/50";
    User.battleCnt ++;
    Laya.timer.frameLoop(1,null,update);
}
root.hide=function(){
    Main.hide();
     World.start();
    Laya.Tween.to(ui.matchingPanel,{scaleX:0,scaleY:0},300,null,Laya.Handler.create(null,function (){
       
    }
    ));
    ui.visible=false;
}
root.init=function(){
    ui=new main_matchingUI();
    
    Cord.adjustUI(ui);
    var bg=new Laya.Sprite();
    bg.graphics.drawRect(0,0,Laya.stage.width,Laya.stage.height,"#000000");
    bg.alpha=0.8;
    ui.width=Laya.stage.width;
    ui.height=Laya.stage.height
    ui.addChildAt(bg,0);
    ui.visible=false;
    Laya.stage.addChild(ui);
    
}
return root;
})();
