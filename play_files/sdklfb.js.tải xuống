if(typeof sdk==="undefined")sdk={};

sdk.fb=(function(){
var root={};

root.setItem=function (name,v){
    var obj={};
    obj[name]=v;
  FBInstant.player.setDataAsync(obj).then(function(){
             });
    // Laya.LocalStorage.setItem(name,JSON.stringify(v));
}
root.getItem=function (name,f){
    FBInstant.player.getDataAsync([name]).then(function(d){
        f(d[name]);
    });
//    f( JSON.parse(Laya.LocalStorage.getItem(name)));
}

///广告
var ads=["449441776182255_464359211357178"];
var ad2="449441776182255_464359458023820";

var pAds=[];
var loaded=[];
var pad2;
var loaded2;


root.debug=function (msg){

}




var preloadedRewardedVideo = null;
var preloadedInterstitial = null;


root.preloadedRewardedVideo = function() {
    FBInstant.getRewardedVideoAsync(
        '164446458874264_179869710665272' // Your Ad Placement Id
    ).then(function(rewarded) {
    // Load the Ad asynchronously
        preloadedRewardedVideo = rewarded;
    return preloadedRewardedVideo.loadAsync();
    }).then(function() {
        console.log('Rewarded video preloaded');
    }).catch(function(err){
        console.error('Rewarded video failed to preload: ' + err.message);
    });
}

var showPos = 0;
root.showVideoAd=function (pos,adunitid){
    showPos = pos;
   if(typeof (FBInstant) == "undefined") {
        EventMgr.getInstance().event(EEvent.ShowAdCompleted,showPos);
        EventMgr.getInstance().event(EEvent.CloseShowAd,showPos);
        return;
   };
     var supportedAPIs = FBInstant.getSupportedAPIs();
        if (supportedAPIs.includes("getRewardedVideoAsync")) {
                preloadedRewardedVideo.showAsync().then(function() {
                // Perform post-ad success operation
                    EventMgr.getInstance().event(EEvent.ShowAdCompleted,showPos);
                    EventMgr.getInstance().event(EEvent.CloseShowAd,showPos);
                    console.log('Rewarded video watched successfully'); 
                    // setTimeout(()=>{
                    //     Laya.SoundManager.playMusic("sound/snow_bgm.mp3",0);
                    // },2000)
                    root.preloadedRewardedVideo();       
                }).catch(function(e) {
                    console.error(e.message);
                     root.preloadedRewardedVideo();  
                    EventMgr.getInstance().event(EEvent.CloseShowAd,showPos);
                    console.log("NO ads");
                });
        }else{
            console.log("NO ads");
        }
}

root.preloadedInterstitial = function() {
        FBInstant.getInterstitialAdAsync(
            '164446458874264_179870107331899' // Your Ad Placement Id
        ).then(function(interstitial) {
            // Load the Ad asynchronously
            preloadedInterstitial = interstitial;
            return preloadedInterstitial.loadAsync();
        }).then(function() {
            console.log('Interstitial preloaded');
        }).catch(function(err){
            console.error('Interstitial failed to preload: ' + err.message);
        });
	}

root.playInterstitial=function (){
   var supportedAPIs = FBInstant.getSupportedAPIs();
        if (supportedAPIs.includes("getInterstitialAdAsync")) {
                preloadedInterstitial.showAsync().then(function() {
                    // Perform post-ad success operation
                    console.log('Interstitial ad finished successfully');
                    root.preloadedInterstitial();        
                }).catch(function(e) {
                    root.preloadedInterstitial();   
                    console.error(e.message);
                });
        }    
}


root.getName=function(){
    return FBInstant.player.getName();
}
root.getPhoto=function(){
   return FBInstant.player.getPhoto();
}

root.switchGame=function (n){
    FBInstant.switchGameAsync("324885334739659",{from:"snow"}).then(function(){
         
    });
}


root.share=function(f){

    FBInstant.context.chooseAsync(
    ).then(function(){
        FBInstant.updateAsync({
            action:"CUSTOM",
            cta:"Play",
            image:img64,
            text:{
                default:"Come on,let`s have fun!",
                localizations:{
                    en_US:"Come on,let`s have fun!",
                    es_LA:"Come on,let`s have fun!"
                }
            },
            template:'play_turn',
            data:{type:"share2"},
            strategy:'IMMEDIATE',
            notification:'NO_PUSH'
        })
    }).then(function(e){
        root.logeEvent("shareToFriend");
        f();
           // root.debug(e);
        }).catch(function(e){
            // root.debug(e)
        });
}

//榜单相关
root.getFriendRankList=function (f){
    rank.getConnectedPlayerEntriesAsync(25,0).then(function(entries){
        var nEntries=[];
        for(var i=0;i<entries.length;i++){
            var e=entries[i];
            var n={};
            n.rank=e.getRank();
            n.score=e.getScore();
            n.info=JSON.parse(e.getExtraData());
            n.name=e.getPlayer().getName();
            n.photo=e.getPlayer().getPhoto();
            nEntries.push(n);
        };
        f(nEntries);
    });
}

root.getGlobalRankList=function (f,start,end){
    rank.getEntriesAsync(start?start:25,end?end:0).then(function(entries){
        var nEntries=[];
        for(var i=0;i<entries.length;i++){
            var e=entries[i];
            var n={};
            n.rank=e.getRank();
            n.score=e.getScore();
            n.info=JSON.parse(e.getExtraData());
            n.name=e.getPlayer().getName();
            n.photo=e.getPlayer().getPhoto();
            nEntries.push(n);
        };
        f(nEntries);
    });
}

root.setRank=function (obj){
//    rank.setScoreAsync(obj.score,JSON.stringify(obj.info)).then(
//         function(e){
//            if(obj.f){
//                obj.f(e.getRank());
//            }
//     });
    // if(obj)obj();
}

var rank=null;
root.initRank=function(f){
    // FBInstant.getLeaderboardAsync("rank2").then(function(leaderBoard){
    //     rank=leaderBoard;
    //     if(f)f();
    // });
     if(f)f();
}



//游戏进程相关

root.setLoadingProgress=function (n){
    FBInstant.setLoadingProgress(n);
}

function afterInit(f){
    if(FBInstant.getSupportedAPIs().indexOf("getRewardedVideoAsync")){
        root.preloadedRewardedVideo();
    }
    if(FBInstant.getSupportedAPIs().indexOf("getInterstitialAdAsync")){
        root.preloadedInterstitial();
    }
    User.init(f);
}


root.afterInit=function (f){
    FBInstant.startGameAsync().then(function(){
        afterInit(f);
    });
}


root.init=function (f){
    console.log(1)
   FBInstant.initializeAsync().then(function() {
        FBInstant.setLoadingProgress(10);
        f();
        console.log(2)
    });
}
root.logEvent=function (e){
    FBInstant.logEvent(e);
}

root.subscribe=function (){
    FBInstant.player.canSubscribeBotAsync().then(function (s){
        if(s){
            FBInstant.player.canSubscribeBotAsync().then().catch(function (e){
            
            }
            )
        }
    }
    )
}




return root;
})();
