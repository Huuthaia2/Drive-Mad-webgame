/**
 * Created by Administrator on 2021/9/1.
 */
window.uleeSDK = (function (exports) {
    'use strict';

    const FB_ADS = {
        INTERSTITIAL: "4864743603539728_5324943400853077",
        REWARDED_VIDEO: "4864743603539728_5324944030853014",
        BANNER: "4864743603539728_5324942390853178",
    }

    class SDK {
        constructor() {
            this.initData();
        }

        random(min, max) {
            return Math.floor(Math.random() * (max + 1 - min) + min)
        }

        initData() {
            let self = this;
            FBInstant.initializeAsync()
                .then(function () {
                    FBInstant.startGameAsync();
                    //fb初始化完毕
                    // self.readyVideo();
                    self.addBanner();
                    self.addInterstitial();
                    self.addRewardedVideo();
                    self.laod();
                });

        }


        //=================================平台接口==============================
        laod() {
            FBAdManager.loadAllAsync();
            console.log("==============>预加载广告")
        }

        //显示横幅广告  
        showAD() {
            this.showBanner();
        }

        addBanner() {
            FBAdManager.addBanner(FB_ADS.BANNER);
        }

        showBanner() {
            FBAdManager.showBannerAsync().then(() => {
                console.log("显示Banner广告: 成功");
            }).catch(e => {
                console.log("显示Banner广告: 失败，原因: " + e.message);
            });
        }

        hideBanner() {
            FBAdManager.hideBannerAsync().then(() => {
                console.log("隐藏Banner广告: 成功");
            }).catch(e => {
                console.log("隐藏Banner广告: 失败，原因: " + e.message);
            });
        }

        readyVideo() {
            try {
                FBInstant.getRewardedVideoAsync();
                AdInstance.loadAsync();
            } catch (err) {
                console.log("视频获取异常", err)
            }
        }

        //显示激励视频
        showVideoAD(success, fail) {
            this.showRewardVideo(success, fail);
        }

        addRewardedVideo() {
            try {
                let total = FBAdManager.addRewardedVideo(FB_ADS.REWARDED_VIDEO, 3);
                console.log("添加激励视频广告，总数: " + total);
            } catch (e) {
                console.log("添加激励视频广告，错误: " + e.message);
            }
        }

        isRewardVideoReady() {
            console.log("激励视频广告状态: " + FBAdManager.isRewardedVideoReady());
        }

        showRewardVideo(success, fail) {
            console.log("尝试播放激励视频广告");
            FBAdManager.showRewardedVideo().then((e) => {
                console.log("播放激励视频广告: 成功:", e);
                success && success(true);
            }).catch(e => {
                console.log("播放激励视频广告: 失败，原因: " + e.message);
                fail && fail();
            });
        }

        /**
         * 插屏广告
         */
        // showInterstitialAD(callback) {
        //     if (!window.wx || !wx.createInterstitialAd) {
        //         callback && callback();
        //         return;
        //     }
        //     if (this.interstitialAD) {
        //         this.interstitialAD.destroy();
        //         this.interstitialAD = null;
        //     }
        //     var interstitialAD = wx.createInterstitialAd({ adUnitId: this.interstitialId });
        //     this.interstitialAD = interstitialAD;
        //     this.interstitialAD.load();
        //     this.interstitialAD.onLoad(function () {
        //         this.interstitialAD.show();
        //     }.bind(this));
        //     this.interstitialAD.onClose(callback)
        //     this.interstitialAD.onError(function (err) {
        //         console.log("插屏广告:", err);
        //         callback && callback();
        //     });
        // }


        addInterstitial() {
            try {
                let total = FBAdManager.addInterstitial(FB_ADS.INTERSTITIAL, 3);
                console.log("添加插屏广告，总数: " + total);
            } catch (e) {
                console.log("添加插屏广告，错误: " + e.message);
            }
        }

        isInterstitialReady() {
            console.log("插屏广告状态: " + FBAdManager.isInterstitialAdReady());
        }

        showInterstitial() {
            console.log("尝试播放插屏广告");
            FBAdManager.showInterstitialAd().then(() => {
                console.log("播放插屏广告: 成功");
            }).catch(e => {
                console.log("播放插屏广告: 失败，原因: " + e.message);
            });
        }

    }

    exports.getIns = new SDK();
    return exports;
}({}));