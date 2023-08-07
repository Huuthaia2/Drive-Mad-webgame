var User=(function(){
var root={};

root.actor=0;
root.actors=[];
root.battleCnt = 0;
root.LastLoginDate = 0;
root.isshowZD = false;
root.WatchSkinAd = [];

root.isOnline = 0;
root.aderrormaxcount = 0;
root.aderrorrate = 0;
root.version = 0;
root.clickNum = 0;
root.DateDay = 0;
root.loginNum = 0;


for(var i=0;i<Actor.numOfHero;i++){
    root.actors.push({
        skin:(1+i),own:false
    });
};

for(var i=0;i<Actor.numOfHero;i++){
    root.WatchSkinAd.push({
        id:(1+i),Cnt:0
    });
};

root.actors[0].own=true;

root.weapon=0;
root.weapons=[];
for(var i=0;i<Actor.numOfWeapon;i++){
    root.weapons.push({
        skin:(1+i),own:false
    });
};
root.weapons[0].own=true;
root.level=1;
root.exp=0;
root.winCount=0;
root.signTime=null;
root.signCount=0;
root.abtest=null;
root.bornTime=null;

root.getExpMax=function (){
    return 100*root.level;
}

root.getExp=function (n){
    User.exp+=n;
    var levelUp=0;
    while(true){
        var nd=root.getExpMax();
        if(User.exp>=nd){
            levelUp+=1;
            User.level+=1;
            User.exp-=nd;
            if(root.weapons[root.level-1]){
                root.weapons[root.level-1].own=true;
            }
            if((User.level-1)%3===0){
                var i=(User.level-1)/3;
                if(User.actors[i]){
                    User.actors[i].own=true;
                }
            }

        }else{
            break;
        }
    }
    return levelUp;
}

root.weaponLevel=1;

var props=["actor","actors","weapon","weapons","level","exp","signTime","signCount","winCount","abtest","bornTime","weaponLevel",'battleCnt','LastLoginDate','isshowZD','WatchSkinAd',"clickNum","DateDay","loginNum"
    ];



function copyProp(src,dest){
    for(var i=0;i<props.length;i++){
        var p=props[i];
        if(src[p]!==undefined){
            dest[p]=src[p];
        }
    };
}

root.clearData=function (){
    Laya.LocalStorage.clear();
    Laya.timer.clear(null,root.syncData);
}

root.syncData=function(){
    var data={};
    copyProp(root,data);
    platform.setItem("blade3",data);
    platform.logEvent("onlineTime2");
}
root.init=function(f){
    platform.getItem("blade3",function (d){
        if(!(d===null||d===undefined)){
            copyProp(d,root);
        }
        if(root.abtest===null || root.abtest.version!==ABTest.version){
            root.abtest=ABTest.create();
        }
        if(root.bornTime===null){
            root.isNewbie=true;
            root.bornTime=new Date().getTime();
        }else{
            root.isNewbie=false;
        }
        var dt=new Date().getTime()-root.bornTime;
        dt=dt/(24*3600000);
        dt=Math.floor(Math.max(0,dt));
        if(dt<3){
            platform.logEvent("loginDays-"+dt);
        }
        if(root.loginNum == null){
            root.loginNum == 1;
        }else{
             root.loginNum ++;
        }

        var curData = new Date().getDate();
        if(curData!=User.LastLoginDate){
            User.LastLoginDate = curData;
            User.battleCnt = 0;
            User.isshowZD = false;
        }

        if(!(d===null||d===undefined)){
            if(d.actors.length<Actor.numOfHero){
                for(var i=d.actors.length;i<Actor.numOfHero;i++){
                    root.actors.push({
                        skin:(1+i),own:false
                    });
                };
            }
        }
        
        
        
        root.loginDays=dt;
        User.name=platform.getName();
        User.photo=platform.getPhoto();
        Laya.timer.loop(1000,null,root.syncData);
        f();

        var now = new Date().getDate();
        if(now != User.DateDay){
            User.DateDay = now;
            User.clickNum = 0;
        }
    });

}




return root;
})();
