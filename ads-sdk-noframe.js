window.ENF = {
    callback: null,
    failback: null
};

function addGa() {
    (function(i, s, o, g, r, a, m) {
        i['dataLayer'] = i['dataLayer'] || [];
        i[r] = i[r] || function() {
            i['dataLayer'].push(arguments);
        };
        a = s.createElement(o);
        m = s.head || s.getElementsByTagName("head")[0];
        a.async = 1;
        a.src = g;
        a.type = "text/javascript";
        m.appendChild(a);
    }
    )(window, document, 'script', 'https://www.googletagmanager.com/gtag/js?id=UA-263974657-1', 'gtag');
    gtag('js', new Date());
    gtag('config', 'UA-263974657-1');
}

function promptMessage(msg, duration) {
    var promptElem = document.getElementById("prompt-message");
    if (!promptElem) {
        promptElem = document.createElement("div");
        promptElem.style.cssText = "font-family:siyuan;max-width:80%;min-width:320px;padding:10px 10px 10px 10px;min-height:40px;color: rgb(255, 255, 255);line-height: 20px;text-align:center;border-radius: 4px;position: fixed;top: 40%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;";
        document.body.appendChild(promptElem);
    }
    promptElem.setAttribute('id', 'prompt-message');
    promptElem.innerHTML = msg;
    duration = isNaN(duration) ? 2000 : duration;
    promptElem.style.display = "inline";
    promptElem.style.opacity = "1";

    setTimeout(
        function () {
            var d = 0.5;
            promptElem.style.webkitTransition = "-webkit-transform " + d + "s ease-in, opacity " + d + "s ease-in";
            promptElem.style.opacity = "0";
            promptElem.style.display = "none";
        }.bind(this), duration
    );
}

function ENF_setLoadingProgress(i) {
    console.debug('setLoadingProgress:' + i + "%");
    // try{window.parent.postMessage("setLoadingProgress|"+i, "*");}catch(e){}
}


window.interstitialCallback = function interstitialCallback() {
    ENF_H5Sdk_athenaSend('imp_pause');
};

