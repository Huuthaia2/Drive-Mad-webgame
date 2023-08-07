/* eslint-disable no-undef */
function load_AsyncScript(url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState === 'complete' || script.readyState === 'loaded') {
                callback();
            }
        }
    } else {
        script.onload = function () {
            callback();
        }
    }
    script.src = url;
    document.head.appendChild(script);
}
var toastTimer
window.adManager = {
    showPageBanner: function (index) {
        mh_ads_show_banner(index)
    },
    showNative: function (index) {
        mh_show_native(index)
    },
    showReward: function (success, fail) {
        console.log("showReward")
        MiniGameAnalytics.onGameEvent("showReward", "init");
        // @ts-ignore
        let isRewardVideoReady = MiniGameAds.isRewardvideoReady();
        if (isRewardVideoReady) {
            // @ts-ignore
            MiniGameAds.showRewardedVideo().then(() => {
                console.info("====> show RewardedVideo success");
                MiniGameAnalytics.onGameEvent("showReward", "success");
                typeof success == "function" && success()
            }).catch(e => {
                console.error("====> show RewardedVideo error: " + e.message);
                typeof fail == "function" && fail()
            });
        } else {
            console.info("====> RewardedVideo not ready");
            typeof fail == "function" && fail()
        }
       
    },
    showInterstitial: function (callback) {
        console.log("showInterstitial")
        MiniGameAnalytics.onGameEvent("showInterstitial", "init");
        let isInterstitialReady = MiniGameAds.isInterstitialReady();
        if (isInterstitialReady) {
            // @ts-ignore
            MiniGameAds.showInterstitial().then(() => {
                console.info("====> show interstitial success");
                MiniGameAnalytics.onGameEvent("showInterstitial", "success");
            }).catch(e => {
                console.error("====> show interstitial error: " + e.message);
            });
        } else {
            console.info("====> interstitial not ready");
        }
        typeof callback == "function" && callback()
    },
    showToast: function (msg, duration) {
        // 封装的弹窗
        clearTimeout(toastTimer);
        var ToastBox = document.getElementsByClassName('toastDiv-box')[0];
        if (ToastBox) document.body.removeChild(ToastBox);//防止重复弹出
        duration = isNaN(duration) ? 3000 : duration;
        var m = document.createElement('div');
        m.className = 'toastDiv-box';
        m.innerHTML = msg;
        m.style.cssText = "width: 70%;min-width: 150px;opacity: 0.7;height: auto;color: rgb(255, 255, 255);text-align: center;padding: 10px;border-radius: 5px;position: fixed;top: 40%;left: 15%;z-index: 999999;background: rgb(0, 0, 0);font-size: 14px;overflow: hidden;";
        document.body.appendChild(m);
        toastTimer = setTimeout(function () {
            var d = 0.5;
            m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
            m.style.opacity = '0';
            setTimeout(function () { document.body.removeChild(m); }, d * 1000);
        }, duration);
    }
}

function init_ad(callback) {
    if (window.getWebConfig.closeAds) {
        typeof callback === "function" && callback()
        return
    }
    load_AsyncScript("https://securepubads.g.doubleclick.net/tag/js/gpt.js", () => {
        typeof callback === "function" && callback()
    });
}
