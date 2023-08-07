var NewLogin = true;

function showInterstitialMini(func) {
    console.log("=========插屏========")
    let isInterstitialReady = MiniGameAds.isInterstitialReady();
    if (isInterstitialReady) {
        MiniGameAds.showInterstitial().then(() => {
            console.info("新接口播放插屏广告: 成功");
            func && func();
        }).catch(e => {
            console.error("新接口播放插屏广告: 失败，原因: " + e.message);
            func && func();
        });
    } else {
        func && func();
        console.info("插屏广告没有加载成功，无法播放");
    }
}

let suc = null;
function showVideoMini(func) {
    suc = func;
    let isRewardVideoReady = MiniGameAds.isRewardvideoReady();
    if (isRewardVideoReady) {
        MiniGameAds.showRewardedVideo().then(() => {
            suc && suc(!0);
            suc = null;
            console.info("新接口播放激励广告: 成功");
        }).catch(e => {
            suc && suc(!1);
            suc = null;
            console.error("新接口播放激励广告: 失败，原因: " + e.message);
        });
    } else {
        suc && suc(!1);
        suc = null;
        console.info("激励视频没有加载成功，无法播放");
    }
}

let isBannerReady = null;
function showBannerMini() {
    isBannerReady = MiniGameAds.isBannerReady();
    console.log("是否展示banner==>", isBannerReady)
    if (isBannerReady) {
        // @ts-ignore
        MiniGameAds.showBanner().then(() => {
            console.info("====> show banner success");
        }).catch(e => {
            console.error("====> show banner error: " + e.message);
        });
    } else {
        console.info("====> banner not ready");
    }
}

function hideBannerMini() {
    console.log("隐藏banner")
    MiniGameAds.hideBanner().then(() => {
        console.info("====> hide banner success");
    }).catch(e => {
        console.error("====> hide banner error: " + e.message);
    });
}