(function () {
    function newFbAdWrapper (reward) {
        console.log("init_ad", reward)
        var obj = {}
        obj.loadAsync = function () {
            return new Promise(function (a) {
                a(obj)
            })
        };
        obj.showAsync = function () {
            return new Promise(function (a, b) {
                FB_CTX.pause();
                if (reward) {
                    var isRewardVideoReady = window.MiniGameAds && MiniGameAds.isRewardvideoReady();
                    if (isRewardVideoReady) {
                        MiniGameAds.showRewardedVideo().then(() => {
                            a(true);
                            FB_CTX.resume()
                            console.info("====> show RewardedVideo success");
                        }).catch(e => {
                            b(e);
                            FB_CTX.resume()
                            console.error("====> show RewardedVideo error: ", e);
                        });
                    } else {
                        b("not_ready")
                        FB_CTX.resume()
                    }
                } else {
                    window.MiniGameAds && MiniGameAds.showInterstitial().then(() => {
                        a(true);
                        FB_CTX.resume()
                    }).catch(() => {
                        a(false);
                        FB_CTX.resume()
                    })
                }
            });
        }
        return obj;
    }
    var FB_APP_SAVE_KEY = window._APP_SKEY_ || "fd" + location.pathname;
    var FB_INIT_OK = 0;
    var FB_CTX = { pause: function () { window.cc && cc.director.pause(); window.$CAPP && $CAPP.pause(); window.$BGM && ($BGM.volume = 0); }, resume: function () { window.cc && cc.director.resume(); window.$CAPP && $CAPP.resume(); window.$BGM && ($BGM.volume = 1); } };
    window.XFBI = {
        getSupportedAPIs: function () { return ["getInterstitialAdAsync", "getRewardedVideoAsync"] },
        getEntryPointData: function () {
            return {}
        },
        getPlatform: function () {
            return "h5"
        },
        getLocale: function () { return "en_US" },
        setLoadingProgress: function (n) {
            if (FB_INIT_OK)
                minigame.setLoadingProgress(n)
        },
        shareAsync: function () { return new Promise(a => { }) },
        initializeAsync: function () {
            // return new Promise(a => {
            //     a()
            // })
            var r = minigame.initializeAsync()
            r.then(function () {
                FB_INIT_OK = 1
                // 记录启动来源
                // @ts-ignore
                minigame.getEntryPointAsync().then(function (entry) {
                    console.info("Entry Point: ", entry);
                });
                // 记录会话类型
                // @ts-ignore
                const contextType = minigame.context.getType();
                console.info("Context Type: ", contextType);
            })
            return r;
        },
        logEvent: function () { },
        onPause: function (f) { FB_CTX.pause = f },
        onResume: function (f) { FB_CTX.resume = f },
        getInterstitialAdAsync: function () {
            return new Promise(a => {
                setTimeout(function () {
                    a(newFbAdWrapper(0))
                }, 0)
            })
        },
        getRewardedVideoAsync: function () {
            return new Promise(a => {
                a(newFbAdWrapper(1))
            })
        },
        loadBannerAdAsync: function () {
            return new Promise(a => {
            })
        },
        getLeaderboardAsync: function () {
            return new Promise(a => {
                a([])
            })
        },
        getEntryPointAsync: function () {
            return new Promise(a => {
                a({})
            })
        },
        setSessionData: function () { },
        switchGameAsync: function () {
            return new Promise(a => {
            })
        },
        canCreateShortcutAsync: function () {
            return new Promise(a => {
                a(false)
            })
        },
        startGameAsync: function () {
            // return new Promise(a => {
            //     a([])
            // })
            return minigame.startGameAsync()
        },
        context: {
            getType: function () {
                return ""
            },
            getID: function () {
                return 0
            },
            chooseAsync: function () {
                return new Promise(function (a) { })
            }
        },
        player: {
            getASIDAsync: function () {
                return new Promise(function (r) { })
            },
            getID: function () {
                return 0;
            },
            getName: function () {
                return ""
            },
            getPhoto: function () {
                return ""
            },
            getConnectedPlayersAsync: function () {
                return new Promise((a, b) => {
                    a([])
                })
            },
            setDataAsync: function (d) {
                return new Promise(a => {
                    localStorage.setItem(FB_APP_SAVE_KEY, JSON.stringify(d));
                    a()
                });
            },
            getDataAsync: function (d) {
                return new Promise(a => {
                    var es = localStorage.getItem(FB_APP_SAVE_KEY), eo;
                    try {
                        eo = JSON.parse(es);
                    } catch (e) {
                    }
                    if (!eo) eo = {};
                    a(eo);
                })
            },
            flushDataAsync: function () {

            },
            canSubscribeBotAsync: function () {
                return new Promise((a, b) => {
                    a(false)
                })
            },
        },
        payments: {
            onReady: function () { }
        }
    }
})()