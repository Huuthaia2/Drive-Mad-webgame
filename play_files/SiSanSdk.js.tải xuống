
var View=Laya.View;
var Dialog=Laya.Dialog;
var Scene=Laya.Scene;
var REG = Laya.ClassUtils.regClass;
class GameTipUI extends View {
	constructor(){ 
		super();
	}
	createChildren() {
		super.createChildren();
		this.createView(GameTipUI.uiView);
	}
	
}
GameTipUI.uiView={"type":"View","props":{"width":720,"height":1280},"compId":2,"child":[{"type":"Label","props":{"y":0,"x":0,"width":400,"var":"value","valign":"middle","text":"Not enough coins","strokeColor":"#080808","stroke":1,"height":67,"fontSize":30,"color":"#ffffff","borderColor":"#ffffff","bold":true,"bgColor":"#232323","anchorY":0.5,"anchorX":0.5,"align":"center"},"compId":4}],"animations":[{"nodes":[{"target":4,"keyframes":{"y":[{"value":0,"tweenMethod":"linearNone","tween":true,"target":4,"key":"y","index":0},{"value":-40,"tweenMethod":"linearNone","tween":true,"target":4,"key":"y","index":20}],"x":[{"value":0,"tweenMethod":"linearNone","tween":true,"target":4,"key":"x","index":0}],"alpha":[{"value":1,"tweenMethod":"linearNone","tween":true,"target":4,"key":"alpha","index":0},{"value":1,"tweenMethod":"linearNone","tween":true,"target":4,"key":"alpha","index":20},{"value":1,"tweenMethod":"linearNone","tween":true,"target":4,"key":"alpha","index":40},{"value":0,"tweenMethod":"linearNone","tween":true,"target":4,"key":"alpha","index":60}]}}],"name":"ani1","id":1,"frameRate":24,"action":1}],"loadList":[],"loadList3D":[]};
REG("ui.Prefab.GameTipUI",GameTipUI);
class blurUI extends View {
	constructor(){ 
		super();
	}
	createChildren() {
		super.createChildren();
		this.createView(blurUI.uiView);
	}
	
}
blurUI.uiView={"type":"View","props":{"width":1280,"height":720},"compId":2,"child":[{"type":"Image","props":{"top":-100,"skin":"ADRes/heidi90.png","sizeGrid":"5,8,5,7","right":-100,"left":-100,"bottom":-100,"alpha":0.7},"compId":6},{"type":"Label","props":{"y":360,"x":640,"var":"tex","text":"Tap to continue","fontSize":32,"color":"#ffffff","centerY":0,"centerX":0,"bold":true,"anchorY":0.5,"anchorX":0.5},"compId":7}],"animations":[{"nodes":[{"target":7,"keyframes":{"scaleY":[{"value":1,"tweenMethod":"linearNone","tween":true,"target":7,"key":"scaleY","index":0},{"value":1.1,"tweenMethod":"linearNone","tween":true,"target":7,"key":"scaleY","index":15},{"value":1,"tweenMethod":"linearNone","tween":true,"target":7,"key":"scaleY","index":30}],"scaleX":[{"value":1,"tweenMethod":"linearNone","tween":true,"target":7,"key":"scaleX","index":0},{"value":1.1,"tweenMethod":"linearNone","tween":true,"target":7,"key":"scaleX","index":15},{"value":1,"tweenMethod":"linearNone","tween":true,"target":7,"key":"scaleX","index":30}]}}],"name":"ani1","id":1,"frameRate":24,"action":2}],"loadList":["ADRes/heidi90.png"],"loadList3D":[]};
REG("ui.blurUI",blurUI);

