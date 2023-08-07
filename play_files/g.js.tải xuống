var g=(function(){
var root={};




root.init=function (){
    root.createSprite=function (){
        return new Laya.Sprite();
    }
    root.createImage=function (s){
        var img=new Laya.Image(s);
        img.anchorX=0.5;
        img.anchorY=0.5;
        return img;
    }
    root.createTrembler=function (item){
        var trembler={};
        var count;
        var tspeed=0.02;
        var maxX=1.03;
        var minX=0.97;

        function tremble(){
            count+=1;
            if(count===6){
                Laya.timer.clear(null,tremble);
                item.scale(1,1);
            }else{
                item.scaleX+=tspeed;
                if(item.scaleX>=maxX){
                    item.scaleX=maxX;
                    tspeed*=-1;
                }
                if(item.scaleX<=minX){
                    item.scaleX=minX;
                    tspeed*=-1;
                }
                item.scaleY=item.scaleX;
            }
        }
        
        trembler.play=function (){
            count=0;
            Laya.timer.frameLoop(1,null,tremble);
        }

        return trembler;
    }
    
    
    root.createShaker=function(item){
        var shaker={};
        var waitCounter,shakeTimes;
        var rotSpeed=2;
        var maxAng=7;
        function resetShake(){
            waitCounter=60;
            shakeTimes=4;
        }
            
        function shake(){
            if(shakeTimes>0){
                item.rotation+=rotSpeed;
                if(item.rotation>maxAng){
                    item.rotation=maxAng;
                    rotSpeed*=-1;
                    shakeTimes-=1;
                }
                if(item.rotation<maxAng*-1){
                    item.rotation=maxAng*-1;
                    rotSpeed*=-1;
                    shakeTimes-=1;
                }
            }else{
                if(Math.abs(item.rotation)>=Math.abs(rotSpeed)){
                    item.rotation-= Math.abs(rotSpeed)*item.rotation/Math.abs(item.rotation);
                }else{
                    item.rotation=0;
                }
                waitCounter-=1;
                if(waitCounter===0){
                    resetShake();
                }
            }
        }

            shaker.start=function (){
                resetShake();
                Laya.timer.frameLoop(1,null,shake);
            }
            

            shaker.stop=function (){
                item.rotation=0;
                Laya.timer.clear(null,shake);
            }
        return shaker;
    }

    root.smoothObj=function (obj,property,value,step){
        var dif=value-obj[property];
        if(Math.abs(dif)<step){
            obj[property]=value;
        }else{
            obj[property]+=dif/10;
        }
    }
    //临时测试
    function getRandomNum(){
        var w=[300,30,10];
        var n=gmath.getIndexByWeight(w);
        if(n===0){
            return (Math.floor(Math.random()/0.2));
        }
        else if(n===1){
            return 5+(Math.floor(Math.random()/0.333333));
        } 
        else return 8;
    }
    root.genNum=function (){
        var result=[];
        var n=getRandomNum()+1;
        while(true){
            if(result.indexOf(n)===-1){
                result.push(n);
            }
            n=getRandomNum()+1;
            if(result.length===3){
                break;
            }
        }
        return result;
    }

    //缩放收缩器
    root.createBumper=function (item,ms,spd){
        var bumper={};

        var speed=spd||0.004;
        var maxScale=ms||0.05;
        var initScaleX=item.scaleX;
        var bumpSpeed=speed*initScaleX;
        var bumpMax=(1+maxScale)*initScaleX;
        var bumpMin=(1-maxScale)*initScaleX;

        function bump(){
            
            item.scaleX+=bumpSpeed;
            if(item.scaleX>=bumpMax){
                item.scaleX=bumpMax;
                bumpSpeed*=-1;
            }
            if(item.scaleX<=bumpMin){
                item.scaleX=bumpMin;
                bumpSpeed*=-1;
            }
            item.scaleY=item.scaleX;

        }
        

        bumper.start=function (){
            Laya.timer.frameLoop(1,null,bump);
        }
        
        bumper.stop=function (){
            item.scaleX=initScaleX;
            item.scaleY=initScaleX;
            Laya.timer.clear(null,bump);
        }
        

        return bumper;
    }
    
    g.once=function (t,f){
        Laya.timer.once(t,null,f);
    }
    g.frameLoop=function (f){
        Laya.timer.frameLoop(1,null,f);
    }
    g.clearLoop=function (f){
        Laya.timer.clear(null,f);
    }

    g.secsToText=function (s){
        var m=Math.floor(s/60);
        var ss=s%60;
        return (Math.floor(m/10)+""+m%10+":"+Math.floor(ss/10)+""+ss%10);
    }
    g.tweenFrom=function (obj,p,time,ease,f){
        Laya.Tween.from(obj,p,time,ease,f?Laya.Handler.create(null,f):null);
    }
    g.tweenTo=function (obj,p,time,ease,f){
        Laya.Tween.to(obj,p,time,ease,f?Laya.Handler.create(null,f):null);
    }

    g.playSound=function (s){
        Laya.SoundManager.playSound("sound/"+s+".mp3");
    }
    
    root.createMover=function (item,info){
        var mover={};


        function move(){
            
            if(info.speedX){
                item.x+=info.speedX;
                if(item.x>=info.maxX){
                    item.x=info.maxX;
                    info.speedX*=-1;
                }
                if(item.x<=info.minX){
                    item.x=info.minX;
                    info.speedX*=-1;
                }
            }
            if(info.speedY){
                item.y+=info.speedY;
                if(item.y>=info.maxY){
                    item.y=info.maxY;
                    info.speedY*=-1;
                }
                if(item.y<=info.minY){
                    item.y=info.minY;
                    info.speedY*=-1;
                }
            }

        }
        

        mover.start=function (){
            Laya.timer.frameLoop(1,null,move);
        }
        
        mover.stop=function (){
            Laya.timer.clear(null,move);
        }
        

        return mover;
    }


}


return root;
})();
