var Shop=(function(){
var root={};
var ui;
var tap;
root.ADgameCnt=0;
root.needAdCnt=0;
root.ADgameCnt1=0;

function showHero(){
    tap="hero";
    var data=[];
    for(var i=0;i<Actor.numOfHero;i++){
        var item={};

        item.item={skin:"hero/f_hero_"+(i+1)+".png",
        filters:(User.actors[i].own)?[]:[EF.darkFilter]
        };
        if(User.actor===i){
            item.msk={visible:true};
        }else{
            item.msk={visible:false};
        }
        item.lvNum={value:1+i*3};
        data.push(item);
    };
    ui.hero.dataSource=data;
    ui.hero.visible=true;
    ui.weapon.visible=false;
}

function showWeapon(){
    tap="weapon";
    var data=[];
    for(var i=0;i<Actor.numOfWeapon;i++){
        var item={};
        item.item={
            skin:"weapon/f_wq_"+(i+1)+".png",
            filters:(i<User.weaponLevel?[]:[EF.darkFilter])
        };
        // if(User.weapon===i){
        //     item.msk={visible:true};
        // }else{
            item.msk={visible:false};
        // }
        item.lvNum={value:1+i*1};
        data.push(item);
    };
    ui.weapon.dataSource=data;
    ui.hero.visible=false;
    ui.weapon.visible=true;

    if(GameConst.IsWatchWeapon){
        var needAdCnt1 = GameConst.WatchWeapon;
        root.ADgameCnt1 ++;
        if(root.ADgameCnt1 >= needAdCnt1){
            Laya.timer.once(GameConst.IsEndAdtime,null,function(){
                platform.showVideoAd(0,'56a02db3181e89b267ad0ec265bf11ac');
            })
            root.ADgameCnt1 = 0;
        }
    }
}


root.show=function(){
    ui.visible=true;
    // platform.showBannerAd(1,'83f0f40671ed5f2287d9f5613ce9661a'); 
    ui.btnClose.visible = false;
    if(GameConst.IsReady){
        ui.btnClose.y = 900;
    }
    else{
        ui.btnClose.y = 761;
    }
    Laya.timer.once(GameConst.IsReadytime1,null,function(){
        ui.btnClose.visible = true;
    });
    Laya.timer.once(GameConst.IsReadytime2,null,function(){
        Laya.timer.once(500,null,function(){
            ui.btnClose.y = 761;
        })
        platform.ShowBanner();
    });
   
    
    

    // platform.logEvent("shopShowed");
    if(tap==="hero"){
        showHero();
    }else{
        showWeapon();
    }
}


root.hide=function(){
    // platform.destroyBannerAd();
    ui.visible=false;
    platform.showinterstitialAd();
}



root.init=function(){
    ui=new main_WskinUI();
    Cord.adjustUI(ui);
    ui.visible=false;
    Laya.stage.addChild(ui);    
    ui.weapon1.visible=false;
    ui.weapon2.visible=true;
    ui.hero1.visible=true;
    ui.hero2.visible=false;
    showHero();
    ui.hero2.on('click',null,function(){
        ui.weapon1.visible=false;
        ui.weapon2.visible=true;
        ui.hero1.visible=true;
        ui.hero2.visible=false;
        showHero();
    });

    ui.weapon2.on('click',null,function(){
        ui.hero1.visible=false;
        ui.hero2.visible=true;
        ui.weapon1.visible=true;
        ui.weapon2.visible=false;
        showWeapon();
    });

    var heroInited=[];
    ui.hero.on(Laya.Event.RENDER,null,function(i,n){
        if(heroInited[n]!==true){
            heroInited[n]=true;
            i.on('click',null,function(){
                console.log("hero"+n);
                User.actor=n;
                showHero();

            })
        }
    })

    // var weaponInited=[];
    // ui.weapon.on(Laya.Event.RENDER,null,function(i,n){
    //     if(weaponInited[n]!==true){
    //         weaponInited[n]=true;
    //         i.on('click',null,function(){
    //             console.log("weapon"+n);
    //             User.weapon=n;
    //             showWeapon();
    //         })
    //     }
    // })
    ui.hero.vScrollBarSkin="";
    ui.weapon.vScrollBarSkin="";
    ui.btnClose.on('click',null,function(){
        root.hide();
        Main.show();
        if(GameConst.IsOpenBanner){
            root.ADgameCnt ++;
            if(root.needAdCnt===0){
                var rd=Math.floor(Math.random()*100);
                if(rd<20){
                    root.needAdCnt = 3;
                }
                else if(rd<80){
                    root.needAdCnt = 4;
                }
                else{
                    root.needAdCnt = 5;
                }
            }
            if(root.ADgameCnt >= root.needAdCnt){
                platform.showVideoAd('56c4837f243d682ac787533bdcba0032');
                root.needAdCnt = 0;
                root.ADgameCnt = 0;
            }
        }
    })
}
return root;
})();
