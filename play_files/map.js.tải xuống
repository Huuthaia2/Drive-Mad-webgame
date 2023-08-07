var JOB=(function(){
var root={};

var weapons=[];
var blocks;
var gridWidth=100;
var gridHeight=100;
// root.gridHeight=gridHeight;
// root.gridWidth=gridWidth;
var maxRow=75;
var maxCol=75;
root.maxRow=maxRow;
root.maxCol=maxCol;

var width=maxCol*gridWidth;
var height=maxRow*gridHeight;

var top,left,right,bottom;
var shrinking,shrinkTime,shrinkDis=0;//

function clamp(n){
    return gmath.clamp(n,0,maxRow-1);
}

root.getMargin=function (){
    return 0;
    // return shrinkTime*shrinkDis;
}

root.update=function (){
    //对齐场景到角色中心
    var x=Actor.actors[0].x;
    var y=Actor.actors[0].y;
    var screenX=Laya.stage.width/2;
    var screenY=Laya.stage.height/2;
    World.scene.pivot(x,y);
    World.scene.x=screenX;
    World.scene.y=screenY;

    
    

    // left.x=margin;
    // // left.y=y;
    // right.x=7500-margin;
    // right.y=y;
    // top.x=x;
    // top.y=margin;
    // bottom.x=x;
    // bottom.y=7500-margin;
}


root.throwWeapon=function (info){
    var w=new Laya.Image("effect/sugar_"+(1+gmath.getRandomInt(17))+".png");
    w.x=info.x;
    w.y=info.y;
    World.mapLayer.addChild(w);
    var s=Math.random()*0.5+0.5;
    w.scale(s,s);
    w.rotation=Math.random()*360;
    // var dis=200+Math.random()*200;
    var dis=info.r;
    // var dir=-5+Math.random()*10+  (Math.random()>0.5?info.dir:(info.dir+180));
    var dir=((info.ang!==undefined)?info.ang:(Math.random()*360));
    var nx=w.x+dis*Math.cos(gmath.angToArc(dir));
    var ny=w.y+dis*Math.sin(gmath.angToArc(dir));
    Laya.Tween.to(
        w,{
            x:nx,
            y:ny,
            rotation:Math.random()*360
        },300,null,
        Laya.Handler.create(null,function (){
            var r=clamp(Math.floor(ny/gridHeight));
            var c=clamp(Math.floor(nx/gridWidth));
            weapons[r][c].push(w);
        }
        )
    )
}


root.checkWeapon=function (a,r){
    var startX=clamp(Math.floor((a.x-r)/gridWidth));
    var endX=clamp(Math.floor((a.x+r)/gridWidth));
    var startY=clamp(Math.floor((a.y-r)/gridHeight));
    var endY=clamp(Math.floor((a.y+r)/gridHeight));
    var r=r*1.5;
    for(var i=startY;i<=endY;i++){
        for(var j=startX;j<=endX;j++){
            var ws=weapons[i][j];
            var newWs=[];
            for(var k=0;k<ws.length;k++){
                var w=ws[k];
                var dx=w.x-a.x;
                var dy=w.y-a.y;
                if((dx*dx+dy*dy)<(r*r)){
                    if(a===Actor.actors[0]){
                        (function (){
                            var img=new Laya.Image();
                            img.skin=w.skin;
                            img.x=w.x;
                            img.y=w.y;
                            img.anchorX=0.5;
                            img.anchorY=0.5;
                            img.scale(w.anchorX,w.anchorX);
                            img.rotation=w.rotation;
                            w.parent.addChild(img);
                            Laya.Tween.to(img,{x:a.x,y:a.y},300,null,Laya.Handler.create(null,function (){
                                img.destroy();
                            }
                            ))
                        })()
                    }
                   
                    
                    
                    // Actor.addWeapon(a);
                    if(w.isbuff){
                        if(a===Actor.actors[0]){
                            Actor.setbuff(a,w.bufftype);
                            w.destroy();
                        }
                        else{
                            newWs.push(w);
                        }
                    }
                    else{
                        Actor.getExp(a,1);
                        w.destroy();
                    }
                    
                }else{
                    newWs.push(w);
                }
            };
            weapons[i][j]=newWs;
        };
    };
}


function spawnWeapon(i,j,skin,isbuff){
    var w=new Laya.Image(skin?skin:"effect/sugar_"+(1+gmath.getRandomInt(17))+".png");
    var randomId = 0;
    var randomCnt = Math.random();
    if(randomCnt<=0.1){
        randomId = 1;
    }
    else if(randomCnt<=0.9){
        randomId = 2;
    }
    else{
        randomId = 3;
    }
    
    w.bufftype = randomId;
    w.anchorX=0.5;
    w.anchorY=0.5;
    w.isbuff = isbuff;
    var s=Math.random()*0.5+0.5;
    w.scale(s,s);
    if(isbuff){
        w.skin = 'effect/buff_'+randomId+'.png';
        w.scale(1.3,1.3);
    }
    w.rotation=Math.random()*360;
    w.x=j*gridWidth+Math.random()*gridWidth;
    w.y=i*gridHeight+Math.random()*gridHeight;
    World.mapLayer.addChild(w);
    weapons[i][j].push(w);
}

root.reset=function (clear){
    World.scene.x=0;
    World.scene.y=0;
    World.scene.pivot(0,0);
    blocks.x=0;
    blocks.y=0;
    left.graphics.clear();
    right.graphics.clear();
    top.graphics.clear();
    bottom.graphics.clear();
    for(var i=0;i<maxRow;i++){
        for(var j=0;j<maxCol;j++){
            var ws=weapons[i][j];
            for(var k=0;k<ws.length;k++){
                ws[k].destroy();
            };
            
            weapons[i][j]=[];
            if(clear!=="clear"){
                if(Math.random() > 0.9){
                    spawnWeapon(i,j,null,false);
                    spawnWeapon(i,j,null,false);
                }

                if(Math.random() > 0.996){
                    spawnWeapon(i,j,null,true);
    
                }

            }
        };
    };
    
    
    shrinkTime=0;
    shrinking=false;
}


var halfC,halfR;
root.init=function (){
    blocks=new Laya.Sprite();
    halfR=Math.floor(Laya.stage.height/100)+1;
    halfC=Math.floor(Laya.stage.width/100)+1;
    
    
    for(var i=0;i<maxRow;i++){
        weapons[i]=[];
        for(var j=0;j<maxCol;j++){
            weapons[i][j]=[];
        };
    };

    var c=15;
    var r=15;
    var w=500;
    blocks.graphics.drawRect(-1000, -1000, 10000, 10000, "#000000");
    for(var i=0;i<r;i++){
        for(var j=0;j<c;j++){
            blocks.graphics.drawTexture(Laya.Loader.getRes("f_dm_1.png"), j * w, i * w, w + 1, w + 1);
        };
    };
    World.mapLayer.addChild(blocks);

    left=new Laya.Sprite();
    right=new Laya.Sprite();
    top=new Laya.Sprite();
    bottom=new Laya.Sprite();

    for(var i=0;i<75;i++){
        var w=new Laya.Image("hero/wall_2.png");
        w.anchorX=0.5;
        w.anchorY=1;
        w.rotation=270;
        w.y=50+i*100;
        left.addChild(w);
    };
    for(var i=0;i<75;i++){
        var w=new Laya.Image("hero/wall_2.png");
        w.anchorX=0.5;
        w.anchorY=1;
        w.rotation=90;
        w.y=50+i*100;
        right.addChild(w);
    };
    right.x=7500;
    for(var i=0;i<75;i++){
        var w=new Laya.Image("hero/wall_2.png");
        w.anchorX=0.5;
        w.anchorY=1;
        w.rotation=0;
        w.x=50+i*100;
        top.addChild(w);
    };
    for(var i=0;i<75;i++){
        var w=new Laya.Image("hero/wall_2.png");
        w.anchorX=0.5;
        w.anchorY=1;
        w.rotation=180;
        w.x=50+i*100;
        bottom.addChild(w);
    };
    bottom.y=7500;

    
    


    World.sideLayer.addChild(left);
    World.sideLayer.addChild(right);
    World.sideLayer.addChild(top);
    World.sideLayer.addChild(bottom);


}

return root;
})();
