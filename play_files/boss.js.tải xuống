var Boss=(function(){
    var root={};
    var ui;
    var imgUrl = null;
    var randomNum = 1;

    root.init=function(){
        ui=new bossViewUI();
        ui.visible=false;
        root.ui=ui;
        Laya.stage.addChild(ui);
        ui.btn_click.y = Laya.stage.height * 0.9;
        ui.hero.y = Laya.stage.height * 0.77;
        ui.btn_click.on('click',this,function(){
           Laya.SoundManager.playSound("sound/btn.mp3");
           root.AimBtn(ui.btn_click);
           root.creatWq();
        })
    }

    root.creatWq = function(){
        randomNum = Math.floor(1 + Math.random() * 40);
        imgUrl = "weapon/f_wq_" + randomNum +".png";
        var img = new Laya.Image(imgUrl);
        img.pos(ui.hero.x,ui.hero.y - 240);
        img.anchorX = 0.5;
        img.anchorY = 0.5;
        ui.addChild(img);
        Laya.Tween.to(img,{y:ui.monsterY.y,rotation:-360},1000,null,Laya.Handler.create(null,function(){
            root.creatBlood();
            img.destroy();
            img = null;
        }))
    }

    
    root.creatBlood = function(){
        var img = new Laya.Image("effect/eft_diebg.png");
        img.pos(ui.monsterY.x - 30,ui.monsterY.y -30);
        img.rotation = -45;
        img.anchorX = 0.5;
        img.anchorY = 0.5;
        img.scaleX = 0.5;
        img.scaleY = 0.5;
        ui.addChild(img);
        Laya.Tween.to(img,{scaleX:1,scaleY:1},200,null,Laya.Handler.create(null,function(){
            img.destroy();
            img = null;
            // Laya.SoundManager.playSound("sound/hit4.mp3");
            // platform.vibrateLong();
            Laya.Tween.to(ui.hp,{width:ui.hp.width - 30},200,null,Laya.Handler.create(null,function(){
                if(ui.hp.width <= 0){
                    root.hide();
                }
            }))
        }))
    }

    var hpFlag = true;
    root.addHp =  function(){
        if(hpFlag){
            console.log(hpFlag)
            Laya.Tween.to(ui.hp,{width:ui.hp.width + 20 >= 224 ? 224 : ui.hp.width + 30},1000,null,Laya.Handler.create(null,function(){
                hpFlag = true;
            }))
            hpFlag = false;
        }
        // ui.hp.width += 20;
        // if(ui.hp.width >= 224){
        //     ui.hp.width = 224
        // }
    }

    root.AimBtn = function(btn){
        Laya.Tween.to(btn,{scaleX:0.7,scaleY:0.7},200,null,Laya.Handler.create(null,function(){
            Laya.Tween.to(btn,{scaleX:1,scaleY:1},200)
        }))
    }

    root.show = function(){
        ui.hp.width = 224;
        ui.visible = true;
        Laya.timer.loop(3000,this,root.addHp);
    }
    
    root.hide = function(){
        Laya.timer.clear(this,root.addHp);
        ui.visible = false;
    }

    return root;
    })();
    