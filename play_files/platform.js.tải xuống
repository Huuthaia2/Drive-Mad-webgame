var platform=(function(){
var sdkName="local";
var sdkName="fb";
var s=null;
var root={};
//游戏开始初始化

root.playVideo=function (f){
    if(s.playVideo)
    s.playVideo(f);
}

root.playInterstitial=function (f){
    if(s.playInterstitial)
    s.playInterstitial(f);
}

root.debug=function (s){
    // Main.ui.debug.text+=s;
}

root.switchGame=function (n){
    if(s.switchGame){
        s.switchGame(n);
    }
}
root.initRank=function (f){
    if(s.initRank){
        s.initRank(f);
    }
}

root.getFriendRankList=function (f){
    if(s.getFriendRankList){
        s.getFriendRankList(f);
    }
}
root.getGlobalRankList=function (f){
    if(s.getGlobalRankList){
        s.getGlobalRankList(f);
    }
}



root.setRank=function (r){
    if(s.setRank){
        s.setRank(r);
    }
}


root.share=function (f){
    if(s.share)
        s.share(f);
}

root.getPhoto=function (){
    // return "1.jpg";
    if(s.getPhoto){
        return s.getPhoto();
    }
}
root.getName=function (){
    if(s.getName){
        return s.getName();
    }
}

root.getLoginID=function (){
    if(s.getLoginID){
        return s.getLoginID();
    }
}

root.getBannerAd=function (){
    if(s.getBannerAd){
        return s.getBannerAd();
    }
}

root.showinterstitialAd=function(){
    if(s.showinterstitialAd){
        return s.showinterstitialAd();
    }
}

///

root.setLoadingProgress=function (n){
    s.setLoadingProgress(n);
}

root.setItem=function (n,d){
    s.setItem(n,d);
}
root.getItem=function (n,f){
    s.getItem(n,f);
}

root.createNativeAd=function(n){
   return s.createNativeAd(n)
}

root.createNativeAdClick = function(){
    s.createNativeAdClick();
}

root.init=function (f){
    s=sdk[sdkName];
    s.init(f);
}

root.afterInit=function (f){
    s.afterInit(f);
}

root.subscribe=function (){
    if(s.subscribe){
        s.subscribe();
    }
}


root.logEvent=function (e){
    if(s.logEvent){
        s.logEvent(e);
    }
}

root.showVideoAd = function(pos,id){
    if(s.showVideoAd){
        s.showVideoAd(pos,id);
    }
}

root.showBannerAd = function(pos,id){
    if(s.showBannerAd){
        s.showBannerAd(pos,id);
    }
}

root.hideBannerAd = function(){
    if(s.hideBannerAd){
        s.hideBannerAd();
    }
}

root.destroyBannerAd = function(){
    if(s.destroyBannerAd){
        s.destroyBannerAd();
    }
}


root.ShowBanner = function(){
    if(s.ShowBanner){
        s.ShowBanner();
    }
}

root.vibrateLong = function(){
    if(s.vibrateLong){
        s.vibrateLong();
    }
}



return root;
})();