window.SdkUtil = {
    shiping:0,
    banner:0,
    fenxiang:0,
    yuansheng:0,
    showChaping:false,
    AdNum :0 ,
    screenOrientation : window.GameParameter["screenOrientation"].val,
    xunijian:{},
    yingshekey:{},
    ADInit: function () 
    {
        // Laya.timer.once(4000,this,function()
        // {
        //     window.h5api.canPlayAd(function(data)
        //     {
        //         SdkUtil.AdNum = data.remain ;
        //     })
        // })
        SdkUtil.ShowShuiYing() ;

        
        SdkUtil.GetFocus() ;
        // console.log(document.activeElement)
    },
    ChangeGamePanel(url)
    {
        if(url)
        {
            if(SdkUtil.PushNum==null)
            {
                SdkUtil.PushNum = 0 ;
            }
            if(url.indexOf("Push.scene")!=-1)
            {
                SdkUtil.PushNum += 1 ;
                if(SdkUtil.PushNum >=2)
                {
                    url = url.replace("Push","Push_tt") ;
                }
            }
            if(url.indexOf("Box.scene")!=-1)
            {
                if(SdkUtil.PushNum == 1)
                {
                    url = url.replace("Box","Box_tt") ;
                }
            }
            if(url.indexOf("Win.scene")!=-1)
            {
                if(SdkUtil.PushNum >=2)
                {
                    url = url.replace("Win","Win_tt") ;
                    SdkUtil.PushNum = 0 ;
                }
            }
            if(url.indexOf("Fail.scene")!=-1)
            {
                if(SdkUtil.PushNum == 1)
                {
                    url = url.replace("Fail","Fail_tt") ;
                }
                SdkUtil.PushNum = 0 ;
            }

            SdkUtil.stopBanner = false ;
            if(url.indexOf("GameRun")!=-1)
            {
                SdkUtil.stopBanner = true ;
            }
        }
        return url ;
    },
    UpdateGamePanel(panel)
    {
        if(panel)
        {
            for(var k in SdkUtil.yingshekey)
            {
                if(panel[SdkUtil.yingshekey[k]])
                {
                    SdkUtil.xunijian[k] = panel[SdkUtil.yingshekey[k]] ;
                }
            }
        }
    },
    CloseGamePanel(url)
    {
        // SdkUtil.xunijian = {} ;
    },
    GetConfig:function(v)
    {
        if(v=="box"||v=="xingxiang"||v=="weixiantip")
        {
            return 100 ;
        }
        return 0 ;
    },
    GetFocus()
    {
        // Laya.stage.on(Laya.Event.KEY_DOWN, this, function () {
        //     console.log("按下：")
        // })
        if(window["document"]&&window["document"].addEventListener)
        {
            var key_pressed={};
            document.addEventListener('keyup', function(e) {
               
                if(e&&e.key)
                {
                    for(var k in SdkUtil.xunijian)
                    {
                        if(e.key == k&&SdkUtil.xunijian[k]&&SdkUtil.xunijian[k].event)
                        {
                            SdkUtil.xunijian[k].event(Laya.Event.MOUSE_UP,{"touchId":0})
                            console.log("抬起："+e.key)
                            key_pressed[e.key]=null;
                        }
                    }
                }
            })
            document.addEventListener('keydown', function(e) {
                
                if(e&&e.key)
                {
                    for(var k in SdkUtil.xunijian)
                    {
                        if(e.key == k&&SdkUtil.xunijian[k]&&SdkUtil.xunijian[k].event)
                        {
                            if(key_pressed[e.key]==null)
                            {
                                key_pressed[e.key]=true;
                            }
                            
                            // console.log("按下："+e.key)
                            // SdkUtil.xunijian[e.key].event(Laya.Event.MOUSE_DOWN,{"touchId":0})
                        }
                    }
                }
            })
            
            setInterval(function(){

                for(var key in key_pressed){
                
                if(key_pressed[key]){
                    SdkUtil.xunijian[key].event(Laya.Event.MOUSE_DOWN,{"touchId":0})
                    key_pressed[key]=false
                    console.log("按下："+key)
                }
                
                }
                
                },1);
        }
        window.addEventListener('focus', function() {
            if(SdkUtil.curBlurUI!=null)
            {
                SdkUtil.curBlurUI.destroy();
                SdkUtil.curBlurUI=null ;
            }
        });
        window.addEventListener('blur', function() {
            if(SdkUtil.curBlurUI==null)
            {
                SdkUtil.curBlurUI = Laya.stage.addChild(new blurUI());
                SdkUtil.curBlurUI.x = 0 ;
                SdkUtil.curBlurUI.y = 0 ;
                SdkUtil.curBlurUI.width = Laya.stage.width ;
                SdkUtil.curBlurUI.height = Laya.stage.height ;
            }
        });
        Laya.stage.on(Laya.Event.MOUSE_DOWN,this,function()
        {
            if(window["focus"])
            {
                window.focus() ;
            }
            if(SdkUtil.curBlurUI!=null)
            {
                SdkUtil.curBlurUI.destroy();
                SdkUtil.curBlurUI=null ;
            }
        })
    },
    ShowNeiZhiAD(panel,id)
    {
        panel.visible = false ;
        return false ;
    },
    luzhiKaishi() {
        console.log("luzhiKaishi------")
    },
    luzhijieshu() {
        console.log("luzhijieshu------")
    },
    fenxiangVideo(callback) {
        console.log("fenxiangVideo------")
        if(callback!=null)
        {
            callback(1);
            callback = null;
        }
    },
    ShowChaPing(id)
    {
        
    },
    IsShowADBtn()
    {
        if(SdkUtil.AdNum<=0)
        {
            return false ;
        }
        return true ;
    },
    getYearDay:function(){
        const currentYear = new Date().getFullYear().toString();
        // 今天减今年的第一天（xxxx年01月01日）
        const hasTimestamp = new Date() - new Date(currentYear);
        // 86400000 = 24 * 60 * 60 * 1000
        const hasDays = Math.ceil(hasTimestamp / 86400000) + 1;
        console.log('今天是%s年中的第%s天', currentYear, hasDays);
        if(hasDays >=120)
        { 
            return true;
        } 
        return false;
     },
    ShowBanner()
    {
    },
    CloseBanner()
    {
    },
    ShowVideo(callback)
    {
     platform.getInstance().showReward(()=>{
         if(callback != null){
             callback(1);
         }
     })
    },
    //////////////////////

    ShowShuiYing()
    {
        SdkUtil.add_icon = new Laya.Image("4399.png");
        Laya.stage.addChild(SdkUtil.add_icon);
        SdkUtil.add_icon.zOrder = 100 ;
        SdkUtil.add_icon.alpha = 0.4 ;
        SdkUtil.add_icon.centerX = 0 ;
        SdkUtil.add_icon.bottom = 100 ;
    },

    RandomInt(min,max)
    {
        return Math.round(Math.random()*(max-min)+min);
    },
    ShowTip(v)
    {
        var pos = new Laya.Point(Laya.stage.width*0.5,Laya.stage.height*0.5) ;
        if(SdkUtil.screenOrientation=="2")
        {
            pos = new Laya.Point(Laya.stage.width/2,Laya.stage.height/2) ;
        }
        let ui1 = Laya.stage.addChild(new GameTipUI());
        ui1.value.text = v ;
        ui1.x = pos.x ;
        ui1.y = pos.y ;
        Laya.timer.frameOnce(120,this,function()
        {
            ui1.destroy();
        });
    },


    TDInit()
    {
        if(window["TDGA"]!=null)
        {
            TDGA.Account({
                accountId: TDGA.getDeviceId(),
                accountType: 1//匿名模式
            });
        }
    },
    TDGuanQia(state,missionId)
    {
        if(window["TDGA"]!=null)
        {
            if(state==1)
            {
                console.log("关卡开始"+missionId) ;
                TDGA.onMissionBegin(""+missionId);
            }
            if(state==2)
            {
                console.log("关卡胜利"+missionId) ;
                TDGA.onMissionCompleted(""+missionId);
            }
            if(state==3)
            {
                console.log("关卡失败"+missionId) ;
                TDGA.onMissionFailed(""+missionId,"");
            }
        }
    },
    TDEvent(eventId)
    {
        if(window["TDGA"]!=null)
        {
            console.log("统计事件名称："+eventId) ;
            TDGA.onEvent(eventId, {});
        }
    },
};