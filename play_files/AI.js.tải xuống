var AI=(function(){
var root={};


function changeState(a){
    var enemy=null;
    var r=Actor.getAttackRadius(a);
    var guardRadius=r+a.guardRadius;
    var attackRadius=r* a.attackRadius;
    var mindis=999999999;
    var dx,dy,dr;
    for(var i=0;i<Actor.actors.length;i++){
        var t=Actor.actors[i];
        if(a===t)continue;
        if(t.dead===true)continue;
        dx=t.x-a.x;
        dy=t.y-a.y;
        dr=dx*dx+dy*dy;
        if(dr<(guardRadius*guardRadius)){
            if(dr<mindis){
                mindis=dr;
                enemy=t;
            }
        }
    };
    if(enemy===null){
        a.state="wander";
        a.dir=Math.random()*360;
        a.moving=true;
    }else{
        dx=enemy.x-a.x;
        dy=enemy.y-a.y;
        dr=dx*dx+dy*dy;
        var ang=gmath.pAngle(dx,dy);
        if(enemy.level<=a.level){
            a.state="chase";
            a.chaseCounter=180;
            a.target=enemy;
            a.dir=ang;
            a.moving=true;
        }else{
            if(Math.random()>0.5||World.rank<10){
                a.state="chase";
                a.chaseCounter=180;
                a.target=enemy;
                a.dir=ang;
                a.moving=true;
            }else{
                a.state="flee";
                a.target=enemy;
                a.dir=ang+180;
                a.moving=true;
            }
        }
    }
}


function doByState(a){
    if(a.state==="chase"){
        a.chaseCounter-=1;
        if(a.target.dead===true||a.chaseCounter===0){
            a.target=null;
            a.aiCounter=0;
            return;
        }
        if(a.chaseCounter%60>30){
            a.moving=false;
        }else{
            a.moving=true;
        }
        var r=Actor.getAttackRadius(a);
        var attackRadius=r*((100-World.rank)/250 + a.attackRadius);
        var dx=a.target.x-a.x;
        var dy=a.target.y-a.y;
       // a.dir=gmath.pAngle(dx,dy);//
        if((dx*dx+dy*dy)<(attackRadius*attackRadius)){
            a.moving=false;
            if(a.aiCounter>40){
                a.aiCounter=40;
            }
        }
    }
}

root.check=function (a){
    

    if(a.aiCounter>0){
        a.aiCounter-=1;
        doByState(a);
    }
    if(a.aiCounter<=0){
        a.aiCounter=120+Math.random()*120;
        changeState(a);
    }

}

return root;
})();
