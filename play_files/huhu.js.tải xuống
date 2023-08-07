window.HUHU_showInterstitialAd = () => {
    console.log(66666666666,"showInterstitialAd");
    let isInterstitialReady = MiniGameAds.isInterstitialReady();
    if (isInterstitialReady){
        MiniGameAds.showInterstitial().then(()=>{
            console.info("====> show interstitial success");
        }).catch(e => {
            console.error("====> show interstitial error: " + e.message);
        });
    }else {
        console.info("====> interstitial not ready");
    }
};
window.HUHU_showRewardedVideoAd = (success, failure) => {
    console.log(66666666666,"showRewardedVideoAd");
    huhu_pause_game();
    let isRewardVideoReady = MiniGameAds.isRewardvideoReady();
    if (isRewardVideoReady){
        MiniGameAds.showRewardedVideo().then(()=>{
            console.info("====> show RewardedVideo success");
            success&&success();
            huhu_resume_game();
        }).catch(e => {
            console.error("====> show RewardedVideo error: " + e.message);
            huhu_resume_game();
        });
    }else {
        console.info("====> RewardedVideo not ready");
        huhu_resume_game();
    }
};
window.HUHU_showBannerAd = (success, failure) => {
    console.log(66666666666,"showBannerAd");
    let isBannerReady = MiniGameAds.isBannerReady();
    if (isBannerReady){
        MiniGameAds.showBanner().then(()=>{
            console.info("====> show banner success");
        }).catch(e => {
            console.error("====> show banner error: " + e.message);
            // window.HUHU_showBannerAd();
        });
    }else {
        console.info("====> banner not ready");
        // window.HUHU_showBannerAd();
    }
};
window.HUHU_HideBannerAd = (success, failure) => {
    console.log(66666666666,"HideBannerAd");
    MiniGameAds.hideBanner().then(()=>{
        console.info("====> hide banner success");
    }).catch(e => {
        console.error("====> hide banner error: " + e.message);
    });
};
function huhu_pause_game() {
    if (typeof (window.Laya) == "undefined")
    {
        if (typeof (window.GD_OPTIONS) != "undefined" && typeof (window.GD_OPTIONS.onEvent) != "undefined")
        {
            window.GD_OPTIONS.onEvent({name:"SDK_GAME_PAUSE"});
        }
        return;
    }
    _preMuted = Laya.SoundManager.muted;
    Laya.SoundManager.muted = true;
    Laya.stage.renderingEnabled=false;
    Laya.timer.pause();
    Laya.timer.scale=0;
}

function huhu_resume_game() {
    if (typeof (window.Laya) == "undefined")
    {
        if (typeof (window.GD_OPTIONS) != "undefined" && typeof (window.GD_OPTIONS.onEvent) != "undefined")
        {
            window.GD_OPTIONS.onEvent({name:"SDK_GAME_START"});
        }
        return;
    }
    Laya.SoundManager.muted = _preMuted;
    Laya.stage.renderingEnabled = true;
    Laya.timer.resume();
    Laya.timer.scale=1;
}