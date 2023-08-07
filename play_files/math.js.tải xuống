var gmath=(function(){
var root={};

root.angToArc=function (a){
    return Math.PI*a/180;
}
root.getRandomInt=function (n){
    return Math.floor(Math.random()*n);
}

root.clamp=function (a,mi,ma){
    return Math.min(Math.max(a,mi),ma);
}


root.getIndexByWeight=function (weightList){
    var total=0;
    for(var i=0;i<weightList.length;i++){
        total+=weightList[i];
    };
    var r=Math.random();
    var total2=0;
    for(var i=0;i<weightList.length;i++){
        total2+=weightList[i]
        if(r<(total2/total)){
            return i;
        }
    };
    return 
}



root.getDisSquare=function(a,b){
    var dx=b.x-a.x;
    var dy=b.y-a.y;
    return (dx*dx+dy*dy);
}

root.trunkDir=function(d){
    d=d%360;
    if(d<0){
        d+=360;
    }
    return d;
}
root.trunkDir2=function(d){
    d=d%360;
    if(d>180){
        d-=360;
    }
    if(d<-180){
        d+=360;
    }
    return d;
}
root.rotatePoint=function(p,rot){
    var arc=rot*Math.PI/180;
    return {x:p.x*Math.cos(arc)-p.y*Math.sin(arc),y:p.x*Math.sin(arc)+p.y*Math.cos(arc)};
}

root.pAngle=function(dx,dy){
    var ang;
        if(dx==0){
            if(dy>0){
                ang=90
            }else{
                ang=-90
            }
            return ang;
        }
        ang=Math.atan(dy/dx)/Math.PI*180;
        if(dx<0){
            ang+=180;
        }
    return ang;
}
root.angleP=function(an,r){
    var a=an*Math.PI/180;
   return {x:Math.cos(a)*r,y:Math.sin(a)*r};
}
return root;
})();
