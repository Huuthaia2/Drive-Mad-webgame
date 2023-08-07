var DragList=(function(){
var root={};
var sx = null;
var dis=220;
root.sync=function (){

}

var scaleSpeed=0.003;
root.update=function (){
     root.actor.scaleX+=scaleSpeed;
     if(root.actor.scaleX>1.01){
         root.actor.scaleX=1.01;
         scaleSpeed*=-1;
     }
      if(root.actor.scaleX<0.99){
        root.actor.scaleX=0.99;
         scaleSpeed*=-1;
      }
      var cx=root.list.x*-1;

      for(var i=0;i<root.list.list.length;i++){
        var item=root.list.list[i];
        var dx=Math.min(200,Math.abs(item.x-cx));
        
        var s=1-dx/400;
        // console.log(s);
        item.scale(s,s);
      };

     root.actor.scaleY=root.actor.scaleX;
}

var dragging=false;
root.onMouseDown=function (){
    Laya.SoundManager.playSound("sound/btn.mp3");
    dragging=true;
    sx=Laya.stage.mouseX;
}
root.onMouseMove=function (){
    if(dragging===false||World.started===true)return;
    drag(Laya.stage.mouseX-sx);
    sx=Laya.stage.mouseX;
}

root.onMouseUp=function (){
    bouceBack();
    dragging=false;
}
var scroll=0;


root.select;
function drag(n){
     
    root.list.x+=n;
    var x=root.list.x*-1+dis/2;
    var newSelect=gmath.clamp( Math.floor(x /dis),0,Actor.numOfHero-1);
    if(newSelect!==root.select){
         User.actor=newSelect;
         root.select=User.actor;
        //  root.actor.weapon.skin="hero/f_hero_"+(User.actor+1)+".png";
         platform.logEvent("dragSwitch");
    }
    if(User.actors[User.actor].own){
        Main.ui.btnCondi.visible=false;
        Main.ui.btnPlay.visible=true;
        Main.ui.watchAdText.visible=false;
    }else{
        Main.ui.btnCondi.visible=true;
        Main.ui.btnPlay.visible=false;
        Main.ui.watchAdText.visible=true;
    }
}
root.drag=drag;

function bouceBack(){
    Laya.Tween.to(root.list,{x:User.actor*dis*-1},100);
}
root.show=function (){
    root.list.x=User.actor*dis*-1;
    drag(0);
    root.actor.skin="hero/f_hero_"+(User.actor+1)+".png";
}



root.init=function (ui){
    root.list=new Laya.Sprite();
    ui.addChild(root.list);

    var actor=new Laya.Image("hero/f_hero_"+(User.actor+1)+".png");
    actor.anchorX=0.5;
    actor.anchorY=0.6;
    actor.scale(0.8,0.8);
    actor.y=20;
    actor.weapon=new Laya.Image("weapon/f_wq_"+(User.weapon+1)+".png")
    
    actor.weapon.anchorX=0.5;
    actor.weapon.anchorY=0.5;
    actor.weapon.x=-100;
    //ui.addChild(actor);
   // ui.addChild(actor.weapon);
    
    root.actor=actor;
    root.list.list=[];
    for(var i=0;i<Actor.numOfHero;i++){
        var img=new Laya.Image("hero/f_hero_"+(i+1)+".png");
        img.anchorX=0.5;
        img.anchorY=0.5;
        img.x=i*dis;
        root.list.addChild(img);
        root.list.list.push(img);
    };
    root.list.x=(User.weapon*-256);
    root.select=User.weapon;
}




return root;
})();
