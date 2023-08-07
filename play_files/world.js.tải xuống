var World=(function(){
var root={};
root.sceneScale=1;
root.gameTime=90;


root.frameCount;
function update(){
    var dlt=new Date().getTime()-root.lastTime;
    dlt=Math.min(Math.max(0,dlt),100);
    Actor.update(dlt);
    JOB.update(dlt);
    Battle.update(dlt);
    root.frameCount+=1;
    root.lastTime=new Date().getTime();
    // var remain=120-Math.floor(root.frameCount/60);
    // Battle.ui.timerC.value=remain;
    // if(remain===0){
    //     root.end();
    // }
}

root.update=update;

root.end=function (){
    
    Laya.timer.clear(null,update);
    root.started=false;
    Battle.setKillCombo(0);
    Battle.hide();
    Result.show();
}

root.reset=function (){
    root.frameCount=0;
    root.started=true;
    root.rank=Actor.numOfPlayers;
    root.kill=0;
    root.setScale(1);
    Actor.reset();
    JOB.reset();
    root.lastTime=new Date().getTime();
    Battle.show();
}

root.clear=function (){
    root.actorLayer.visible=false;
    JOB.reset("clear");
}

root.pause=function (){
     Laya.timer.clear(null,update);
}   
root.continue=function (){
     Laya.timer.frameLoop(1,null,update);
}



root.start=function (){
     platform.logEvent("gameStarted");
    root.actorLayer.visible=true;
    root.reset();
    root.update();
    // Laya.timer.frameLoop(1,null,update);
}


root.setScale=function (n){
    root.sceneScale=n;
    Laya.Tween.to(root.scene,{scaleX:n,scaleY:n},300);
}

root.init=function (){
    root.camera=new Laya.Sprite();
    root.shaker=g.createTrembler(root.camera)
    root.scene=new Laya.Sprite();
    root.mapLayer=new Laya.Sprite();
    root.sideLayer=new Laya.Sprite();
    
    root.actorLayer=new Laya.Sprite();
    root.effectLayer=new Laya.Sprite();
    root.scene.addChild(root.mapLayer);
    root.scene.addChild(root.sideLayer);
    root.scene.addChild(root.actorLayer);
    root.scene.addChild(root.effectLayer);


    Laya.stage.addChild(root.camera);
    root.camera.addChild(root.scene);
    JOB.init(root.mapLayer);
    Actor.init();
    Stick.init();

    root.started=false;
}


return root;
})();
