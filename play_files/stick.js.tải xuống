
var Stick=(function(){
var root={};


var sx,sy;
root.dragging=false;
var stickRadius=80;



root.setRadius=function (n){
    stickRadius=n;
}

root.onMouseDown=function(){
    if(World.started===false)return;
    sx=Laya.stage.mouseX;
    sy=Laya.stage.mouseY;
    root.dragging=true;
    Actor.opMove();
    Battle.ui.stick.visible=true;
    Battle.ui.stick.x=sx;
    Battle.ui.stick.y=sy;
    Battle.ui.stickSign.x=100;
    Battle.ui.stickSign.y=100;
}

root.onMouseMove=function (){

    if(World.started===false)return;
    if(root.dragging===false)return;
    var dx=Laya.stage.mouseX-sx;
    var dy=Laya.stage.mouseY-sy;   
    var ang=gmath.pAngle(dx,dy); 

    var maxX=stickRadius*Math.cos(ang*Math.PI/180);
    var maxY=stickRadius*Math.sin(ang*Math.PI/180);
    Battle.ui.stickSign.x=100+((Math.abs(dx)>Math.abs(maxX))?maxX:dx);
    Battle.ui.stickSign.y=100+((Math.abs(dy)>Math.abs(maxY))?maxY:dy);
    
    var shiftX=((Math.abs(dx)>Math.abs(maxX))?(dx-maxX):0);
    var shiftY=((Math.abs(dy)>Math.abs(maxY))?(dy-maxY):0);
    sx+=shiftX;
    sy+=shiftY;
    Battle.ui.stick.x=sx;
    Battle.ui.stick.y=sy;
    Actor.opChangeDir(ang);
    // World.dir=ang;
}

root.onMouseUp=function (){
    if(World.started===false)return;
    root.dragging=false;
    Actor.opStop();
    Battle.ui.stick.visible=false;
}

root.init=function (){
    Laya.stage.on(Laya.Event.MOUSE_DOWN,null,root.onMouseDown);
    Laya.stage.on(Laya.Event.MOUSE_MOVE,null,root.onMouseMove);
    Laya.stage.on(Laya.Event.MOUSE_UP,null,root.onMouseUp);
}


return root;
})();