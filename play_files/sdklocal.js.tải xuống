if(typeof sdk==="undefined")var sdk={};

sdk.local=(function(){
var root={};
var bannerAd = null;

root.setItem=function (name,v){
    // Laya.LocalStorage.setItem(name,JSON.stringify(v));
    if (Laya.Browser.onVVMiniGame) {
            qg.setStorageSync({
                "key": name,
                "value": JSON.stringify(v),
            })
        } else {
             Laya.LocalStorage.setItem(name,JSON.stringify(v));
        }
}
root.getItem=function (name,f){
    // f(null);
    var result=Laya.LocalStorage.getItem(name);
    if(result ===""){
        result=null;
    }
   f(JSON.parse(result));
        // if (Laya.Browser.onVVMiniGame) {
        //     let result = qg.getStorageSync({ "key": name });
        //     if (!result) {
        //          f(null);
        //     } else {
        //          f(JSON.parse(result));
        //     }
        // } else {
        //        var result=Laya.LocalStorage.getItem(name);
        //         if(result ===""){
        //             result=null;
        //         }
        //         f(JSON.parse(result))
        // }
}


root.getGlobalRankList=function (f,start,end){
    f([
        {name:"asd",photo:"",rank:4,score:1,info:{level:2}},
        {name:"asd3",photo:"",rank:5,score:1,info:{level:2}},
        {name:"asfsfdsd",photo:"",rank:6,score:1,info:{level:2}},
    ]);
}

root.setRank=function (obj){
    if(obj.f){
        obj.f(1);
    }
}

var rank=null;
root.initRank=function(f){
    f();
}


root.setLoadingProgress=function (){

}
root.playInterstitial=function (f){
    f();
}
root.playVideo=function (f){
    f();
}
root.getName=function (){
    return "你"
}
root.getPhoto=function (){
    return "";
}

root.getLoginID = function(){
    return LoginID;
}

root.getBannerAd = function(){
    return bannerAd;
}

root.share=function (f){
    qq.shareAppMessage({
        title:"小心！这个游戏容易上瘾！",
        imageUrl: "https://r2cdn-cnp.r2games.com.cn/yhz/wx_share10000.png" 
    })
    
}

//游戏进程相关
var LoginID = 0;
root.afterInit=function (f){
    // qg.login({
    // success: function(res){
    //     var data = JSON.stringify(res.data);
    //     console.log(data);
    // },
    // fail: function(res){
    //   // errCode、errMsg
    //     console.log(JSON.stringify(res));
    // }
    // })
   

    User.init(f);
}

root.shake=function (f){
    qq.vibrateShort({
        fail:function (){
            qq.vibrateLong();
        }
    })
}

var isNetwork = false;
root.onNetwork = function(){
    qg.subscribeNetworkStatus({
        callback: function (data) {
            console.log("handling callback， type=", data.type)
            isNetwork = true;
        }
    })
}

var isPlayVideAd = false;
var videoAdIsFirst = true;
var showPos = 0;
var rewardedVideoAd;
var fetchingVideoAd = false;

root.initAD = function(){
    if (typeof (qg) == "undefined") return;
    root.onNetwork();

    rewardedVideoAd = qg.createRewardedVideoAd({ posId: "a4e1652177fc43bc80199157a15f35ac" });  

    rewardedVideoAd.onClose(function (res) {
        console.log("res:" + res.isEnded);
        if (res && res.isEnded || res === undefined) {
            EventMgr.getInstance().event(EEvent.ShowAdCompleted,showPos);
            EventMgr.getInstance().event(EEvent.CloseShowAd,showPos);
        }
        else {
          EventMgr.getInstance().event(EEvent.CloseShowAd,showPos);
            // 播放中途退出，不下发游戏奖励
        }
        isPlayVideAd = false;
        isPlayMusic = true;
        Laya.SoundManager.playMusic("sound/bgm.mp3",0);
    });

    rewardedVideoAd.onError(function (res) {
        console.log("fetch video error:" + res.errMsg);
        if(videoAdIsFirst)return;
        root.showTips("广告准备中");
        isPlayVideAd = false;
        isPlayMusic = true;
        EventMgr.getInstance().event(EEvent.FetchVideoFail,showPos);
        Laya.SoundManager.playMusic("sound/bgm.mp3",0);
    });
    
    rewardedVideoAd.onLoad(function () {
        if (videoAdIsFirst) return;
        var adshow = rewardedVideoAd.show();
        // 捕捉show失败的错误
        Laya.SoundManager.stopMusic();
        isPlayMusic = false;
        adshow && adshow.catch(function(){
            console.log("激励广告展示失败" + JSON.stringify(err))
            isPlayVideAd = false;
            root.showTips("暂无广告,稍后再试")
            EventMgr.getInstance().event(EEvent.FetchVideoFail,showPos);
            Laya.SoundManager.playMusic("sound/bgm.mp3",0);
        })
    });
}



root.showVideoAd = function(pos,adunitid){
    showPos = pos;
   if (typeof (qg) == "undefined") {
        EventMgr.getInstance().event(EEvent.ShowAdCompleted,showPos);
        EventMgr.getInstance().event(EEvent.CloseShowAd,showPos);
        return;
   };
    if (!isNetwork) {
        root.showTips("暂无广告，请稍后再试");
        return;
    }


    isPlayVideAd = true;
    if (videoAdIsFirst) {
        videoAdIsFirst = false;
        var adshow = rewardedVideoAd.show();
        // 捕捉show失败的错误 
        Laya.SoundManager.stopMusic();
        isPlayMusic = false;
        adshow && adshow.catch(function(){
            console.log("激励广告展示失败" + JSON.stringify(err))
            isPlayVideAd = false;
            root.showTips("暂无广告");
           EventMgr.getInstance().event(EEvent.FetchVideoFail,showPos);
            Laya.SoundManager.playMusic("sound/bgm.mp3",0);
        })
        return;
    }

    var adLoad = rewardedVideoAd.load();//第一次调用 可能会报-3  广告能正常展示就可以忽略
    // 捕捉load失败的错误
    adLoad && adLoad.catch(function(){
        console.log("激励广告load失败" + JSON.stringify(err))
        isPlayVideAd = false;
        isPlayMusic = true;
        root.showTips("暂无广告");
        EventMgr.getInstance().event(EEvent.FetchVideoFail,showPos);
        Laya.SoundManager.playMusic("sound/bgm.mp3",0);
    })


}
var showBannerPos = 0;
var lastFetchBannerTime = 0;
root.showBannerAd = function(pos,adunitid){
    if (typeof (qg) == "undefined") return;
    if (qg.getSystemInfoSync().platformVersion < 1051) return;
    var bannerNow = new Date().getTime();
    if(bannerNow - lastFetchBannerTime < 12000)return;
    if (bannerAd == null) {
        bannerAd = qg.createBannerAd({
            adUnitId: "f5d50f14738443e6a0167dc7ee55d747",
            style: {}
        });
        lastFetchBannerTime = new Date().getTime();
        bannerAd.onError(function s(res) {
            console.log("fetch banner error:" + res.errCode);
            console.log("fetch banner error:" + res.errMsg);
            setTimeout(function(){
                root.showBannerAd();
            },12000)
        });  
    }

    bannerAd.onLoad(function (res) {
        bannerAd.show();
        bannerAd.offLoad();
    })
}

root.hideBannerAd = function(){
        if(bannerAd!=null){
             bannerAd.hide();
        }
    }

 root.destroyBannerAd = function(){
        if(bannerAd!=null){
            bannerAd.destroy();
            bannerAd = null;
        }
    }

root.ShowBanner = function(){
        if(bannerAd!=null){
            bannerAd.show();
        }
    }

var interstitialAdTime = 0;
var interstitialAd = null;
root.showinterstitialAd = function () {
    if (typeof (qg) == "undefined") return;
    if (qg.getSystemInfoSync().platformVersion < 1051) return;
    if ((new Date().getTime() - interstitialAdTime) < 12000) return;
    
    interstitialAd = qg.createInterstitialAd({
        adUnitId: "b50cc423c69a474b8edda2bdfa02d2be"
    })
    interstitialAdTime = new Date().getTime();
    
    // 在适合的场景显示插屏广告
    if (interstitialAd) {
        interstitialAd.load();
        interstitialAd.onLoad(function () {
            root.hideBannerAd();
            interstitialAd.show().catch(function(err) {
                console.error(err)
            })
        })

        interstitialAd.onClose(function () {
            interstitialAd.destroy();
            interstitialAd.offClose();
            root.ShowBanner();
            setTimeout(function(){
                interstitialAd = null;
            },3000)
        })
    }
}


var nativeAd = null;
var  nativeCurrentAdList = null;
root.createNativeAd= function (cb) {
    if (typeof (qg) == "undefined") return;
    if (qg.getSystemInfoSync().platformVersionCode < 1053) {
        cb && cb(null);
        return ;
    }
    init();
    function init() {
        nativeAd = qg.createNativeAd({ adUnitId: "67cba06981f14c899cc9e6907a7b2e84" });
        load();
        nativeAd.onLoad(function (res) {
            console.log("原生广告加载完成", JSON.stringify(res));
            if (res && res.adList) {
                nativeCurrentAdList = res.adList.pop();
                reportAdShow()
                cb && cb(nativeCurrentAdList)
                //    
            }
        })
    }

    function load() {
        var adLoad = nativeAd.load()
        adLoad && adLoad.then(function() {
            return;
        }).catch(function(err) {
            cb && cb(null)
            console.log("加载失败", JSON.stringify(err));
        })
    }
    
    function reportAdShow() {
        nativeAd.reportAdShow({ adId: nativeCurrentAdList.adId.toString() });
    }
}


root.createNativeAdClick=function () {
    if(nativeAd == null)return;
    nativeAd.reportAdClick({ adId: nativeCurrentAdList.adId.toString() });
    nativeAd.offLoad();
}


root.showTips = function(txt){
    qg.showToast({
        message: txt
    })
}

root.vibrateLong = function(){
    if(Laya.Browser.onMiniGame){
        wx.vibrateLong({});
    }
}


root.init=function (f){
    console.log(2222222222)
    f();
    root.initAD();
}

return root;
})();
