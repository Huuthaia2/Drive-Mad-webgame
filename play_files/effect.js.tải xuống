var EF=(function(){
var root={};



var ef_Info={
    "die":["die_",10,[204,200]],
        "ts":["ts_",5,[168,187]],
    "hb":["hb_",7,[268,249]]
    
}


root.playDg=function (a){
    var ef=new Laya.Animation();
    ef.play(0,false,"hb");
    ef.pivot(134,125);
    var s=Actor.getAttackRadius(a)/120;
    ef.scale(s,s);
    ef.rotation=a.dir-90;
    ef.x=a.x;
    ef.y=a.y;
    World.effectLayer.addChild(ef);
    ef.on(Laya.Event.COMPLETE,null,function(){
        ef.destroy();
    })
}

root.playOn=function (info){
    var ef=new Laya.Animation();
    info.father.addChildAt(ef,0);
     ef.play(0,false,info.name);
     ef.scaleX=info.scaleX;
     ef.scaleY=info.scaleY;
     ef.pivotX=info.pivotX;
     ef.pivotY=info.pivotY;
    //  ef.interval=100;
     
    //  ef.rotation=info.dir;
    ef.on(Laya.Event.COMPLETE,null,function(){
        ef.destroy();
    })
}


//播放序列图
root.play=function (p,name,scale){
    
    var ef=new Laya.Animation();
    ef.x=p.x;
    ef.y=p.y;
    var pivot=ef_Info[name][2];
    ef.pivot(pivot[0]/2,pivot[1]/2);
    if(scale){
        ef.scale(scale,scale);
    }
    if(p.dir){
        ef.dir=p.dir;
    }
    World.effectLayer.addChild(ef);
    ef.play(0,false,name);
    ef.on(Laya.Event.COMPLETE,null,function(){
        ef.destroy();
    })
}




function createArray(n,prefix){
    var a=[];
    for(var i=1;i<=n;i++){
        a.push( prefix+i+".png");
    };
    return a;
}

root.init=function(){
    var keys=Object.keys(ef_Info);
     for(var i=0;i<keys.length;i++){
         var efInfo=ef_Info[keys[i]];
         Laya.Animation.createFrames(createArray(efInfo[1],"effect/"+efInfo[0]),keys[i]);
     };
     var colorMatrix = 
        [
            0, 0, 0, 0, 0, //R
            0, 0, 0, 0, 0, //G
            0, 0, 0, 0, 0, //B
            0, 0, 0, 1, 0, //A
        ];


     root.darkFilter= new Laya.ColorFilter(colorMatrix);
}

return root;
})();