function MiniGame_showBanner() {
    console.log('show MiniGame banner ...');

    if (typeof minigame === 'undefined') {
        console.log('[MiniGame_showBanner] minigame is undefined');
        return;
    }

    if (typeof minigame !== 'undefined') {
        var isBannerReady = MiniGameAds.isBannerReady();
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
    else {
        // wait for another few seconds and retry
        setTimeout(function () {
            console.log('banner wait time up');
            MiniGame_showBanner();
        }, 3000);
    }
}

// 启动minigame sdk
function MiniGameSDK_start() {
    console.log('start MiniGameSDK ...');

    if (typeof minigame === 'undefined') {
        console.log('[MiniGameSDK_start] minigame is undefined');
        return;
    }
    
    // @ts-ignore
    if (typeof minigame !== 'undefined') {
        //@ts-ignore
        minigame.setLoadingProgress(100);
        //@ts-ignore
        minigame.startGameAsync().then(function () {
            console.log('[MiniGameSDK_start] startGameAsync succeeded');
            MiniGame_showBanner();
            // 加载IDE指定的场景，这⾥假定第⼀个场景名称是startScene
            // GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
         })
        .catch(function (e) {
            console.info("startGameAsync error: " + e);
        });
    }
}

function MiniGameSDK_init() {
    console.log('init MiniGame SDK ...');

    if (typeof minigame !== 'undefined') {
        //初始化 minigame sdk
        // @ts-ignore
        minigame.initializeAsync().then(function () {
            console.log("FB initializeAsync");
            MiniGameSDK_start();
        });
    }
}

function MiniGame_showInterstitial(callback, failback) {
    console.log('show MiniGame Interstitial ...');

    if (typeof minigame === 'undefined') {
        console.log('[MiniGame_showInterstitial] minigame is undefined');
        return;
    }

    let isInterstitialReady = MiniGameAds.isInterstitialReady();
    if (isInterstitialReady) {
        // @ts-ignore
        MiniGameAds.showInterstitial().then(() => {
            console.info("====> show interstitial success");
            // let callback = window.interstitialCallback;
            if (callback != null && typeof callback == "function") {
                callback();
                // window.interstitialCallback = null;
            }
        }).catch(e => {
            console.error("====> show interstitial error: " + e.message);
            if (failback != null && typeof failback == "function") {
                failback();
            }
        });
    } else {
        console.info("====> interstitial not ready");
        if (failback != null && typeof failback == "function") {
            failback();
        }
    }
}

function MiniGame_showReward() {
    console.log('show MiniGame Reward ...');

    if (typeof minigame === 'undefined') {
        console.log('[MiniGame_showReward] minigame is undefined');
        return;
    }

    let isRewardVideoReady = MiniGameAds.isRewardvideoReady();
    if (isRewardVideoReady) {
        // @ts-ignore
        MiniGameAds.showRewardedVideo().then(() => {
            console.info("====> show RewardedVideo success");
            let callback = window.ENF.callback;
            if (callback != null && typeof callback == "function") {
                callback();
                window.ENF.callback = null;
            }
        }).catch(e => {
            console.error("====> show RewardedVideo error: " + e.message);
            let failback = window.ENF.failback;
            if (failback == null || typeof failback != "function") {
                console.log("Failed to pass fail callback");
                return;
            }

            failback("Failed to load ads. Please wait for a while and try later.");

            window.ENF.failback = null;
        });
    } else {
        console.info("====> RewardedVideo not ready");
    }
}

var ENFGad = {
    adsManager: null,
    adsLoader: null,
    adDisplayContainer: null,
    videoContent: null,
    intervalTimer: null,
    adContainer: null,
    timeoutTimer: null,
    timeCounter: 15,
    adObject: null,
    iftickTimer: 0,
    mainContainer: null,
    startTime: new Date(),
    _adload: null,
    curTime: 0,
    banner_height: 0,
    start: function() {
        console.debug('start ... ');

        // ENFGad.showadsContainer();
        // ENFGad.videoContent = $("#videoElement").get(0);
        // ENFGad.adContainer = $("#adContainer");
        // ENFGad.adContainer.width($(window).width());
        // ENFGad.adContainer.height($(window).height());
        // ENFGad.adContainer.height($(window).height() - ENFGad.banner_height);
        
        ENFGad.showGame();

        $(window).bind("resize", ENFGad.correctPositions);
    },
    interstitial: function(callback, failback) {
        console.log("[ENFGad.interstitial] ...");
        MiniGame_showInterstitial(callback, failback);
        return ;
    },
    reward: function() {
        console.debug("reward ... ");
        MiniGame_showReward();
        
        $(window).bind("resize", ENFGad.correctPositions);
        return;
    },
    showGame: function() {
        //ENFGad.iftickTimer = 0;
        // $("#adsContainer").hide();
        // $("#mainContainer").hide();

        // HUHUAFG._cb && HUHUAFG._cb(true);
        // HUHUAFG._cb = null;
        //ENFGad.adloadStop();
    },

    correctPositions: function() {
        console.log("correctPositions..");
        if (ENFGad.adObject && ENFGad.adsManager) {
            if (ENFGad.adObject.isLinear()) {

                ENFGad.adContainer.height($(window).height());
                ENFGad.adsManager.resize($(window).width(), $(window).height(), google.ima.ViewMode.NORMAL);
                // ENFGad.adContainer.height($(window).height() - ENFGad.banner_height);
                // ENFGad.adsManager.resize($(window).width(), $(window).height() - ENFGad.banner_height, google.ima.ViewMode.NORMAL);
            } else {
                $("#adsContainer").css({
                    "margin-top": 0
                });
                $("#adsContainer").height($(window).height());
                ENFGad.adContainer.height($(window).height());

                // $("#adsContainer").height($(window).height() - ENFGad.banner_height);
                // ENFGad.adContainer.height($(window).height() - ENFGad.banner_height);
                ENFGad.adsManager.resize(ENFGad.adObject.getWidth(), ENFGad.adObject.getHeight(), google.ima.ViewMode.NORMAL);
                var PaddingLeft = ($(window).width() - ENFGad.adObject.getWidth()) / 2;
                if (PaddingLeft < 0)
                    PaddingLeft = 0;
                $("#adContainer").css({
                    "padding-left": PaddingLeft
                });
            }
        }
    },
    tickTimer: function () {
        if (ENFGad.iftickTimer == 1) {
            ENFGad.timeoutTimer = setTimeout(function () {
                ENFGad.timeCounter--;
                if (ENFGad.timeCounter == 0) {
                    ENFGad.showGame();
                    ENFGad.timeCounter = 15;
                    clearTimeout(ENFGad.timeoutTimer);
                } else {
                    ENFGad.tickTimer();
                }
            }, 1e3);
        } else {
            ENFGad.timeCounter = 15;
            clearTimeout(ENFGad.timeoutTimer);
        }
    },

    logPageClosedWhileAd: function () {},

    showadsContainer: function () {
        ENFGad.iftickTimer = 1;
        ENFGad.tickTimer();

        console.log(" showadsContainer: function () ");
        $("#adContainer").empty();
        // document.getElementById("adContainer").innerHTML += '<div  id="afgloading" >Loading...</div>';
        $("#adsContainer").show();
        //$("#mainContainer").show();
    }
};

function ENF_showInterstitialAd(callback, failback) {
    console.log("ENF_showInterstitialAd");
    ENFGad.interstitial(callback, failback);
}

function ENF_showRewardedVideoAd(callback, failback) {
    console.log("ENF_showRewardedVideoAd");

    window.ENF = {};
    window.ENF.callback = callback;
    window.ENF.failback = failback;

    ENFGad.reward();
}

function ENF_H5Sdk_show() {
    console.log("%c ENF_H5Sdk_show ...", 'background: #222; color: #bada55');
    window.postMessage("h5sdk_show", "*");
}

function ENF_H5Sdk_hide() {
    console.log("%c ENF_H5Sdk_hide ...", 'background: #222; color: #bada55');
    window.postMessage("h5sdk_hide", "*");
}

function ENF_H5Sdk_athenaSend(eventname, param1, param2) {
    console.log("%c ENF_H5Sdk_athenaSend ... eventname: " + eventname, 'background: #222; color: #bada55');
    let evtName = eventname || '';
    let p1 = param1 || '';
    let p2 = param2 || '';
    window.postMessage("h5sdk_athenaSend" + "|" + evtName + "|" + p1 + "|" + p2, "*");
}

window.onmessage = function (e) {
    var tempData = e.data + "";
    if (tempData == "close") {
        if (typeof window.ENF.callback == "function") {
            window.ENF.callback();
            window.ENF.callback = null;
        }
    } else if (tempData == "Error") {
        if (typeof window.ENF.failback == "function") {
            window.ENF.failback();
            window.ENF.failback = null;
        }
    }
};

$(document).ready(function() {
    const continueHtml = '<div id="continue" class="continue" onclick="onClickContinue()"><h2 class="continue_text">Click to Continue ...</h2></div>';
    $('body').append(continueHtml);
    $("#continue").hide();

    addGa();

    MiniGameSDK_init();
    ENFGad.start();

    $(window).trigger('resize');
});