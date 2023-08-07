! function (e) {
    "function" == typeof define && define.amd ? define(e) : e()
}(function () {
    "use strict";

    function h(e, o, a, c) {
        return new (a = a || Promise)(function (r, t) {
            function s(e) {
                try {
                    n(c.next(e))
                } catch (e) {
                    t(e)
                }
            }

            function i(e) {
                try {
                    n(c.throw(e))
                } catch (e) {
                    t(e)
                }
            }

            function n(e) {
                var t;
                e.done ? r(e.value) : ((t = e.value) instanceof a ? t : new a(function (e) {
                    e(t)
                })).then(s, i)
            }
            n((c = c.apply(e, o || [])).next())
        })
    }
    var F, q, e = {
        OK: "OK",
        UNSUPPORTED_API: "UNSUPPORTED_API",
        TIMEOUT: "TIMEOUT",
        INVALID_PARAM: "INVALID_PARAM",
        NOT_READY: "NOT_READY",
        ADS_NO_FILL: "ADS_NO_FILL",
        AD_LOAD_FAILED: "AD_LOAD_FAILED",
        AD_DISMISSED: "AD_DISMISSED",
        AD_NOT_LOADED: "AD_NOT_LOADED",
        AD_ALREADY_LOADED: "AD_ALREADY_LOADED",
        AD_ALREADY_SHOWED: "AD_ALREADY_SHOWED"
    };
    const M = {
        CODE: e,
        OK: {
            code: e.OK,
            message: "Success"
        },
        TIMEOUT: {
            code: e.TIMEOUT,
            message: "timeout"
        },
        adLoadFail: {
            code: e.AD_LOAD_FAILED,
            message: "Ad load failed"
        },
        adDismissed: {
            code: e.AD_DISMISSED,
            message: "Ad dismissed"
        },
        adNotLoaded: {
            code: e.AD_NOT_LOADED,
            message: "Ad not loaded"
        },
        adAlreadyLoaded: {
            code: e.AD_ALREADY_LOADED,
            message: "Ad already loaded"
        },
        adAlreadyShowed: {
            code: e.AD_ALREADY_SHOWED,
            message: "Ad already showed"
        }
    };
    class t {
        constructor(e, t, r) {
            this.type = e, this.isOneWay = t, this._serviceHandler = r
        }
        onRequest(e) {
            return h(this, void 0, void 0, function* () {
                return this._serviceHandler ? this._serviceHandler(e) : Promise.resolve(i(e))
            })
        }
    }

    function L(e, t, r, s) {
        return {
            type: e.type + "_RESPONSE",
            requestType: e.type,
            requestId: e.requestId,
            code: t,
            message: r,
            payload: s
        }
    }

    function i(e, t) {
        return L(e, M.OK.code, M.OK.message, t)
    }

    function n(e, t, r, s) {
        return L(e, t, r, s)
    }
    class s extends t {
        static quickHandler(e) {
            e = i(e);
            return Promise.resolve(e)
        }
        static createQuickHandler(s) {
            return r => h(this, void 0, void 0, function* () {
                var e = i(r),
                    t = yield s(r.payload);
                return e.payload = t, Promise.resolve(e)
            })
        }
        static create(e, t, r) {
            return new s(e, t, r)
        }
        static createSimpleService(e, t = !1, r = s.quickHandler) {
            return s.create(e, t, r)
        }
        static createOneWayService(e, t) {
            return s.create(e, !0, t)
        }
    }
    class j {
        constructor(e) {
            this._window = e, this._messageDispatcher = this._onReceiveMessage.bind(this)
        }
        _onReceiveMessage(e) {
            try {
                var t = e.data;
                t && t.type && this.dispatch(t, e.source)
            } catch (e) {
                console.error("Error in receiveMessage: ", e)
            }
        }
        static postMessageTo(e, t, r = "*") {
            e.postMessage(t, r)
        }
        start() {
            this._window.addEventListener("message", this._messageDispatcher, !1)
        }
        stop() {
            this._window.removeEventListener("message", this._messageDispatcher, !1)
        }
    }

    function H(e, t, r) {
        return e && Object.prototype.hasOwnProperty.call(e, t) ? e[t] : r
    }
    class u {
        static getTimestamp() {
            return (new Date).getTime()
        }
        static getTimeBySecond() {
            return Math.floor((new Date).getTime() / 1e3)
        }
        static getDate() {
            return (new Date).toLocaleDateString()
        }
        static getTargetTimestamp(e = 0, t = 0, r = 0) {
            var s = new Date((new Date).toLocaleDateString()).getTime();
            return new Date(s + 1e3 * (3600 * e + 60 * t + r)).getTime()
        }
        static waitTime(t, r) {
            return new Promise(e => {
                setTimeout(() => {
                    r && r(), e()
                }, t)
            })
        }
    }
    const U = {
        preroll: "preroll",
        start: "start",
        pause: "pause",
        next: "next",
        browse: "browse",
        reward: "reward"
    },
        z = {
            notReady: "notReady",
            timeout: "timeout",
            error: "error",
            noAdPreloaded: "noAdPreloaded",
            frequencyCapped: "frequencyCapped",
            ignored: "ignored",
            other: "other",
            dismissed: "dismissed",
            viewed: "viewed"
        };
    let $ = !1,
        W = 0;
    const G = 5;
    let K;

    function Y() {
        return !!H(K, "ignorePreload", !1) || $
    }

    function V() {
        return W <= 0 ? 0 : W + G - Date.now()
    }

    function J(e) {
        return e === z.viewed || e === z.dismissed
    }

    function Q(e) {
        let t = "UNKNOWN_ERROR",
            r = t;
        return e && (e.breakStatus && (t = e.breakStatus), r = `${e.breakFormat}:${e.breakType}:${e.breakName} error, status: ` + e.breakStatus), X(t, r)
    }

    function X(e, t) {
        return {
            code: e,
            message: t
        }
    }

    function Z(e) {
        return e === U.preroll
    }

    function ee(e) {
        return e === U.reward
    }
    let te = !1;

    function re() {
        if (!te) {
            te = !0, console.info("===> checking Ads");
            try {
                adConfig({
                    onReady: () => {
                        console.info("===> Ads are ready"), $ = !0, te = !1
                    }
                })
            } catch (e) {
                console.debug("===> Check Ready, got error: ", e), console.info("===> Assume Ads ready"), $ = !0, te = !1
            }
        }
    }

    function se(s, i, n) {
        return null != n && n.onShow(), console.info("===> showAdSenseAsync called: ", s, i), ee(s) && H(K, "interstitial_for_rewarded", !1) && (s = U.next, console.debug("===> showAdSenseAsync, replace rewarded with interstitial [next]")), new Promise((t, r) => {
            if (!Z(s)) {
                if (!Y()) return void r(X("notLoaded", "ad not loaded"));
                if (!(V() <= 0)) return void r(X("notReady", "ad not ready, wait: " + (V() / 1e3).toFixed(2) + " seconds"))
            }
            var e = {
                type: s,
                name: i,
                adBreakDone: e => {
                    console.info("===> showAdSense:adBreakDone, type: " + s + ", name: " + i, e), J(e.breakStatus) ? (W = Date.now(), null != n && n.onClose(), $ = !1, setTimeout(() => {
                        re()
                    }, 100)) : null != n && n.onFail(), ee(s) ? e.breakStatus === z.viewed ? t() : r(Q(e)) : J(e.breakStatus) ? (null != n && n.onSuccess(), t()) : (r(Q(e)), null != n && n.onFail())
                }
            };
            Z(s) || (e.beforeAd = () => {
                console.info("===> showAdSense:beforeAd, type: " + s + ", name: " + i)
            }, e.afterAd = () => {
                console.info("===> showAdSense:afterAd, type: " + s + ", name: " + i)
            }), ee(s) && (e.beforeReward = e => {
                console.info("===> showAdSense:beforeReward, type: " + s + ", name: " + i), e(), null != n && n.onSuccess()
            }, e.adDismissed = () => {
                console.info("===> showAdSense:adDismissed, type: " + s + ", name: " + i), null != n && n.onFail()
            }, e.adViewed = () => {
                console.info("===> showAdSense:adViewed, type: " + s + ", name: " + i)
            }), console.info("===> showAdSense:tryShow, type: " + s + ", name: " + i), adBreak(e)
        })
    }
    let ie = !1;

    function ne() {
        const e = "reward",
            t = "reward";
        var r = {
            type: e,
            name: t,
            beforeAd: () => {
                console.info("===> showAdSense:beforeAd, type: reward, name: " + t)
            },
            afterAd: () => {
                console.info("===> showAdSense:afterAd, type: reward, name: " + t)
            },
            beforeReward: e => {
                console.info("===> showAdSense:beforeReward, type: reward, name: " + t)
            },
            adDismissed: () => {
                console.info("===> showAdSense:adDismissed, type: reward, name: " + t)
            },
            adViewed: () => {
                console.info("===> showAdSense:adViewed, type: reward, name: " + t)
            },
            adBreakDone: e => {
                console.info("===> showAdSense:adBreakDone, type: reward, name: " + t, e), ie || "notReady" === e.breakStatus && (ie = !0, u.waitTime(1e3, ne))
            }
        };
        adBreak(r)
    }
    class oe {
        constructor() {
            this._configUrl = "", this._gameId = "", this._appId = "", this._channel = "", this._channelName = "", this._minigameOption = null, this._playPageData = null, this._locationSearch = "", this._locationPathName = ""
        }
        get configUrl() {
            return this._configUrl
        }
        get gameId() {
            return this._gameId
        }
        get appId() {
            return this._appId
        }
        get channel() {
            return this._channel
        }
        get channelName() {
            return this._channelName
        }
        get minigameOption() {
            return this._minigameOption
        }
        get playPageData() {
            return this._playPageData
        }
        set playPageData(e) {
            this._playPageData = e
        }
        get locationSearch() {
            return this._locationSearch = window.location.search, this._locationSearch
        }
        static get instance() {
            return this._instance || (this._instance = new oe), this._instance
        }
        init(e) {
            this._channel = this.getSubChannelName(), this._channelName = this.getChannelName(), this._minigameOption = e, this._gameId = "" + e.game_id, this._appId = "" + e.app_id, this._locationSearch = window.location.search, this._locationPathName = window.location.pathname, window.commonInfo = oe
        }
        getChannelName() {
            return window.globalPlatformInfo.channelName || window.channelName || this._playPageData.channelName
        }
        getSubChannelName() {
            return window.globalPlatformInfo.subChannelName || window.subChannelName || this._playPageData.subChannelName
        }
        getChannelConfigId() {
            return this._playPageData.channelConfigId
        }
        getGameManifestJsonUrl() {
            return this._playPageData.gameManifestJsonUrl
        }
        isH5AndroidApp() {
            return this._minigameOption ? this._minigameOption.android ? this._minigameOption.android.enabled : (console.warn("minigame config has not android field!!!"), !1) : (console.warn("minigame config is not exist!!!"), !1)
        }
        isAdflyEnable() {
            return this._minigameOption ? this._minigameOption.cpl ? this._minigameOption.cpl.adflyer ? this._minigameOption.cpl.adflyer.enabled : (console.warn("cpl config has not adflyer field!!!"), !1) : (console.warn("minigame config has not cpl field!!!"), !1) : (console.warn("minigame config is not exist!!!"), !1)
        }
        getAdflyChannelID() {
            return this.isAdflyEnable() ? this._minigameOption.cpl.adflyer.channelId : ""
        }
        isSharpMatch() {
            var e = null == (e = this._minigameOption) ? void 0 : e.match;
            return !(null == e || !e.enabled) && "adfly" === e.platform
        }
    }
    oe._instance = null;
    const c = oe.instance;
    let ae = document;

    function ce(n, o = !1, a) {
        return h(this, void 0, void 0, function* () {
            return new Promise((e, t) => {
                const r = ae.createElement("script");
                if (r.src = n, r.async = o, a)
                    for (const i in a) r.setAttribute(i, a[i]);
                const s = () => {
                    r.removeEventListener("load", s), e()
                };
                r.addEventListener("load", s), r.addEventListener("error", e => {
                    console.error(e), t(new Error("Failed to load " + n))
                }), (ae.getElementsByTagName("head")[0] || document.documentElement).appendChild(r)
            })
        })
    }

    function de(e, t) {
        var r, s = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),
            i = [];
        let n;
        if (t = t || s.length, e)
            for (n = 0; n < e; n++) i[n] = s[0 | Math.random() * t];
        else
            for (i[8] = i[13] = i[18] = i[23] = "-", i[14] = "4", n = 0; n < 36; n++) i[n] || (r = 0 | 16 * Math.random(), i[n] = s[19 === n ? 3 & r | 8 : r]);
        return i.join("")
    }

    function le(e, t) {
        console.log("%c " + e, t || "")
    } (class un {
        constructor() {
            this._adsDataFile = ""
        }
        static createDefaultInstance() {
            return this._instance || (this._instance = new un), this._instance
        }
        static get instance() {
            return this._instance || (this._instance = new un), this._instance
        }
        get strategy() {
            return this._adsStrategyOption
        }
        get adsShowOption() {
            return this._adsShowOption
        }
        fetchConfigAsync(s) {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = s,
                        t = yield fetch(e);
                    if (404 === t.status) throw {
                        code: "No_Config_File",
                        message: "there is no config file " + e
                    };
                    var r = yield t.json();
                    return this._adsStrategyOption = r.ad_configs, console.info("fetchAdsStrategyConfig success: ", this._adsStrategyOption), Promise.resolve()
                } catch (e) {
                    return Promise.reject({
                        message: "fetchAdsConfig error: " + e.message
                    })
                }
            })
        }
        fetchAdsData(r) {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = !!(r && 0 < r.length),
                        t = (e || console.warn("fetchAdsData error: url is null"), this._adsDataFile = e ? r : "https://api.150ad.com/test/data.json", yield fetch(this._adsDataFile));
                    return this._adsShowOption = yield t.json(), console.info("fetchAdsData success: ", this._adsShowOption), Promise.resolve()
                } catch (e) {
                    return Promise.reject({
                        code: "No_Ads_Data",
                        message: "load ads data file: " + e.message
                    })
                }
            })
        }
        fetchShowConfigAsync(e) {
            return h(this, void 0, void 0, function* () {
                try {
                    if (!this._adsShowOption) {
                        let e = this._adsDataFile || "https://api.150ad.com/test/data.json";
                        window.MiniGameAds && window.MiniGameAds.isTest && (e = "https://api.150ad.com/test/data.json");
                        var t = yield fetch(e);
                        this._adsShowOption = yield t.json(), console.info("fetchAdsShowConfig success: ", this._adsShowOption)
                    }
                    return Promise.resolve(this._adsShowOption)
                } catch (e) {
                    throw console.error("fetchShowConfig error: ", e), {
                        code: "Fetch_Ads_Data_Error",
                        message: "data file was " + e.message
                    }
                }
            })
        }
        isPlatformOpen(t) {
            var e = this.strategy.platforms.find(e => e.id === t);
            return !!e && e.enabled
        }
    }).instance, (e = F = F || {}).json = "application/json", e.form = "application/x-www-form-urlencoded; charset=UTF-8", (e = q = q || {}).get = "GET", e.post = "POST";
    const he = new class {
        constructor() {
            this.handleUrl = e => t => {
                if (t) {
                    const r = [];
                    Object.keys(t).forEach(e => r.push(e + "=" + encodeURIComponent(t[e]))), -1 === e.search(/\?/) ? "object" == typeof t && (e += "?" + r.join("&")) : e += "&" + r.join("&")
                }
                return e
            }
        }
        getFetch(t, e, r) {
            return h(this, void 0, void 0, function* () {
                return r = {
                    method: q.get,
                    headers: {
                        "Content-Type": F.json
                    }
                }, yield fetch(this.handleUrl(t)(e), r).then(e => e.ok ? e.json() : Promise.reject("request failed with status " + e.status)).then(e => e).catch(e => Promise.reject(`get ${t} fail` + e.message))
            })
        }
        postFetch(r, s) {
            return h(this, void 0, void 0, function* () {
                const t = new FormData;
                Object.keys(s).forEach(e => t.append(e, s[e]));
                var e = new Headers,
                    e = (e.append("Content-Type", "application/json"), {
                        method: q.post,
                        headers: e,
                        body: JSON.stringify(s),
                        redirect: "follow"
                    });
                return yield fetch(r, e).then(e => e.ok ? e.json() : Promise.reject({
                    code: e.status,
                    message: `post ${r} fail status: ` + e.status
                })).then(e => (console.info(`post ${r} success response: ` + JSON.stringify(e)), e)).catch(e => Promise.reject({
                    code: "server error",
                    message: `post ${r} fail` + e.message
                }))
            })
        }
    };

    function ue(e, t) {
        return h(this, void 0, void 0, function* () {
            return he.postFetch(e, t)
        })
    }

    function me(t, r, s = 3) {
        return h(this, void 0, void 0, function* () {
            return s < 3 && (yield u.waitTime(1e3)), ue(t, r).then(e => Promise.resolve(e)).catch(e => 0 < s ? (console.error(`post ${t} retry ${s} times`), me(t, r, s - 1)) : Promise.reject({
                code: "fetch retry failed",
                message: `post ${t} fail` + e
            }))
        })
    }
    let ge = {};

    function pe(e, t) {
        if (null == e || "" === e.trim()) throw {
            code: M.CODE.INVALID_PARAM,
            message: "Invalid key: " + e
        };
        e = ge[e];
        return void 0 !== e ? e : t
    }

    function fe(e, t) {
        if (null == e || "" === e.trim()) throw {
            code: M.CODE.INVALID_PARAM,
            message: "Invalid key: " + e
        };
        ge[e] = t
    }

    function ye() {
        try {
            var e = JSON.stringify(ge);
            localStorage.setItem("_minigame_data_", e), localStorage.flush && localStorage.flush()
        } catch (e) {
            console.error("LocalCache.flush error: ", e)
        }
    }
    var ve = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {},
        we = {},
        e = {
            get exports() {
                return we
            },
            set exports(e) {
                we = e
            }
        };
    var Ae, _e = {},
        be = {
            get exports() {
                return _e
            },
            set exports(e) {
                _e = e
            }
        };

    function f() {
        return Ae || (Ae = 1, be.exports = function (d) {
            var s;
            if ("undefined" != typeof window && window.crypto && (s = window.crypto), "undefined" != typeof self && self.crypto && (s = self.crypto), !(s = !(s = !(s = "undefined" != typeof globalThis && globalThis.crypto ? globalThis.crypto : s) && "undefined" != typeof window && window.msCrypto ? window.msCrypto : s) && void 0 !== ve && ve.crypto ? ve.crypto : s)) try {
                s = require("crypto")
            } catch (e) { }
            var r = Object.create || function (e) {
                return t.prototype = e, e = new t, t.prototype = null, e
            };

            function t() { }
            var e = {},
                i = e.lib = {},
                n = i.Base = {
                    extend: function (e) {
                        var t = r(this);
                        return e && t.mixIn(e), t.hasOwnProperty("init") && this.init !== t.init || (t.init = function () {
                            t.$super.init.apply(this, arguments)
                        }), (t.init.prototype = t).$super = this, t
                    },
                    create: function () {
                        var e = this.extend();
                        return e.init.apply(e, arguments), e
                    },
                    init: function () { },
                    mixIn: function (e) {
                        for (var t in e) e.hasOwnProperty(t) && (this[t] = e[t]);
                        e.hasOwnProperty("toString") && (this.toString = e.toString)
                    },
                    clone: function () {
                        return this.init.prototype.extend(this)
                    }
                },
                l = i.WordArray = n.extend({
                    init: function (e, t) {
                        e = this.words = e || [], this.sigBytes = null != t ? t : 4 * e.length
                    },
                    toString: function (e) {
                        return (e || a).stringify(this)
                    },
                    concat: function (e) {
                        var t = this.words,
                            r = e.words,
                            s = this.sigBytes,
                            i = e.sigBytes;
                        if (this.clamp(), s % 4)
                            for (var n = 0; n < i; n++) {
                                var o = r[n >>> 2] >>> 24 - n % 4 * 8 & 255;
                                t[s + n >>> 2] |= o << 24 - (s + n) % 4 * 8
                            } else
                            for (var a = 0; a < i; a += 4) t[s + a >>> 2] = r[a >>> 2];
                        return this.sigBytes += i, this
                    },
                    clamp: function () {
                        var e = this.words,
                            t = this.sigBytes;
                        e[t >>> 2] &= 4294967295 << 32 - t % 4 * 8, e.length = d.ceil(t / 4)
                    },
                    clone: function () {
                        var e = n.clone.call(this);
                        return e.words = this.words.slice(0), e
                    },
                    random: function (e) {
                        for (var t = [], r = 0; r < e; r += 4) t.push(function () {
                            if (s) {
                                if ("function" == typeof s.getRandomValues) try {
                                    return s.getRandomValues(new Uint32Array(1))[0]
                                } catch (e) { }
                                if ("function" == typeof s.randomBytes) try {
                                    return s.randomBytes(4).readInt32LE()
                                } catch (e) { }
                            }
                            throw new Error("Native crypto module could not be used to get secure random number.")
                        }());
                        return new l.init(t, e)
                    }
                }),
                o = e.enc = {},
                a = o.Hex = {
                    stringify: function (e) {
                        for (var t = e.words, r = e.sigBytes, s = [], i = 0; i < r; i++) {
                            var n = t[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                            s.push((n >>> 4).toString(16)), s.push((15 & n).toString(16))
                        }
                        return s.join("")
                    },
                    parse: function (e) {
                        for (var t = e.length, r = [], s = 0; s < t; s += 2) r[s >>> 3] |= parseInt(e.substr(s, 2), 16) << 24 - s % 8 * 4;
                        return new l.init(r, t / 2)
                    }
                },
                c = o.Latin1 = {
                    stringify: function (e) {
                        for (var t = e.words, r = e.sigBytes, s = [], i = 0; i < r; i++) {
                            var n = t[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                            s.push(String.fromCharCode(n))
                        }
                        return s.join("")
                    },
                    parse: function (e) {
                        for (var t = e.length, r = [], s = 0; s < t; s++) r[s >>> 2] |= (255 & e.charCodeAt(s)) << 24 - s % 4 * 8;
                        return new l.init(r, t)
                    }
                },
                h = o.Utf8 = {
                    stringify: function (e) {
                        try {
                            return decodeURIComponent(escape(c.stringify(e)))
                        } catch (e) {
                            throw new Error("Malformed UTF-8 data")
                        }
                    },
                    parse: function (e) {
                        return c.parse(unescape(encodeURIComponent(e)))
                    }
                },
                u = i.BufferedBlockAlgorithm = n.extend({
                    reset: function () {
                        this._data = new l.init, this._nDataBytes = 0
                    },
                    _append: function (e) {
                        "string" == typeof e && (e = h.parse(e)), this._data.concat(e), this._nDataBytes += e.sigBytes
                    },
                    _process: function (e) {
                        var t, r = this._data,
                            s = r.words,
                            i = r.sigBytes,
                            n = this.blockSize,
                            o = i / (4 * n),
                            a = (o = e ? d.ceil(o) : d.max((0 | o) - this._minBufferSize, 0)) * n,
                            e = d.min(4 * a, i);
                        if (a) {
                            for (var c = 0; c < a; c += n) this._doProcessBlock(s, c);
                            t = s.splice(0, a), r.sigBytes -= e
                        }
                        return new l.init(t, e)
                    },
                    clone: function () {
                        var e = n.clone.call(this);
                        return e._data = this._data.clone(), e
                    },
                    _minBufferSize: 0
                }),
                m = (i.Hasher = u.extend({
                    cfg: n.extend(),
                    init: function (e) {
                        this.cfg = this.cfg.extend(e), this.reset()
                    },
                    reset: function () {
                        u.reset.call(this), this._doReset()
                    },
                    update: function (e) {
                        return this._append(e), this._process(), this
                    },
                    finalize: function (e) {
                        return e && this._append(e), this._doFinalize()
                    },
                    blockSize: 16,
                    _createHelper: function (r) {
                        return function (e, t) {
                            return new r.init(t).finalize(e)
                        }
                    },
                    _createHmacHelper: function (r) {
                        return function (e, t) {
                            return new m.HMAC.init(r, t).finalize(e)
                        }
                    }
                }), e.algo = {});
            return e
        }(Math)), _e
    }
    var Se, xe = {},
        Te = {
            get exports() {
                return xe
            },
            set exports(e) {
                xe = e
            }
        };

    function Pe() {
        var e, t, i, n, r;
        return Se || (Se = 1, Te.exports = (e = f(), r = (t = e).lib, i = r.Base, n = r.WordArray, (r = t.x64 = {}).Word = i.extend({
            init: function (e, t) {
                this.high = e, this.low = t
            }
        }), r.WordArray = i.extend({
            init: function (e, t) {
                e = this.words = e || [], this.sigBytes = null != t ? t : 8 * e.length
            },
            toX32: function () {
                for (var e = this.words, t = e.length, r = [], s = 0; s < t; s++) {
                    var i = e[s];
                    r.push(i.high), r.push(i.low)
                }
                return n.create(r, this.sigBytes)
            },
            clone: function () {
                for (var e = i.clone.call(this), t = e.words = this.words.slice(0), r = t.length, s = 0; s < r; s++) t[s] = t[s].clone();
                return e
            }
        }), e)), xe
    }
    var Re, Ce = {},
        ke = {
            get exports() {
                return Ce
            },
            set exports(e) {
                Ce = e
            }
        };

    function Ie() {
        var t;
        return Re || (Re = 1, ke.exports = (t = f(), function () {
            var e, i;
            "function" == typeof ArrayBuffer && (e = t.lib.WordArray, i = e.init, (e.init = function (e) {
                if ((e = (e = e instanceof ArrayBuffer ? new Uint8Array(e) : e) instanceof Int8Array || "undefined" != typeof Uint8ClampedArray && e instanceof Uint8ClampedArray || e instanceof Int16Array || e instanceof Uint16Array || e instanceof Int32Array || e instanceof Uint32Array || e instanceof Float32Array || e instanceof Float64Array ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : e) instanceof Uint8Array) {
                    for (var t = e.byteLength, r = [], s = 0; s < t; s++) r[s >>> 2] |= e[s] << 24 - s % 4 * 8;
                    i.call(this, r, t)
                } else i.apply(this, arguments)
            }).prototype = e)
        }(), t.lib.WordArray)), Ce
    }
    var Ee, Be = {},
        De = {
            get exports() {
                return Be
            },
            set exports(e) {
                Be = e
            }
        };

    function Ne() {
        var e, i, t;
        return Ee || (Ee = 1, De.exports = (e = f(), i = e.lib.WordArray, (t = e.enc).Utf16 = t.Utf16BE = {
            stringify: function (e) {
                for (var t = e.words, r = e.sigBytes, s = [], i = 0; i < r; i += 2) {
                    var n = t[i >>> 2] >>> 16 - i % 4 * 8 & 65535;
                    s.push(String.fromCharCode(n))
                }
                return s.join("")
            },
            parse: function (e) {
                for (var t = e.length, r = [], s = 0; s < t; s++) r[s >>> 1] |= e.charCodeAt(s) << 16 - s % 2 * 16;
                return i.create(r, 2 * t)
            }
        }, t.Utf16LE = {
            stringify: function (e) {
                for (var t = e.words, r = e.sigBytes, s = [], i = 0; i < r; i += 2) {
                    var n = o(t[i >>> 2] >>> 16 - i % 4 * 8 & 65535);
                    s.push(String.fromCharCode(n))
                }
                return s.join("")
            },
            parse: function (e) {
                for (var t = e.length, r = [], s = 0; s < t; s++) r[s >>> 1] |= o(e.charCodeAt(s) << 16 - s % 2 * 16);
                return i.create(r, 2 * t)
            }
        }, e.enc.Utf16)), Be;

        function o(e) {
            return e << 8 & 4278255360 | e >>> 8 & 16711935
        }
    }
    var Oe, Fe = {},
        qe = {
            get exports() {
                return Fe
            },
            set exports(e) {
                Fe = e
            }
        };

    function Me() {
        var e, c;
        return Oe || (Oe = 1, qe.exports = (e = f(), c = e.lib.WordArray, e.enc.Base64 = {
            stringify: function (e) {
                for (var t = e.words, r = e.sigBytes, s = this._map, i = (e.clamp(), []), n = 0; n < r; n += 3)
                    for (var o = (t[n >>> 2] >>> 24 - n % 4 * 8 & 255) << 16 | (t[n + 1 >>> 2] >>> 24 - (n + 1) % 4 * 8 & 255) << 8 | t[n + 2 >>> 2] >>> 24 - (n + 2) % 4 * 8 & 255, a = 0; a < 4 && n + .75 * a < r; a++) i.push(s.charAt(o >>> 6 * (3 - a) & 63));
                var c = s.charAt(64);
                if (c)
                    for (; i.length % 4;) i.push(c);
                return i.join("")
            },
            parse: function (e) {
                var t = e.length,
                    r = this._map;
                if (!(s = this._reverseMap))
                    for (var s = this._reverseMap = [], i = 0; i < r.length; i++) s[r.charCodeAt(i)] = i;
                var n = r.charAt(64);
                return n && -1 !== (n = e.indexOf(n)) && (t = n), o(e, t, s)
            },
            _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        }, e.enc.Base64)), Fe;

        function o(e, t, r) {
            for (var s, i, n = [], o = 0, a = 0; a < t; a++) a % 4 && (s = r[e.charCodeAt(a - 1)] << a % 4 * 2, i = r[e.charCodeAt(a)] >>> 6 - a % 4 * 2, n[o >>> 2] |= (s | i) << 24 - o % 4 * 8, o++);
            return c.create(n, o)
        }
    }
    var Le = {},
        je = {
            get exports() {
                return Le
            },
            set exports(e) {
                Le = e
            }
        };
    var He, Ue = {},
        ze = {
            get exports() {
                return Ue
            },
            set exports(e) {
                Ue = e
            }
        };

    function $e() {
        return He || (He = 1, ze.exports = function (e) {
            for (var l = Math, t = e, r = t.lib, s = r.WordArray, i = r.Hasher, n = t.algo, P = [], o = 0; o < 64; o++) P[o] = l.abs(l.sin(o + 1)) * 4294967296 | 0;
            var a = n.MD5 = i.extend({
                _doReset: function () {
                    this._hash = new s.init([1732584193, 4023233417, 2562383102, 271733878])
                },
                _doProcessBlock: function (e, t) {
                    for (var r = 0; r < 16; r++) {
                        var s = t + r;
                        var i = e[s];
                        e[s] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360
                    }
                    var n = this._hash.words;
                    var o = e[t + 0];
                    var a = e[t + 1];
                    var c = e[t + 2];
                    var d = e[t + 3];
                    var l = e[t + 4];
                    var h = e[t + 5];
                    var u = e[t + 6];
                    var m = e[t + 7];
                    var g = e[t + 8];
                    var p = e[t + 9];
                    var f = e[t + 10];
                    var y = e[t + 11];
                    var v = e[t + 12];
                    var w = e[t + 13];
                    var A = e[t + 14];
                    var _ = e[t + 15];
                    var b = n[0];
                    var S = n[1];
                    var x = n[2];
                    var T = n[3];
                    b = R(b, S, x, T, o, 7, P[0]);
                    T = R(T, b, S, x, a, 12, P[1]);
                    x = R(x, T, b, S, c, 17, P[2]);
                    S = R(S, x, T, b, d, 22, P[3]);
                    b = R(b, S, x, T, l, 7, P[4]);
                    T = R(T, b, S, x, h, 12, P[5]);
                    x = R(x, T, b, S, u, 17, P[6]);
                    S = R(S, x, T, b, m, 22, P[7]);
                    b = R(b, S, x, T, g, 7, P[8]);
                    T = R(T, b, S, x, p, 12, P[9]);
                    x = R(x, T, b, S, f, 17, P[10]);
                    S = R(S, x, T, b, y, 22, P[11]);
                    b = R(b, S, x, T, v, 7, P[12]);
                    T = R(T, b, S, x, w, 12, P[13]);
                    x = R(x, T, b, S, A, 17, P[14]);
                    S = R(S, x, T, b, _, 22, P[15]);
                    b = C(b, S, x, T, a, 5, P[16]);
                    T = C(T, b, S, x, u, 9, P[17]);
                    x = C(x, T, b, S, y, 14, P[18]);
                    S = C(S, x, T, b, o, 20, P[19]);
                    b = C(b, S, x, T, h, 5, P[20]);
                    T = C(T, b, S, x, f, 9, P[21]);
                    x = C(x, T, b, S, _, 14, P[22]);
                    S = C(S, x, T, b, l, 20, P[23]);
                    b = C(b, S, x, T, p, 5, P[24]);
                    T = C(T, b, S, x, A, 9, P[25]);
                    x = C(x, T, b, S, d, 14, P[26]);
                    S = C(S, x, T, b, g, 20, P[27]);
                    b = C(b, S, x, T, w, 5, P[28]);
                    T = C(T, b, S, x, c, 9, P[29]);
                    x = C(x, T, b, S, m, 14, P[30]);
                    S = C(S, x, T, b, v, 20, P[31]);
                    b = k(b, S, x, T, h, 4, P[32]);
                    T = k(T, b, S, x, g, 11, P[33]);
                    x = k(x, T, b, S, y, 16, P[34]);
                    S = k(S, x, T, b, A, 23, P[35]);
                    b = k(b, S, x, T, a, 4, P[36]);
                    T = k(T, b, S, x, l, 11, P[37]);
                    x = k(x, T, b, S, m, 16, P[38]);
                    S = k(S, x, T, b, f, 23, P[39]);
                    b = k(b, S, x, T, w, 4, P[40]);
                    T = k(T, b, S, x, o, 11, P[41]);
                    x = k(x, T, b, S, d, 16, P[42]);
                    S = k(S, x, T, b, u, 23, P[43]);
                    b = k(b, S, x, T, p, 4, P[44]);
                    T = k(T, b, S, x, v, 11, P[45]);
                    x = k(x, T, b, S, _, 16, P[46]);
                    S = k(S, x, T, b, c, 23, P[47]);
                    b = I(b, S, x, T, o, 6, P[48]);
                    T = I(T, b, S, x, m, 10, P[49]);
                    x = I(x, T, b, S, A, 15, P[50]);
                    S = I(S, x, T, b, h, 21, P[51]);
                    b = I(b, S, x, T, v, 6, P[52]);
                    T = I(T, b, S, x, d, 10, P[53]);
                    x = I(x, T, b, S, f, 15, P[54]);
                    S = I(S, x, T, b, a, 21, P[55]);
                    b = I(b, S, x, T, g, 6, P[56]);
                    T = I(T, b, S, x, _, 10, P[57]);
                    x = I(x, T, b, S, u, 15, P[58]);
                    S = I(S, x, T, b, w, 21, P[59]);
                    b = I(b, S, x, T, l, 6, P[60]);
                    T = I(T, b, S, x, y, 10, P[61]);
                    x = I(x, T, b, S, c, 15, P[62]);
                    S = I(S, x, T, b, p, 21, P[63]);
                    n[0] = n[0] + b | 0;
                    n[1] = n[1] + S | 0;
                    n[2] = n[2] + x | 0;
                    n[3] = n[3] + T | 0
                },
                _doFinalize: function () {
                    var e = this._data;
                    var t = e.words;
                    var r = this._nDataBytes * 8;
                    var s = e.sigBytes * 8;
                    t[s >>> 5] |= 128 << 24 - s % 32;
                    var i = l.floor(r / 4294967296);
                    var n = r;
                    t[(s + 64 >>> 9 << 4) + 15] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360;
                    t[(s + 64 >>> 9 << 4) + 14] = (n << 8 | n >>> 24) & 16711935 | (n << 24 | n >>> 8) & 4278255360;
                    e.sigBytes = (t.length + 1) * 4;
                    this._process();
                    var o = this._hash;
                    var a = o.words;
                    for (var c = 0; c < 4; c++) {
                        var d = a[c];
                        a[c] = (d << 8 | d >>> 24) & 16711935 | (d << 24 | d >>> 8) & 4278255360
                    }
                    return o
                },
                clone: function () {
                    var e = i.clone.call(this);
                    e._hash = this._hash.clone();
                    return e
                }
            });

            function R(e, t, r, s, i, n, o) {
                var a = e + (t & r | ~t & s) + i + o;
                return (a << n | a >>> 32 - n) + t
            }

            function C(e, t, r, s, i, n, o) {
                var a = e + (t & s | r & ~s) + i + o;
                return (a << n | a >>> 32 - n) + t
            }

            function k(e, t, r, s, i, n, o) {
                var a = e + (t ^ r ^ s) + i + o;
                return (a << n | a >>> 32 - n) + t
            }

            function I(e, t, r, s, i, n, o) {
                var a = e + (r ^ (t | ~s)) + i + o;
                return (a << n | a >>> 32 - n) + t
            }
            return t.MD5 = i._createHelper(a), t.HmacMD5 = i._createHmacHelper(a), e.MD5
        }(f())), Ue
    }
    var We, Ge = {},
        Ke = {
            get exports() {
                return Ge
            },
            set exports(e) {
                Ge = e
            }
        };

    function Ye() {
        var e, t, r, s, l, i;
        return We || (We = 1, Ke.exports = (e = f(), i = (t = e).lib, r = i.WordArray, s = i.Hasher, i = t.algo, l = [], i = i.SHA1 = s.extend({
            _doReset: function () {
                this._hash = new r.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
            },
            _doProcessBlock: function (e, t) {
                for (var r = this._hash.words, s = r[0], i = r[1], n = r[2], o = r[3], a = r[4], c = 0; c < 80; c++) {
                    c < 16 ? l[c] = 0 | e[t + c] : (d = l[c - 3] ^ l[c - 8] ^ l[c - 14] ^ l[c - 16], l[c] = d << 1 | d >>> 31);
                    var d = (s << 5 | s >>> 27) + a + l[c];
                    d += c < 20 ? 1518500249 + (i & n | ~i & o) : c < 40 ? 1859775393 + (i ^ n ^ o) : c < 60 ? (i & n | i & o | n & o) - 1894007588 : (i ^ n ^ o) - 899497514, a = o, o = n, n = i << 30 | i >>> 2, i = s, s = d
                }
                r[0] = r[0] + s | 0, r[1] = r[1] + i | 0, r[2] = r[2] + n | 0, r[3] = r[3] + o | 0, r[4] = r[4] + a | 0
            },
            _doFinalize: function () {
                var e = this._data,
                    t = e.words,
                    r = 8 * this._nDataBytes,
                    s = 8 * e.sigBytes;
                return t[s >>> 5] |= 128 << 24 - s % 32, t[14 + (64 + s >>> 9 << 4)] = Math.floor(r / 4294967296), t[15 + (64 + s >>> 9 << 4)] = r, e.sigBytes = 4 * t.length, this._process(), this._hash
            },
            clone: function () {
                var e = s.clone.call(this);
                return e._hash = this._hash.clone(), e
            }
        }), t.SHA1 = s._createHelper(i), t.HmacSHA1 = s._createHmacHelper(i), e.SHA1)), Ge
    }
    var Ve, Je = {},
        Qe = {
            get exports() {
                return Je
            },
            set exports(e) {
                Je = e
            }
        };

    function Xe() {
        return Ve || (Ve = 1, Qe.exports = function (e) {
            var i = Math,
                t = e,
                r = t.lib,
                s = r.WordArray,
                n = r.Hasher,
                o = t.algo,
                a = [],
                b = [];

            function c(e) {
                var t = i.sqrt(e);
                for (var r = 2; r <= t; r++)
                    if (!(e % r)) return false;
                return true
            }

            function d(e) {
                return (e - (e | 0)) * 4294967296 | 0
            }
            var l = 2,
                h = 0;
            while (h < 64) {
                if (c(l)) {
                    if (h < 8) a[h] = d(i.pow(l, 1 / 2));
                    b[h] = d(i.pow(l, 1 / 3));
                    h++
                }
                l++
            }
            var S = [],
                u = o.SHA256 = n.extend({
                    _doReset: function () {
                        this._hash = new s.init(a.slice(0))
                    },
                    _doProcessBlock: function (e, t) {
                        var r = this._hash.words;
                        var s = r[0];
                        var i = r[1];
                        var n = r[2];
                        var o = r[3];
                        var a = r[4];
                        var c = r[5];
                        var d = r[6];
                        var l = r[7];
                        for (var h = 0; h < 64; h++) {
                            if (h < 16) S[h] = e[t + h] | 0;
                            else {
                                var u = S[h - 15];
                                var m = (u << 25 | u >>> 7) ^ (u << 14 | u >>> 18) ^ u >>> 3;
                                var g = S[h - 2];
                                var p = (g << 15 | g >>> 17) ^ (g << 13 | g >>> 19) ^ g >>> 10;
                                S[h] = m + S[h - 7] + p + S[h - 16]
                            }
                            var f = a & c ^ ~a & d;
                            var y = s & i ^ s & n ^ i & n;
                            var v = (s << 30 | s >>> 2) ^ (s << 19 | s >>> 13) ^ (s << 10 | s >>> 22);
                            var w = (a << 26 | a >>> 6) ^ (a << 21 | a >>> 11) ^ (a << 7 | a >>> 25);
                            var A = l + w + f + b[h] + S[h];
                            var _ = v + y;
                            l = d;
                            d = c;
                            c = a;
                            a = o + A | 0;
                            o = n;
                            n = i;
                            i = s;
                            s = A + _ | 0
                        }
                        r[0] = r[0] + s | 0;
                        r[1] = r[1] + i | 0;
                        r[2] = r[2] + n | 0;
                        r[3] = r[3] + o | 0;
                        r[4] = r[4] + a | 0;
                        r[5] = r[5] + c | 0;
                        r[6] = r[6] + d | 0;
                        r[7] = r[7] + l | 0
                    },
                    _doFinalize: function () {
                        var e = this._data;
                        var t = e.words;
                        var r = this._nDataBytes * 8;
                        var s = e.sigBytes * 8;
                        t[s >>> 5] |= 128 << 24 - s % 32;
                        t[(s + 64 >>> 9 << 4) + 14] = i.floor(r / 4294967296);
                        t[(s + 64 >>> 9 << 4) + 15] = r;
                        e.sigBytes = t.length * 4;
                        this._process();
                        return this._hash
                    },
                    clone: function () {
                        var e = n.clone.call(this);
                        e._hash = this._hash.clone();
                        return e
                    }
                });
            return t.SHA256 = n._createHelper(u), t.HmacSHA256 = n._createHmacHelper(u), e.SHA256
        }(f())), Je
    }
    var Ze = {},
        et = {
            get exports() {
                return Ze
            },
            set exports(e) {
                Ze = e
            }
        };
    var tt, rt = {},
        st = {
            get exports() {
                return rt
            },
            set exports(e) {
                rt = e
            }
        };

    function it() {
        return tt || (tt = 1, st.exports = function (e) {
            var t = e,
                r, s = t.lib.Hasher,
                i = t.x64,
                n = i.Word,
                o = i.WordArray,
                a = t.algo;

            function c() {
                return n.create.apply(n, arguments)
            }
            for (var xe = [c(1116352408, 3609767458), c(1899447441, 602891725), c(3049323471, 3964484399), c(3921009573, 2173295548), c(961987163, 4081628472), c(1508970993, 3053834265), c(2453635748, 2937671579), c(2870763221, 3664609560), c(3624381080, 2734883394), c(310598401, 1164996542), c(607225278, 1323610764), c(1426881987, 3590304994), c(1925078388, 4068182383), c(2162078206, 991336113), c(2614888103, 633803317), c(3248222580, 3479774868), c(3835390401, 2666613458), c(4022224774, 944711139), c(264347078, 2341262773), c(604807628, 2007800933), c(770255983, 1495990901), c(1249150122, 1856431235), c(1555081692, 3175218132), c(1996064986, 2198950837), c(2554220882, 3999719339), c(2821834349, 766784016), c(2952996808, 2566594879), c(3210313671, 3203337956), c(3336571891, 1034457026), c(3584528711, 2466948901), c(113926993, 3758326383), c(338241895, 168717936), c(666307205, 1188179964), c(773529912, 1546045734), c(1294757372, 1522805485), c(1396182291, 2643833823), c(1695183700, 2343527390), c(1986661051, 1014477480), c(2177026350, 1206759142), c(2456956037, 344077627), c(2730485921, 1290863460), c(2820302411, 3158454273), c(3259730800, 3505952657), c(3345764771, 106217008), c(3516065817, 3606008344), c(3600352804, 1432725776), c(4094571909, 1467031594), c(275423344, 851169720), c(430227734, 3100823752), c(506948616, 1363258195), c(659060556, 3750685593), c(883997877, 3785050280), c(958139571, 3318307427), c(1322822218, 3812723403), c(1537002063, 2003034995), c(1747873779, 3602036899), c(1955562222, 1575990012), c(2024104815, 1125592928), c(2227730452, 2716904306), c(2361852424, 442776044), c(2428436474, 593698344), c(2756734187, 3733110249), c(3204031479, 2999351573), c(3329325298, 3815920427), c(3391569614, 3928383900), c(3515267271, 566280711), c(3940187606, 3454069534), c(4118630271, 4000239992), c(116418474, 1914138554), c(174292421, 2731055270), c(289380356, 3203993006), c(460393269, 320620315), c(685471733, 587496836), c(852142971, 1086792851), c(1017036298, 365543100), c(1126000580, 2618297676), c(1288033470, 3409855158), c(1501505948, 4234509866), c(1607167915, 987167468), c(1816402316, 1246189591)], Te = [], d = 0; d < 80; d++) Te[d] = c();
            var l = a.SHA512 = s.extend({
                _doReset: function () {
                    this._hash = new o.init([new n.init(1779033703, 4089235720), new n.init(3144134277, 2227873595), new n.init(1013904242, 4271175723), new n.init(2773480762, 1595750129), new n.init(1359893119, 2917565137), new n.init(2600822924, 725511199), new n.init(528734635, 4215389547), new n.init(1541459225, 327033209)])
                },
                _doProcessBlock: function (F, q) {
                    var e = this._hash.words;
                    var t = e[0];
                    var r = e[1];
                    var s = e[2];
                    var i = e[3];
                    var n = e[4];
                    var o = e[5];
                    var a = e[6];
                    var c = e[7];
                    var M = t.high;
                    var d = t.low;
                    var L = r.high;
                    var l = r.low;
                    var j = s.high;
                    var h = s.low;
                    var H = i.high;
                    var u = i.low;
                    var U = n.high;
                    var m = n.low;
                    var z = o.high;
                    var g = o.low;
                    var $ = a.high;
                    var W = a.low;
                    var G = c.high;
                    var K = c.low;
                    var p = M;
                    var f = d;
                    var y = L;
                    var v = l;
                    var w = j;
                    var A = h;
                    var Y = H;
                    var _ = u;
                    var b = U;
                    var S = m;
                    var V = z;
                    var x = g;
                    var J = $;
                    var T = W;
                    var Q = G;
                    var P = K;
                    for (var R = 0; R < 80; R++) {
                        var C;
                        var k;
                        var X = Te[R];
                        if (R < 16) {
                            k = X.high = F[q + R * 2] | 0;
                            C = X.low = F[q + R * 2 + 1] | 0
                        } else {
                            var Z = Te[R - 15];
                            var I = Z.high;
                            var E = Z.low;
                            var ee = (I >>> 1 | E << 31) ^ (I >>> 8 | E << 24) ^ I >>> 7;
                            var te = (E >>> 1 | I << 31) ^ (E >>> 8 | I << 24) ^ (E >>> 7 | I << 25);
                            var re = Te[R - 2];
                            var B = re.high;
                            var D = re.low;
                            var se = (B >>> 19 | D << 13) ^ (B << 3 | D >>> 29) ^ B >>> 6;
                            var ie = (D >>> 19 | B << 13) ^ (D << 3 | B >>> 29) ^ (D >>> 6 | B << 26);
                            var ne = Te[R - 7];
                            var oe = ne.high;
                            var ae = ne.low;
                            var ce = Te[R - 16];
                            var de = ce.high;
                            var le = ce.low;
                            C = te + ae;
                            k = ee + oe + (C >>> 0 < te >>> 0 ? 1 : 0);
                            C = C + ie;
                            k = k + se + (C >>> 0 < ie >>> 0 ? 1 : 0);
                            C = C + le;
                            k = k + de + (C >>> 0 < le >>> 0 ? 1 : 0);
                            X.high = k;
                            X.low = C
                        }
                        var he = b & V ^ ~b & J;
                        var ue = S & x ^ ~S & T;
                        var me = p & y ^ p & w ^ y & w;
                        var ge = f & v ^ f & A ^ v & A;
                        var pe = (p >>> 28 | f << 4) ^ (p << 30 | f >>> 2) ^ (p << 25 | f >>> 7);
                        var fe = (f >>> 28 | p << 4) ^ (f << 30 | p >>> 2) ^ (f << 25 | p >>> 7);
                        var ye = (b >>> 14 | S << 18) ^ (b >>> 18 | S << 14) ^ (b << 23 | S >>> 9);
                        var ve = (S >>> 14 | b << 18) ^ (S >>> 18 | b << 14) ^ (S << 23 | b >>> 9);
                        var we = xe[R];
                        var Ae = we.high;
                        var _e = we.low;
                        var N = P + ve;
                        var O = Q + ye + (N >>> 0 < P >>> 0 ? 1 : 0);
                        var N = N + ue;
                        var O = O + he + (N >>> 0 < ue >>> 0 ? 1 : 0);
                        var N = N + _e;
                        var O = O + Ae + (N >>> 0 < _e >>> 0 ? 1 : 0);
                        var N = N + C;
                        var O = O + k + (N >>> 0 < C >>> 0 ? 1 : 0);
                        var be = fe + ge;
                        var Se = pe + me + (be >>> 0 < fe >>> 0 ? 1 : 0);
                        Q = J;
                        P = T;
                        J = V;
                        T = x;
                        V = b;
                        x = S;
                        S = _ + N | 0;
                        b = Y + O + (S >>> 0 < _ >>> 0 ? 1 : 0) | 0;
                        Y = w;
                        _ = A;
                        w = y;
                        A = v;
                        y = p;
                        v = f;
                        f = N + be | 0;
                        p = O + Se + (f >>> 0 < N >>> 0 ? 1 : 0) | 0
                    }
                    d = t.low = d + f;
                    t.high = M + p + (d >>> 0 < f >>> 0 ? 1 : 0);
                    l = r.low = l + v;
                    r.high = L + y + (l >>> 0 < v >>> 0 ? 1 : 0);
                    h = s.low = h + A;
                    s.high = j + w + (h >>> 0 < A >>> 0 ? 1 : 0);
                    u = i.low = u + _;
                    i.high = H + Y + (u >>> 0 < _ >>> 0 ? 1 : 0);
                    m = n.low = m + S;
                    n.high = U + b + (m >>> 0 < S >>> 0 ? 1 : 0);
                    g = o.low = g + x;
                    o.high = z + V + (g >>> 0 < x >>> 0 ? 1 : 0);
                    W = a.low = W + T;
                    a.high = $ + J + (W >>> 0 < T >>> 0 ? 1 : 0);
                    K = c.low = K + P;
                    c.high = G + Q + (K >>> 0 < P >>> 0 ? 1 : 0)
                },
                _doFinalize: function () {
                    var e = this._data;
                    var t = e.words;
                    var r = this._nDataBytes * 8;
                    var s = e.sigBytes * 8;
                    t[s >>> 5] |= 128 << 24 - s % 32;
                    t[(s + 128 >>> 10 << 5) + 30] = Math.floor(r / 4294967296);
                    t[(s + 128 >>> 10 << 5) + 31] = r;
                    e.sigBytes = t.length * 4;
                    this._process();
                    var i = this._hash.toX32();
                    return i
                },
                clone: function () {
                    var e = s.clone.call(this);
                    e._hash = this._hash.clone();
                    return e
                },
                blockSize: 1024 / 32
            });
            return t.SHA512 = s._createHelper(l), t.HmacSHA512 = s._createHmacHelper(l), e.SHA512
        }(f(), Pe())), rt
    }
    var nt = {},
        ot = {
            get exports() {
                return nt
            },
            set exports(e) {
                nt = e
            }
        };
    var at, ct = {},
        dt = {
            get exports() {
                return ct
            },
            set exports(e) {
                ct = e
            }
        };

    function lt() {
        return at || (at = 1, dt.exports = function (e) {
            for (var u = Math, t = e, r = t.lib, m = r.WordArray, s = r.Hasher, i, n = t.x64.Word, o = t.algo, k = [], I = [], E = [], a = 1, c = 0, d = 0; d < 24; d++) {
                k[a + 5 * c] = (d + 1) * (d + 2) / 2 % 64;
                var l = c % 5;
                var h = (2 * a + 3 * c) % 5;
                a = l;
                c = h
            }
            for (var a = 0; a < 5; a++)
                for (var c = 0; c < 5; c++) I[a + 5 * c] = c + (2 * a + 3 * c) % 5 * 5;
            for (var g = 1, p = 0; p < 24; p++) {
                var f = 0;
                var y = 0;
                for (var v = 0; v < 7; v++) {
                    if (g & 1) {
                        var w = (1 << v) - 1;
                        if (w < 32) y ^= 1 << w;
                        else f ^= 1 << w - 32
                    }
                    if (g & 128) g = g << 1 ^ 113;
                    else g <<= 1
                }
                E[p] = n.create(f, y)
            }
            for (var B = [], A = 0; A < 25; A++) B[A] = n.create();
            var _ = o.SHA3 = s.extend({
                cfg: s.cfg.extend({
                    outputLength: 512
                }),
                _doReset: function () {
                    var e = this._state = [];
                    for (var t = 0; t < 25; t++) e[t] = new n.init;
                    this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32
                },
                _doProcessBlock: function (e, t) {
                    var r = this._state;
                    var s = this.blockSize / 2;
                    for (var i = 0; i < s; i++) {
                        var n = e[t + 2 * i];
                        var o = e[t + 2 * i + 1];
                        n = (n << 8 | n >>> 24) & 16711935 | (n << 24 | n >>> 8) & 4278255360;
                        o = (o << 8 | o >>> 24) & 16711935 | (o << 24 | o >>> 8) & 4278255360;
                        var a = r[i];
                        a.high ^= o;
                        a.low ^= n
                    }
                    for (var c = 0; c < 24; c++) {
                        for (var d = 0; d < 5; d++) {
                            var l = 0,
                                h = 0;
                            for (var u = 0; u < 5; u++) {
                                var a = r[d + 5 * u];
                                l ^= a.high;
                                h ^= a.low
                            }
                            var m = B[d];
                            m.high = l;
                            m.low = h
                        }
                        for (var d = 0; d < 5; d++) {
                            var g = B[(d + 4) % 5];
                            var p = B[(d + 1) % 5];
                            var f = p.high;
                            var y = p.low;
                            var l = g.high ^ (f << 1 | y >>> 31);
                            var h = g.low ^ (y << 1 | f >>> 31);
                            for (var u = 0; u < 5; u++) {
                                var a = r[d + 5 * u];
                                a.high ^= l;
                                a.low ^= h
                            }
                        }
                        for (var v = 1; v < 25; v++) {
                            var l;
                            var h;
                            var a = r[v];
                            var w = a.high;
                            var A = a.low;
                            var _ = k[v];
                            if (_ < 32) {
                                l = w << _ | A >>> 32 - _;
                                h = A << _ | w >>> 32 - _
                            } else {
                                l = A << _ - 32 | w >>> 64 - _;
                                h = w << _ - 32 | A >>> 64 - _
                            }
                            var b = B[I[v]];
                            b.high = l;
                            b.low = h
                        }
                        var S = B[0];
                        var x = r[0];
                        S.high = x.high;
                        S.low = x.low;
                        for (var d = 0; d < 5; d++)
                            for (var u = 0; u < 5; u++) {
                                var v = d + 5 * u;
                                var a = r[v];
                                var T = B[v];
                                var P = B[(d + 1) % 5 + 5 * u];
                                var R = B[(d + 2) % 5 + 5 * u];
                                a.high = T.high ^ ~P.high & R.high;
                                a.low = T.low ^ ~P.low & R.low
                            }
                        var a = r[0];
                        var C = E[c];
                        a.high ^= C.high;
                        a.low ^= C.low
                    }
                },
                _doFinalize: function () {
                    var e = this._data;
                    var t = e.words;
                    this._nDataBytes * 8;
                    var r = e.sigBytes * 8;
                    var s = this.blockSize * 32;
                    t[r >>> 5] |= 1 << 24 - r % 32;
                    t[(u.ceil((r + 1) / s) * s >>> 5) - 1] |= 128;
                    e.sigBytes = t.length * 4;
                    this._process();
                    var i = this._state;
                    var n = this.cfg.outputLength / 8;
                    var o = n / 8;
                    var a = [];
                    for (var c = 0; c < o; c++) {
                        var d = i[c];
                        var l = d.high;
                        var h = d.low;
                        l = (l << 8 | l >>> 24) & 16711935 | (l << 24 | l >>> 8) & 4278255360;
                        h = (h << 8 | h >>> 24) & 16711935 | (h << 24 | h >>> 8) & 4278255360;
                        a.push(h);
                        a.push(l)
                    }
                    return new m.init(a, n)
                },
                clone: function () {
                    var e = s.clone.call(this);
                    var t = e._state = this._state.slice(0);
                    for (var r = 0; r < 25; r++) t[r] = t[r].clone();
                    return e
                }
            });
            return t.SHA3 = s._createHelper(_), t.HmacSHA3 = s._createHmacHelper(_), e.SHA3
        }(f(), Pe())), ct
    }
    var ht = {},
        ut = {
            get exports() {
                return ht
            },
            set exports(e) {
                ht = e
            }
        };
    var mt, gt = {},
        pt = {
            get exports() {
                return gt
            },
            set exports(e) {
                gt = e
            }
        };

    function ft() {
        var e, t, a;
        return mt || (mt = 1, pt.exports = (e = f(), t = e.lib.Base, a = e.enc.Utf8, void (e.algo.HMAC = t.extend({
            init: function (e, t) {
                e = this._hasher = new e.init, "string" == typeof t && (t = a.parse(t));
                for (var r = e.blockSize, s = 4 * r, e = ((t = t.sigBytes > s ? e.finalize(t) : t).clamp(), this._oKey = t.clone()), t = this._iKey = t.clone(), i = e.words, n = t.words, o = 0; o < r; o++) i[o] ^= 1549556828, n[o] ^= 909522486;
                e.sigBytes = t.sigBytes = s, this.reset()
            },
            reset: function () {
                var e = this._hasher;
                e.reset(), e.update(this._iKey)
            },
            update: function (e) {
                return this._hasher.update(e), this
            },
            finalize: function (e) {
                var t = this._hasher,
                    e = t.finalize(e);
                return t.reset(), t.finalize(this._oKey.clone().concat(e))
            }
        })))), gt
    }
    var yt = {},
        vt = {
            get exports() {
                return yt
            },
            set exports(e) {
                yt = e
            }
        };
    var wt, At = {},
        _t = {
            get exports() {
                return At
            },
            set exports(e) {
                At = e
            }
        };

    function bt() {
        var e, t, r, l, s, i, n;
        return wt || (wt = 1, _t.exports = (e = f(), Ye(), ft(), s = (t = e).lib, r = s.Base, l = s.WordArray, s = t.algo, i = s.MD5, n = s.EvpKDF = r.extend({
            cfg: r.extend({
                keySize: 4,
                hasher: i,
                iterations: 1
            }),
            init: function (e) {
                this.cfg = this.cfg.extend(e)
            },
            compute: function (e, t) {
                for (var r, s = this.cfg, i = s.hasher.create(), n = l.create(), o = n.words, a = s.keySize, c = s.iterations; o.length < a;) {
                    r && i.update(r), r = i.update(e).finalize(t), i.reset();
                    for (var d = 1; d < c; d++) r = i.finalize(r), i.reset();
                    n.concat(r)
                }
                return n.sigBytes = 4 * a, n
            }
        }), t.EvpKDF = function (e, t, r) {
            return n.create(r).compute(e, t)
        }, e.EvpKDF)), At
    }
    var St, xt = {},
        Tt = {
            get exports() {
                return xt
            },
            set exports(e) {
                xt = e
            }
        };

    function o() {
        var o, e, t, r, a, s, i, n, c, d, l, h, u, m, g;
        return St || (St = 1, Tt.exports = (e = f(), bt(), void (e.lib.Cipher || (o = void 0, t = (e = e).lib, r = t.Base, a = t.WordArray, s = t.BufferedBlockAlgorithm, (h = e.enc).Utf8, i = h.Base64, n = e.algo.EvpKDF, c = t.Cipher = s.extend({
            cfg: r.extend(),
            createEncryptor: function (e, t) {
                return this.create(this._ENC_XFORM_MODE, e, t)
            },
            createDecryptor: function (e, t) {
                return this.create(this._DEC_XFORM_MODE, e, t)
            },
            init: function (e, t, r) {
                this.cfg = this.cfg.extend(r), this._xformMode = e, this._key = t, this.reset()
            },
            reset: function () {
                s.reset.call(this), this._doReset()
            },
            process: function (e) {
                return this._append(e), this._process()
            },
            finalize: function (e) {
                return e && this._append(e), this._doFinalize()
            },
            keySize: 4,
            ivSize: 4,
            _ENC_XFORM_MODE: 1,
            _DEC_XFORM_MODE: 2,
            _createHelper: function () {
                function i(e) {
                    return "string" == typeof e ? g : u
                }
                return function (s) {
                    return {
                        encrypt: function (e, t, r) {
                            return i(t).encrypt(s, e, t, r)
                        },
                        decrypt: function (e, t, r) {
                            return i(t).decrypt(s, e, t, r)
                        }
                    }
                }
            }()
        }), t.StreamCipher = c.extend({
            _doFinalize: function () {
                return this._process(!0)
            },
            blockSize: 1
        }), h = e.mode = {}, d = t.BlockCipherMode = r.extend({
            createEncryptor: function (e, t) {
                return this.Encryptor.create(e, t)
            },
            createDecryptor: function (e, t) {
                return this.Decryptor.create(e, t)
            },
            init: function (e, t) {
                this._cipher = e, this._iv = t
            }
        }), h = h.CBC = function () {
            var e = d.extend();

            function n(e, t, r) {
                var s, i = this._iv;
                i ? (s = i, this._iv = o) : s = this._prevBlock;
                for (var n = 0; n < r; n++) e[t + n] ^= s[n]
            }
            return e.Encryptor = e.extend({
                processBlock: function (e, t) {
                    var r = this._cipher,
                        s = r.blockSize;
                    n.call(this, e, t, s), r.encryptBlock(e, t), this._prevBlock = e.slice(t, t + s)
                }
            }), e.Decryptor = e.extend({
                processBlock: function (e, t) {
                    var r = this._cipher,
                        s = r.blockSize,
                        i = e.slice(t, t + s);
                    r.decryptBlock(e, t), n.call(this, e, t, s), this._prevBlock = i
                }
            }), e
        }(), m = (e.pad = {}).Pkcs7 = {
            pad: function (e, t) {
                for (var t = 4 * t, r = t - e.sigBytes % t, s = r << 24 | r << 16 | r << 8 | r, i = [], n = 0; n < r; n += 4) i.push(s);
                t = a.create(i, r);
                e.concat(t)
            },
            unpad: function (e) {
                var t = 255 & e.words[e.sigBytes - 1 >>> 2];
                e.sigBytes -= t
            }
        }, t.BlockCipher = c.extend({
            cfg: c.cfg.extend({
                mode: h,
                padding: m
            }),
            reset: function () {
                c.reset.call(this);
                var e, t = this.cfg,
                    r = t.iv,
                    t = t.mode;
                this._xformMode == this._ENC_XFORM_MODE ? e = t.createEncryptor : (e = t.createDecryptor, this._minBufferSize = 1), this._mode && this._mode.__creator == e ? this._mode.init(this, r && r.words) : (this._mode = e.call(t, this, r && r.words), this._mode.__creator = e)
            },
            _doProcessBlock: function (e, t) {
                this._mode.processBlock(e, t)
            },
            _doFinalize: function () {
                var e, t = this.cfg.padding;
                return this._xformMode == this._ENC_XFORM_MODE ? (t.pad(this._data, this.blockSize), e = this._process(!0)) : (e = this._process(!0), t.unpad(e)), e
            },
            blockSize: 4
        }), l = t.CipherParams = r.extend({
            init: function (e) {
                this.mixIn(e)
            },
            toString: function (e) {
                return (e || this.formatter).stringify(this)
            }
        }), h = (e.format = {}).OpenSSL = {
            stringify: function (e) {
                var t = e.ciphertext,
                    e = e.salt,
                    e = e ? a.create([1398893684, 1701076831]).concat(e).concat(t) : t;
                return e.toString(i)
            },
            parse: function (e) {
                var t, e = i.parse(e),
                    r = e.words;
                return 1398893684 == r[0] && 1701076831 == r[1] && (t = a.create(r.slice(2, 4)), r.splice(0, 4), e.sigBytes -= 16), l.create({
                    ciphertext: e,
                    salt: t
                })
            }
        }, u = t.SerializableCipher = r.extend({
            cfg: r.extend({
                format: h
            }),
            encrypt: function (e, t, r, s) {
                s = this.cfg.extend(s);
                var i = e.createEncryptor(r, s),
                    t = i.finalize(t),
                    i = i.cfg;
                return l.create({
                    ciphertext: t,
                    key: r,
                    iv: i.iv,
                    algorithm: e,
                    mode: i.mode,
                    padding: i.padding,
                    blockSize: e.blockSize,
                    formatter: s.format
                })
            },
            decrypt: function (e, t, r, s) {
                return s = this.cfg.extend(s), t = this._parse(t, s.format), e.createDecryptor(r, s).finalize(t.ciphertext)
            },
            _parse: function (e, t) {
                return "string" == typeof e ? t.parse(e, this) : e
            }
        }), m = (e.kdf = {}).OpenSSL = {
            execute: function (e, t, r, s) {
                s = s || a.random(8);
                e = n.create({
                    keySize: t + r
                }).compute(e, s), r = a.create(e.words.slice(t), 4 * r);
                return e.sigBytes = 4 * t, l.create({
                    key: e,
                    iv: r,
                    salt: s
                })
            }
        }, g = t.PasswordBasedCipher = u.extend({
            cfg: u.cfg.extend({
                kdf: m
            }),
            encrypt: function (e, t, r, s) {
                r = (s = this.cfg.extend(s)).kdf.execute(r, e.keySize, e.ivSize), s.iv = r.iv, e = u.encrypt.call(this, e, t, r.key, s);
                return e.mixIn(r), e
            },
            decrypt: function (e, t, r, s) {
                s = this.cfg.extend(s), t = this._parse(t, s.format);
                r = s.kdf.execute(r, e.keySize, e.ivSize, t.salt);
                return s.iv = r.iv, u.decrypt.call(this, e, t, r.key, s)
            }
        }))))), xt
    }
    var Pt, Rt = {},
        Ct = {
            get exports() {
                return Rt
            },
            set exports(e) {
                Rt = e
            }
        };

    function kt() {
        var t;
        return Pt || (Pt = 1, Ct.exports = (t = f(), o(), t.mode.CFB = function () {
            var e = t.lib.BlockCipherMode.extend();

            function n(e, t, r, s) {
                var i, n = this._iv;
                n ? (i = n.slice(0), this._iv = void 0) : i = this._prevBlock, s.encryptBlock(i, 0);
                for (var o = 0; o < r; o++) e[t + o] ^= i[o]
            }
            return e.Encryptor = e.extend({
                processBlock: function (e, t) {
                    var r = this._cipher,
                        s = r.blockSize;
                    n.call(this, e, t, s, r), this._prevBlock = e.slice(t, t + s)
                }
            }), e.Decryptor = e.extend({
                processBlock: function (e, t) {
                    var r = this._cipher,
                        s = r.blockSize,
                        i = e.slice(t, t + s);
                    n.call(this, e, t, s, r), this._prevBlock = i
                }
            }), e
        }(), t.mode.CFB)), Rt
    }
    var It, Et = {},
        Bt = {
            get exports() {
                return Et
            },
            set exports(e) {
                Et = e
            }
        };

    function Dt() {
        var r;
        return It || (It = 1, Bt.exports = (r = f(), o(), r.mode.CTR = function () {
            var e = r.lib.BlockCipherMode.extend(),
                t = e.Encryptor = e.extend({
                    processBlock: function (e, t) {
                        var r = this._cipher,
                            s = r.blockSize,
                            i = this._iv,
                            n = this._counter,
                            o = (i && (n = this._counter = i.slice(0), this._iv = void 0), n.slice(0));
                        r.encryptBlock(o, 0), n[s - 1] = n[s - 1] + 1 | 0;
                        for (var a = 0; a < s; a++) e[t + a] ^= o[a]
                    }
                });
            return e.Decryptor = t, e
        }(), r.mode.CTR)), Et
    }
    var Nt, Ot = {},
        Ft = {
            get exports() {
                return Ot
            },
            set exports(e) {
                Ot = e
            }
        };

    function qt() {
        var r;
        return Nt || (Nt = 1, Ft.exports = (r = f(), o(), r.mode.CTRGladman = function () {
            var e = r.lib.BlockCipherMode.extend();

            function c(e) {
                var t, r, s;
                return 255 == (e >> 24 & 255) ? (r = e >> 8 & 255, s = 255 & e, 255 === (t = e >> 16 & 255) ? (t = 0, 255 === r ? (r = 0, 255 === s ? s = 0 : ++s) : ++r) : ++t, e = 0, e = (e += t << 16) + (r << 8) + s) : e += 1 << 24, e
            }
            var t = e.Encryptor = e.extend({
                processBlock: function (e, t) {
                    var r = this._cipher,
                        s = r.blockSize,
                        i = this._iv,
                        n = this._counter,
                        o = (i && (n = this._counter = i.slice(0), this._iv = void 0), 0 === ((i = n)[0] = c(i[0])) && (i[1] = c(i[1])), n.slice(0));
                    r.encryptBlock(o, 0);
                    for (var a = 0; a < s; a++) e[t + a] ^= o[a]
                }
            });
            return e.Decryptor = t, e
        }(), r.mode.CTRGladman)), Ot
    }
    var Mt, Lt = {},
        jt = {
            get exports() {
                return Lt
            },
            set exports(e) {
                Lt = e
            }
        };

    function Ht() {
        var r;
        return Mt || (Mt = 1, jt.exports = (r = f(), o(), r.mode.OFB = function () {
            var e = r.lib.BlockCipherMode.extend(),
                t = e.Encryptor = e.extend({
                    processBlock: function (e, t) {
                        var r = this._cipher,
                            s = r.blockSize,
                            i = this._iv,
                            n = this._keystream;
                        i && (n = this._keystream = i.slice(0), this._iv = void 0), r.encryptBlock(n, 0);
                        for (var o = 0; o < s; o++) e[t + o] ^= n[o]
                    }
                });
            return e.Decryptor = t, e
        }(), r.mode.OFB)), Lt
    }
    var Ut, zt = {},
        $t = {
            get exports() {
                return zt
            },
            set exports(e) {
                zt = e
            }
        };
    var Wt, Gt = {},
        Kt = {
            get exports() {
                return Gt
            },
            set exports(e) {
                Gt = e
            }
        };
    var Yt, Vt = {},
        Jt = {
            get exports() {
                return Vt
            },
            set exports(e) {
                Vt = e
            }
        };
    var Qt, Xt = {},
        Zt = {
            get exports() {
                return Xt
            },
            set exports(e) {
                Xt = e
            }
        };
    var er, tr = {},
        rr = {
            get exports() {
                return tr
            },
            set exports(e) {
                tr = e
            }
        };
    var sr, ir = {},
        nr = {
            get exports() {
                return ir
            },
            set exports(e) {
                ir = e
            }
        };
    var or, ar = {},
        cr = {
            get exports() {
                return ar
            },
            set exports(e) {
                ar = e
            }
        };
    var dr, lr = {},
        hr = {
            get exports() {
                return lr
            },
            set exports(e) {
                lr = e
            }
        };

    function ur() {
        return dr || (dr = 1, hr.exports = function (e) {
            for (var t = e, r, s = t.lib.BlockCipher, i = t.algo, l = [], n = [], o = [], a = [], c = [], d = [], h = [], u = [], m = [], g = [], p = [], f = 0; f < 256; f++)
                if (f < 128) p[f] = f << 1;
                else p[f] = f << 1 ^ 283;
            for (var y = 0, v = 0, f = 0; f < 256; f++) {
                var w = v ^ v << 1 ^ v << 2 ^ v << 3 ^ v << 4;
                w = w >>> 8 ^ w & 255 ^ 99;
                l[y] = w;
                n[w] = y;
                var A = p[y];
                var _ = p[A];
                var b = p[_];
                var S = p[w] * 257 ^ w * 16843008;
                o[y] = S << 24 | S >>> 8;
                a[y] = S << 16 | S >>> 16;
                c[y] = S << 8 | S >>> 24;
                d[y] = S;
                var S = b * 16843009 ^ _ * 65537 ^ A * 257 ^ y * 16843008;
                h[w] = S << 24 | S >>> 8;
                u[w] = S << 16 | S >>> 16;
                m[w] = S << 8 | S >>> 24;
                g[w] = S;
                if (!y) y = v = 1;
                else {
                    y = A ^ p[p[p[b ^ A]]];
                    v ^= p[p[v]]
                }
            }
            var x = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
                T = i.AES = s.extend({
                    _doReset: function () {
                        var e;
                        if (this._nRounds && this._keyPriorReset === this._key) return;
                        var t = this._keyPriorReset = this._key;
                        var r = t.words;
                        var s = t.sigBytes / 4;
                        var i = this._nRounds = s + 6;
                        var n = (i + 1) * 4;
                        var o = this._keySchedule = [];
                        for (var a = 0; a < n; a++)
                            if (a < s) o[a] = r[a];
                            else {
                                e = o[a - 1];
                                if (!(a % s)) {
                                    e = e << 8 | e >>> 24;
                                    e = l[e >>> 24] << 24 | l[e >>> 16 & 255] << 16 | l[e >>> 8 & 255] << 8 | l[e & 255];
                                    e ^= x[a / s | 0] << 24
                                } else if (s > 6 && a % s == 4) e = l[e >>> 24] << 24 | l[e >>> 16 & 255] << 16 | l[e >>> 8 & 255] << 8 | l[e & 255];
                                o[a] = o[a - s] ^ e
                            } var c = this._invKeySchedule = [];
                        for (var d = 0; d < n; d++) {
                            var a = n - d;
                            if (d % 4) var e = o[a];
                            else var e = o[a - 4];
                            if (d < 4 || a <= 4) c[d] = e;
                            else c[d] = h[l[e >>> 24]] ^ u[l[e >>> 16 & 255]] ^ m[l[e >>> 8 & 255]] ^ g[l[e & 255]]
                        }
                    },
                    encryptBlock: function (e, t) {
                        this._doCryptBlock(e, t, this._keySchedule, o, a, c, d, l)
                    },
                    decryptBlock: function (e, t) {
                        var r = e[t + 1];
                        e[t + 1] = e[t + 3];
                        e[t + 3] = r;
                        this._doCryptBlock(e, t, this._invKeySchedule, h, u, m, g, n);
                        var r = e[t + 1];
                        e[t + 1] = e[t + 3];
                        e[t + 3] = r
                    },
                    _doCryptBlock: function (e, t, r, s, i, n, o, a) {
                        var c = this._nRounds;
                        var d = e[t] ^ r[0];
                        var l = e[t + 1] ^ r[1];
                        var h = e[t + 2] ^ r[2];
                        var u = e[t + 3] ^ r[3];
                        var m = 4;
                        for (var g = 1; g < c; g++) {
                            var p = s[d >>> 24] ^ i[l >>> 16 & 255] ^ n[h >>> 8 & 255] ^ o[u & 255] ^ r[m++];
                            var f = s[l >>> 24] ^ i[h >>> 16 & 255] ^ n[u >>> 8 & 255] ^ o[d & 255] ^ r[m++];
                            var y = s[h >>> 24] ^ i[u >>> 16 & 255] ^ n[d >>> 8 & 255] ^ o[l & 255] ^ r[m++];
                            var v = s[u >>> 24] ^ i[d >>> 16 & 255] ^ n[l >>> 8 & 255] ^ o[h & 255] ^ r[m++];
                            d = p;
                            l = f;
                            h = y;
                            u = v
                        }
                        var p = (a[d >>> 24] << 24 | a[l >>> 16 & 255] << 16 | a[h >>> 8 & 255] << 8 | a[u & 255]) ^ r[m++];
                        var f = (a[l >>> 24] << 24 | a[h >>> 16 & 255] << 16 | a[u >>> 8 & 255] << 8 | a[d & 255]) ^ r[m++];
                        var y = (a[h >>> 24] << 24 | a[u >>> 16 & 255] << 16 | a[d >>> 8 & 255] << 8 | a[l & 255]) ^ r[m++];
                        var v = (a[u >>> 24] << 24 | a[d >>> 16 & 255] << 16 | a[l >>> 8 & 255] << 8 | a[h & 255]) ^ r[m++];
                        e[t] = p;
                        e[t + 1] = f;
                        e[t + 2] = y;
                        e[t + 3] = v
                    },
                    keySize: 256 / 32
                });
            return t.AES = s._createHelper(T), e.AES
        }(f(), (Me(), $e(), bt(), o()))), lr
    }
    var mr, gr = {},
        pr = {
            get exports() {
                return gr
            },
            set exports(e) {
                gr = e
            }
        };

    function fr() {
        var e, t, s, r, d, l, h, u, m, i, n;
        return mr || (mr = 1, pr.exports = (e = f(), Me(), $e(), bt(), o(), r = (t = e).lib, s = r.WordArray, r = r.BlockCipher, n = t.algo, d = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4], l = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32], h = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28], u = [{
            0: 8421888,
            268435456: 32768,
            536870912: 8421378,
            805306368: 2,
            1073741824: 512,
            1342177280: 8421890,
            1610612736: 8389122,
            1879048192: 8388608,
            2147483648: 514,
            2415919104: 8389120,
            2684354560: 33280,
            2952790016: 8421376,
            3221225472: 32770,
            3489660928: 8388610,
            3758096384: 0,
            4026531840: 33282,
            134217728: 0,
            402653184: 8421890,
            671088640: 33282,
            939524096: 32768,
            1207959552: 8421888,
            1476395008: 512,
            1744830464: 8421378,
            2013265920: 2,
            2281701376: 8389120,
            2550136832: 33280,
            2818572288: 8421376,
            3087007744: 8389122,
            3355443200: 8388610,
            3623878656: 32770,
            3892314112: 514,
            4160749568: 8388608,
            1: 32768,
            268435457: 2,
            536870913: 8421888,
            805306369: 8388608,
            1073741825: 8421378,
            1342177281: 33280,
            1610612737: 512,
            1879048193: 8389122,
            2147483649: 8421890,
            2415919105: 8421376,
            2684354561: 8388610,
            2952790017: 33282,
            3221225473: 514,
            3489660929: 8389120,
            3758096385: 32770,
            4026531841: 0,
            134217729: 8421890,
            402653185: 8421376,
            671088641: 8388608,
            939524097: 512,
            1207959553: 32768,
            1476395009: 8388610,
            1744830465: 2,
            2013265921: 33282,
            2281701377: 32770,
            2550136833: 8389122,
            2818572289: 514,
            3087007745: 8421888,
            3355443201: 8389120,
            3623878657: 0,
            3892314113: 33280,
            4160749569: 8421378
        }, {
            0: 1074282512,
            16777216: 16384,
            33554432: 524288,
            50331648: 1074266128,
            67108864: 1073741840,
            83886080: 1074282496,
            100663296: 1073758208,
            117440512: 16,
            134217728: 540672,
            150994944: 1073758224,
            167772160: 1073741824,
            184549376: 540688,
            201326592: 524304,
            218103808: 0,
            234881024: 16400,
            251658240: 1074266112,
            8388608: 1073758208,
            25165824: 540688,
            41943040: 16,
            58720256: 1073758224,
            75497472: 1074282512,
            92274688: 1073741824,
            109051904: 524288,
            125829120: 1074266128,
            142606336: 524304,
            159383552: 0,
            176160768: 16384,
            192937984: 1074266112,
            209715200: 1073741840,
            226492416: 540672,
            243269632: 1074282496,
            260046848: 16400,
            268435456: 0,
            285212672: 1074266128,
            301989888: 1073758224,
            318767104: 1074282496,
            335544320: 1074266112,
            352321536: 16,
            369098752: 540688,
            385875968: 16384,
            402653184: 16400,
            419430400: 524288,
            436207616: 524304,
            452984832: 1073741840,
            469762048: 540672,
            486539264: 1073758208,
            503316480: 1073741824,
            520093696: 1074282512,
            276824064: 540688,
            293601280: 524288,
            310378496: 1074266112,
            327155712: 16384,
            343932928: 1073758208,
            360710144: 1074282512,
            377487360: 16,
            394264576: 1073741824,
            411041792: 1074282496,
            427819008: 1073741840,
            444596224: 1073758224,
            461373440: 524304,
            478150656: 0,
            494927872: 16400,
            511705088: 1074266128,
            528482304: 540672
        }, {
            0: 260,
            1048576: 0,
            2097152: 67109120,
            3145728: 65796,
            4194304: 65540,
            5242880: 67108868,
            6291456: 67174660,
            7340032: 67174400,
            8388608: 67108864,
            9437184: 67174656,
            10485760: 65792,
            11534336: 67174404,
            12582912: 67109124,
            13631488: 65536,
            14680064: 4,
            15728640: 256,
            524288: 67174656,
            1572864: 67174404,
            2621440: 0,
            3670016: 67109120,
            4718592: 67108868,
            5767168: 65536,
            6815744: 65540,
            7864320: 260,
            8912896: 4,
            9961472: 256,
            11010048: 67174400,
            12058624: 65796,
            13107200: 65792,
            14155776: 67109124,
            15204352: 67174660,
            16252928: 67108864,
            16777216: 67174656,
            17825792: 65540,
            18874368: 65536,
            19922944: 67109120,
            20971520: 256,
            22020096: 67174660,
            23068672: 67108868,
            24117248: 0,
            25165824: 67109124,
            26214400: 67108864,
            27262976: 4,
            28311552: 65792,
            29360128: 67174400,
            30408704: 260,
            31457280: 65796,
            32505856: 67174404,
            17301504: 67108864,
            18350080: 260,
            19398656: 67174656,
            20447232: 0,
            21495808: 65540,
            22544384: 67109120,
            23592960: 256,
            24641536: 67174404,
            25690112: 65536,
            26738688: 67174660,
            27787264: 65796,
            28835840: 67108868,
            29884416: 67109124,
            30932992: 67174400,
            31981568: 4,
            33030144: 65792
        }, {
            0: 2151682048,
            65536: 2147487808,
            131072: 4198464,
            196608: 2151677952,
            262144: 0,
            327680: 4198400,
            393216: 2147483712,
            458752: 4194368,
            524288: 2147483648,
            589824: 4194304,
            655360: 64,
            720896: 2147487744,
            786432: 2151678016,
            851968: 4160,
            917504: 4096,
            983040: 2151682112,
            32768: 2147487808,
            98304: 64,
            163840: 2151678016,
            229376: 2147487744,
            294912: 4198400,
            360448: 2151682112,
            425984: 0,
            491520: 2151677952,
            557056: 4096,
            622592: 2151682048,
            688128: 4194304,
            753664: 4160,
            819200: 2147483648,
            884736: 4194368,
            950272: 4198464,
            1015808: 2147483712,
            1048576: 4194368,
            1114112: 4198400,
            1179648: 2147483712,
            1245184: 0,
            1310720: 4160,
            1376256: 2151678016,
            1441792: 2151682048,
            1507328: 2147487808,
            1572864: 2151682112,
            1638400: 2147483648,
            1703936: 2151677952,
            1769472: 4198464,
            1835008: 2147487744,
            1900544: 4194304,
            1966080: 64,
            2031616: 4096,
            1081344: 2151677952,
            1146880: 2151682112,
            1212416: 0,
            1277952: 4198400,
            1343488: 4194368,
            1409024: 2147483648,
            1474560: 2147487808,
            1540096: 64,
            1605632: 2147483712,
            1671168: 4096,
            1736704: 2147487744,
            1802240: 2151678016,
            1867776: 4160,
            1933312: 2151682048,
            1998848: 4194304,
            2064384: 4198464
        }, {
            0: 128,
            4096: 17039360,
            8192: 262144,
            12288: 536870912,
            16384: 537133184,
            20480: 16777344,
            24576: 553648256,
            28672: 262272,
            32768: 16777216,
            36864: 537133056,
            40960: 536871040,
            45056: 553910400,
            49152: 553910272,
            53248: 0,
            57344: 17039488,
            61440: 553648128,
            2048: 17039488,
            6144: 553648256,
            10240: 128,
            14336: 17039360,
            18432: 262144,
            22528: 537133184,
            26624: 553910272,
            30720: 536870912,
            34816: 537133056,
            38912: 0,
            43008: 553910400,
            47104: 16777344,
            51200: 536871040,
            55296: 553648128,
            59392: 16777216,
            63488: 262272,
            65536: 262144,
            69632: 128,
            73728: 536870912,
            77824: 553648256,
            81920: 16777344,
            86016: 553910272,
            90112: 537133184,
            94208: 16777216,
            98304: 553910400,
            102400: 553648128,
            106496: 17039360,
            110592: 537133056,
            114688: 262272,
            118784: 536871040,
            122880: 0,
            126976: 17039488,
            67584: 553648256,
            71680: 16777216,
            75776: 17039360,
            79872: 537133184,
            83968: 536870912,
            88064: 17039488,
            92160: 128,
            96256: 553910272,
            100352: 262272,
            104448: 553910400,
            108544: 0,
            112640: 553648128,
            116736: 16777344,
            120832: 262144,
            124928: 537133056,
            129024: 536871040
        }, {
            0: 268435464,
            256: 8192,
            512: 270532608,
            768: 270540808,
            1024: 268443648,
            1280: 2097152,
            1536: 2097160,
            1792: 268435456,
            2048: 0,
            2304: 268443656,
            2560: 2105344,
            2816: 8,
            3072: 270532616,
            3328: 2105352,
            3584: 8200,
            3840: 270540800,
            128: 270532608,
            384: 270540808,
            640: 8,
            896: 2097152,
            1152: 2105352,
            1408: 268435464,
            1664: 268443648,
            1920: 8200,
            2176: 2097160,
            2432: 8192,
            2688: 268443656,
            2944: 270532616,
            3200: 0,
            3456: 270540800,
            3712: 2105344,
            3968: 268435456,
            4096: 268443648,
            4352: 270532616,
            4608: 270540808,
            4864: 8200,
            5120: 2097152,
            5376: 268435456,
            5632: 268435464,
            5888: 2105344,
            6144: 2105352,
            6400: 0,
            6656: 8,
            6912: 270532608,
            7168: 8192,
            7424: 268443656,
            7680: 270540800,
            7936: 2097160,
            4224: 8,
            4480: 2105344,
            4736: 2097152,
            4992: 268435464,
            5248: 268443648,
            5504: 8200,
            5760: 270540808,
            6016: 270532608,
            6272: 270540800,
            6528: 270532616,
            6784: 8192,
            7040: 2105352,
            7296: 2097160,
            7552: 0,
            7808: 268435456,
            8064: 268443656
        }, {
            0: 1048576,
            16: 33555457,
            32: 1024,
            48: 1049601,
            64: 34604033,
            80: 0,
            96: 1,
            112: 34603009,
            128: 33555456,
            144: 1048577,
            160: 33554433,
            176: 34604032,
            192: 34603008,
            208: 1025,
            224: 1049600,
            240: 33554432,
            8: 34603009,
            24: 0,
            40: 33555457,
            56: 34604032,
            72: 1048576,
            88: 33554433,
            104: 33554432,
            120: 1025,
            136: 1049601,
            152: 33555456,
            168: 34603008,
            184: 1048577,
            200: 1024,
            216: 34604033,
            232: 1,
            248: 1049600,
            256: 33554432,
            272: 1048576,
            288: 33555457,
            304: 34603009,
            320: 1048577,
            336: 33555456,
            352: 34604032,
            368: 1049601,
            384: 1025,
            400: 34604033,
            416: 1049600,
            432: 1,
            448: 0,
            464: 34603008,
            480: 33554433,
            496: 1024,
            264: 1049600,
            280: 33555457,
            296: 34603009,
            312: 1,
            328: 33554432,
            344: 1048576,
            360: 1025,
            376: 34604032,
            392: 33554433,
            408: 34603008,
            424: 0,
            440: 34604033,
            456: 1049601,
            472: 1024,
            488: 33555456,
            504: 1048577
        }, {
            0: 134219808,
            1: 131072,
            2: 134217728,
            3: 32,
            4: 131104,
            5: 134350880,
            6: 134350848,
            7: 2048,
            8: 134348800,
            9: 134219776,
            10: 133120,
            11: 134348832,
            12: 2080,
            13: 0,
            14: 134217760,
            15: 133152,
            2147483648: 2048,
            2147483649: 134350880,
            2147483650: 134219808,
            2147483651: 134217728,
            2147483652: 134348800,
            2147483653: 133120,
            2147483654: 133152,
            2147483655: 32,
            2147483656: 134217760,
            2147483657: 2080,
            2147483658: 131104,
            2147483659: 134350848,
            2147483660: 0,
            2147483661: 134348832,
            2147483662: 134219776,
            2147483663: 131072,
            16: 133152,
            17: 134350848,
            18: 32,
            19: 2048,
            20: 134219776,
            21: 134217760,
            22: 134348832,
            23: 131072,
            24: 0,
            25: 131104,
            26: 134348800,
            27: 134219808,
            28: 134350880,
            29: 133120,
            30: 2080,
            31: 134217728,
            2147483664: 131072,
            2147483665: 2048,
            2147483666: 134348832,
            2147483667: 133152,
            2147483668: 32,
            2147483669: 134348800,
            2147483670: 134217728,
            2147483671: 134219808,
            2147483672: 134350880,
            2147483673: 134217760,
            2147483674: 134219776,
            2147483675: 0,
            2147483676: 133120,
            2147483677: 2080,
            2147483678: 131104,
            2147483679: 134350848
        }], m = [4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504, 2147483679], i = n.DES = r.extend({
            _doReset: function () {
                for (var e = this._key.words, t = [], r = 0; r < 56; r++) {
                    var s = d[r] - 1;
                    t[r] = e[s >>> 5] >>> 31 - s % 32 & 1
                }
                for (var i = this._subKeys = [], n = 0; n < 16; n++) {
                    for (var o = i[n] = [], a = h[n], r = 0; r < 24; r++) o[r / 6 | 0] |= t[(l[r] - 1 + a) % 28] << 31 - r % 6, o[4 + (r / 6 | 0)] |= t[28 + (l[r + 24] - 1 + a) % 28] << 31 - r % 6;
                    o[0] = o[0] << 1 | o[0] >>> 31;
                    for (r = 1; r < 7; r++) o[r] = o[r] >>> 4 * (r - 1) + 3;
                    o[7] = o[7] << 5 | o[7] >>> 27
                }
                for (var c = this._invSubKeys = [], r = 0; r < 16; r++) c[r] = i[15 - r]
            },
            encryptBlock: function (e, t) {
                this._doCryptBlock(e, t, this._subKeys)
            },
            decryptBlock: function (e, t) {
                this._doCryptBlock(e, t, this._invSubKeys)
            },
            _doCryptBlock: function (e, t, r) {
                this._lBlock = e[t], this._rBlock = e[t + 1], g.call(this, 4, 252645135), g.call(this, 16, 65535), p.call(this, 2, 858993459), p.call(this, 8, 16711935), g.call(this, 1, 1431655765);
                for (var s = 0; s < 16; s++) {
                    for (var i = r[s], n = this._lBlock, o = this._rBlock, a = 0, c = 0; c < 8; c++) a |= u[c][((o ^ i[c]) & m[c]) >>> 0];
                    this._lBlock = o, this._rBlock = n ^ a
                }
                var d = this._lBlock;
                this._lBlock = this._rBlock, this._rBlock = d, g.call(this, 1, 1431655765), p.call(this, 8, 16711935), p.call(this, 2, 858993459), g.call(this, 16, 65535), g.call(this, 4, 252645135), e[t] = this._lBlock, e[t + 1] = this._rBlock
            },
            keySize: 2,
            ivSize: 2,
            blockSize: 2
        }), t.DES = r._createHelper(i), n = n.TripleDES = r.extend({
            _doReset: function () {
                var e = this._key.words;
                if (2 !== e.length && 4 !== e.length && e.length < 6) throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
                var t = e.slice(0, 2),
                    r = e.length < 4 ? e.slice(0, 2) : e.slice(2, 4),
                    e = e.length < 6 ? e.slice(0, 2) : e.slice(4, 6);
                this._des1 = i.createEncryptor(s.create(t)), this._des2 = i.createEncryptor(s.create(r)), this._des3 = i.createEncryptor(s.create(e))
            },
            encryptBlock: function (e, t) {
                this._des1.encryptBlock(e, t), this._des2.decryptBlock(e, t), this._des3.encryptBlock(e, t)
            },
            decryptBlock: function (e, t) {
                this._des3.decryptBlock(e, t), this._des2.encryptBlock(e, t), this._des1.decryptBlock(e, t)
            },
            keySize: 6,
            ivSize: 2,
            blockSize: 2
        }), t.TripleDES = r._createHelper(n), e.TripleDES)), gr;

        function g(e, t) {
            t = (this._lBlock >>> e ^ this._rBlock) & t;
            this._rBlock ^= t, this._lBlock ^= t << e
        }

        function p(e, t) {
            t = (this._rBlock >>> e ^ this._lBlock) & t;
            this._lBlock ^= t, this._rBlock ^= t << e
        }
    }
    var yr, vr = {},
        wr = {
            get exports() {
                return vr
            },
            set exports(e) {
                vr = e
            }
        };
    var Ar, _r = {},
        br = {
            get exports() {
                return _r
            },
            set exports(e) {
                _r = e
            }
        };
    var Sr, xr, a, d, l, Tr, m, g, p, Pr, Rr, Cr, kr, Ir, Er, Br, Dr, Nr, Or, Fr, qr, Mr, r, Lr, jr, Hr, Ur, zr, $r, Wr, Gr, Kr, Yr, Vr, Jr, y, v, Qr, Xr, w, Zr, es, ts, A, rs, ss, is = {},
        ns = {
            get exports() {
                return is
            },
            set exports(e) {
                is = e
            }
        };

    function os() {
        for (var e = this._X, t = this._C, r = 0; r < 8; r++) d[r] = t[r];
        t[0] = t[0] + 1295307597 + this._b | 0, t[1] = t[1] + 3545052371 + (t[0] >>> 0 < d[0] >>> 0 ? 1 : 0) | 0, t[2] = t[2] + 886263092 + (t[1] >>> 0 < d[1] >>> 0 ? 1 : 0) | 0, t[3] = t[3] + 1295307597 + (t[2] >>> 0 < d[2] >>> 0 ? 1 : 0) | 0, t[4] = t[4] + 3545052371 + (t[3] >>> 0 < d[3] >>> 0 ? 1 : 0) | 0, t[5] = t[5] + 886263092 + (t[4] >>> 0 < d[4] >>> 0 ? 1 : 0) | 0, t[6] = t[6] + 1295307597 + (t[5] >>> 0 < d[5] >>> 0 ? 1 : 0) | 0, t[7] = t[7] + 3545052371 + (t[6] >>> 0 < d[6] >>> 0 ? 1 : 0) | 0, this._b = t[7] >>> 0 < d[7] >>> 0 ? 1 : 0;
        for (r = 0; r < 8; r++) {
            var s = e[r] + t[r],
                i = 65535 & s,
                n = s >>> 16;
            l[r] = ((i * i >>> 17) + i * n >>> 15) + n * n ^ ((4294901760 & s) * s | 0) + ((65535 & s) * s | 0)
        }
        e[0] = l[0] + (l[7] << 16 | l[7] >>> 16) + (l[6] << 16 | l[6] >>> 16) | 0, e[1] = l[1] + (l[0] << 8 | l[0] >>> 24) + l[7] | 0, e[2] = l[2] + (l[1] << 16 | l[1] >>> 16) + (l[0] << 16 | l[0] >>> 16) | 0, e[3] = l[3] + (l[2] << 8 | l[2] >>> 24) + l[1] | 0, e[4] = l[4] + (l[3] << 16 | l[3] >>> 16) + (l[2] << 16 | l[2] >>> 16) | 0, e[5] = l[5] + (l[4] << 8 | l[4] >>> 24) + l[3] | 0, e[6] = l[6] + (l[5] << 16 | l[5] >>> 16) + (l[4] << 16 | l[4] >>> 16) | 0, e[7] = l[7] + (l[6] << 8 | l[6] >>> 24) + l[5] | 0
    }

    function as() {
        for (var e = this._X, t = this._C, r = 0; r < 8; r++) g[r] = t[r];
        t[0] = t[0] + 1295307597 + this._b | 0, t[1] = t[1] + 3545052371 + (t[0] >>> 0 < g[0] >>> 0 ? 1 : 0) | 0, t[2] = t[2] + 886263092 + (t[1] >>> 0 < g[1] >>> 0 ? 1 : 0) | 0, t[3] = t[3] + 1295307597 + (t[2] >>> 0 < g[2] >>> 0 ? 1 : 0) | 0, t[4] = t[4] + 3545052371 + (t[3] >>> 0 < g[3] >>> 0 ? 1 : 0) | 0, t[5] = t[5] + 886263092 + (t[4] >>> 0 < g[4] >>> 0 ? 1 : 0) | 0, t[6] = t[6] + 1295307597 + (t[5] >>> 0 < g[5] >>> 0 ? 1 : 0) | 0, t[7] = t[7] + 3545052371 + (t[6] >>> 0 < g[6] >>> 0 ? 1 : 0) | 0, this._b = t[7] >>> 0 < g[7] >>> 0 ? 1 : 0;
        for (r = 0; r < 8; r++) {
            var s = e[r] + t[r],
                i = 65535 & s,
                n = s >>> 16;
            p[r] = ((i * i >>> 17) + i * n >>> 15) + n * n ^ ((4294901760 & s) * s | 0) + ((65535 & s) * s | 0)
        }
        e[0] = p[0] + (p[7] << 16 | p[7] >>> 16) + (p[6] << 16 | p[6] >>> 16) | 0, e[1] = p[1] + (p[0] << 8 | p[0] >>> 24) + p[7] | 0, e[2] = p[2] + (p[1] << 16 | p[1] >>> 16) + (p[0] << 16 | p[0] >>> 16) | 0, e[3] = p[3] + (p[2] << 8 | p[2] >>> 24) + p[1] | 0, e[4] = p[4] + (p[3] << 16 | p[3] >>> 16) + (p[2] << 16 | p[2] >>> 16) | 0, e[5] = p[5] + (p[4] << 8 | p[4] >>> 24) + p[3] | 0, e[6] = p[6] + (p[5] << 16 | p[5] >>> 16) + (p[4] << 16 | p[4] >>> 16) | 0, e[7] = p[7] + (p[6] << 8 | p[6] >>> 24) + p[5] | 0
    }

    function cs() {
        for (var e = this._S, t = this._i, r = this._j, s = 0, i = 0; i < 4; i++) {
            var r = (r + e[t = (t + 1) % 256]) % 256,
                n = e[t];
            e[t] = e[r], e[r] = n, s |= e[(e[t] + e[r]) % 256] << 24 - 8 * i
        }
        return this._i = t, this._j = r, s
    }

    function ds(e, t, r) {
        return e & t | ~e & r
    }

    function ls(e, t, r) {
        return e & r | t & ~r
    }

    function hs(e, t) {
        return e << t | e >>> 32 - t
    }

    function us(e, t, r) {
        for (var s, i, n = [], o = 0, a = 0; a < t; a++) a % 4 && (s = r[e.charCodeAt(a - 1)] << a % 4 * 2, i = r[e.charCodeAt(a)] >>> 6 - a % 4 * 2, n[o >>> 2] |= (s | i) << 24 - o % 4 * 8, o++);
        return ss.create(n, o)
    }
    e.exports = (e = f(), Pe(), Ie(), Ne(), Me(), xr || (xr = 1, je.exports = (rs = f(), ss = rs.lib.WordArray, rs.enc.Base64url = {
        stringify: function (e, t = !0) {
            for (var r = e.words, s = e.sigBytes, i = t ? this._safe_map : this._map, n = (e.clamp(), []), o = 0; o < s; o += 3)
                for (var a = (r[o >>> 2] >>> 24 - o % 4 * 8 & 255) << 16 | (r[o + 1 >>> 2] >>> 24 - (o + 1) % 4 * 8 & 255) << 8 | r[o + 2 >>> 2] >>> 24 - (o + 2) % 4 * 8 & 255, c = 0; c < 4 && o + .75 * c < s; c++) n.push(i.charAt(a >>> 6 * (3 - c) & 63));
            var d = i.charAt(64);
            if (d)
                for (; n.length % 4;) n.push(d);
            return n.join("")
        },
        parse: function (e, t = !0) {
            var r = e.length,
                s = t ? this._safe_map : this._map;
            if (!(i = this._reverseMap))
                for (var i = this._reverseMap = [], n = 0; n < s.length; n++) i[s.charCodeAt(n)] = n;
            var t = s.charAt(64);
            return t && -1 !== (t = e.indexOf(t)) && (r = t), us(e, r, i)
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    }, rs.enc.Base64url)), $e(), Ye(), Xe(), Tr || (Tr = 1, et.exports = (rs = f(), Xe(), es = (Zr = rs).lib.WordArray, A = Zr.algo, ts = A.SHA256, A = A.SHA224 = ts.extend({
        _doReset: function () {
            this._hash = new es.init([3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428])
        },
        _doFinalize: function () {
            var e = ts._doFinalize.call(this);
            return e.sigBytes -= 4, e
        }
    }), Zr.SHA224 = ts._createHelper(A), Zr.HmacSHA224 = ts._createHmacHelper(A), rs.SHA224)), it(), ms || (ms = 1, ot.exports = (Zr = f(), Pe(), it(), w = (A = Zr).x64, v = w.Word, Qr = w.WordArray, w = A.algo, Xr = w.SHA512, w = w.SHA384 = Xr.extend({
        _doReset: function () {
            this._hash = new Qr.init([new v.init(3418070365, 3238371032), new v.init(1654270250, 914150663), new v.init(2438529370, 812702999), new v.init(355462360, 4144912697), new v.init(1731405415, 4290775857), new v.init(2394180231, 1750603025), new v.init(3675008525, 1694076839), new v.init(1203062813, 3204075428)])
        },
        _doFinalize: function () {
            var e = Xr._doFinalize.call(this);
            return e.sigBytes -= 16, e
        }
    }), A.SHA384 = Xr._createHelper(w), A.HmacSHA384 = Xr._createHmacHelper(w), Zr.SHA384)), lt(), S || (S = 1, ut.exports = (w = f(), y = (Ur = w).lib, zr = y.WordArray, $r = y.Hasher, y = Ur.algo, Wr = zr.create([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13]), Gr = zr.create([5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]), Kr = zr.create([11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6]), Yr = zr.create([8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]), Vr = zr.create([0, 1518500249, 1859775393, 2400959708, 2840853838]), Jr = zr.create([1352829926, 1548603684, 1836072691, 2053994217, 0]), y = y.RIPEMD160 = $r.extend({
        _doReset: function () {
            this._hash = zr.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
        },
        _doProcessBlock: function (e, t) {
            for (var r = 0; r < 16; r++) {
                var s = t + r,
                    i = e[s];
                e[s] = 16711935 & (i << 8 | i >>> 24) | 4278255360 & (i << 24 | i >>> 8)
            }
            for (var n, o, a, c, d, l, h = this._hash.words, u = Vr.words, m = Jr.words, g = Wr.words, p = Gr.words, f = Kr.words, y = Yr.words, v = n = h[0], w = o = h[1], A = a = h[2], _ = c = h[3], b = d = h[4], r = 0; r < 80; r += 1) l = (l = hs(l = (l = n + e[t + g[r]] | 0) + (r < 16 ? (o ^ a ^ c) + u[0] : r < 32 ? ds(o, a, c) + u[1] : r < 48 ? ((o | ~a) ^ c) + u[2] : r < 64 ? ls(o, a, c) + u[3] : (o ^ (a | ~c)) + u[4]) | 0, f[r])) + d | 0, n = d, d = c, c = hs(a, 10), a = o, o = l, l = (l = hs(l = (l = v + e[t + p[r]] | 0) + (r < 16 ? (w ^ (A | ~_)) + m[0] : r < 32 ? ls(w, A, _) + m[1] : r < 48 ? ((w | ~A) ^ _) + m[2] : r < 64 ? ds(w, A, _) + m[3] : (w ^ A ^ _) + m[4]) | 0, y[r])) + b | 0, v = b, b = _, _ = hs(A, 10), A = w, w = l;
            l = h[1] + a + _ | 0, h[1] = h[2] + c + b | 0, h[2] = h[3] + d + v | 0, h[3] = h[4] + n + w | 0, h[4] = h[0] + o + A | 0, h[0] = l
        },
        _doFinalize: function () {
            for (var e = this._data, t = e.words, r = 8 * this._nDataBytes, s = 8 * e.sigBytes, s = (t[s >>> 5] |= 128 << 24 - s % 32, t[14 + (64 + s >>> 9 << 4)] = 16711935 & (r << 8 | r >>> 24) | 4278255360 & (r << 24 | r >>> 8), e.sigBytes = 4 * (t.length + 1), this._process(), this._hash), i = s.words, n = 0; n < 5; n++) {
                var o = i[n];
                i[n] = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8)
            }
            return s
        },
        clone: function () {
            var e = $r.clone.call(this);
            return e._hash = this._hash.clone(), e
        }
    }), Ur.RIPEMD160 = $r._createHelper(y), Ur.HmacRIPEMD160 = $r._createHmacHelper(y), w.RIPEMD160)), ft(), x || (x = 1, vt.exports = (Ur = f(), Ye(), ft(), r = (y = Ur).lib, qr = r.Base, Mr = r.WordArray, r = y.algo, Lr = r.SHA1, jr = r.HMAC, Hr = r.PBKDF2 = qr.extend({
        cfg: qr.extend({
            keySize: 4,
            hasher: Lr,
            iterations: 1
        }),
        init: function (e) {
            this.cfg = this.cfg.extend(e)
        },
        compute: function (e, t) {
            for (var r = this.cfg, s = jr.create(r.hasher, e), i = Mr.create(), n = Mr.create([1]), o = i.words, a = n.words, c = r.keySize, d = r.iterations; o.length < c;) {
                for (var l = s.update(t).finalize(n), h = (s.reset(), l.words), u = h.length, m = l, g = 1; g < d; g++) {
                    m = s.finalize(m), s.reset();
                    for (var p = m.words, f = 0; f < u; f++) h[f] ^= p[f]
                }
                i.concat(l), a[0]++
            }
            return i.sigBytes = 4 * c, i
        }
    }), y.PBKDF2 = function (e, t, r) {
        return Hr.create(r).compute(e, t)
    }, Ur.PBKDF2)), bt(), o(), kt(), Dt(), qt(), Ht(), Ut || (Ut = 1, $t.exports = (Fr = f(), o(), Fr.mode.ECB = function () {
        var e = Fr.lib.BlockCipherMode.extend();
        return e.Encryptor = e.extend({
            processBlock: function (e, t) {
                this._cipher.encryptBlock(e, t)
            }
        }), e.Decryptor = e.extend({
            processBlock: function (e, t) {
                this._cipher.decryptBlock(e, t)
            }
        }), e
    }(), Fr.mode.ECB)), Wt || (Wt = 1, Kt.exports = (r = f(), o(), r.pad.AnsiX923 = {
        pad: function (e, t) {
            var r = e.sigBytes,
                t = 4 * t,
                t = t - r % t,
                r = r + t - 1;
            e.clamp(), e.words[r >>> 2] |= t << 24 - r % 4 * 8, e.sigBytes += t
        },
        unpad: function (e) {
            var t = 255 & e.words[e.sigBytes - 1 >>> 2];
            e.sigBytes -= t
        }
    }, r.pad.Ansix923)), Yt || (Yt = 1, Jt.exports = (Or = f(), o(), Or.pad.Iso10126 = {
        pad: function (e, t) {
            t *= 4, t -= e.sigBytes % t;
            e.concat(Or.lib.WordArray.random(t - 1)).concat(Or.lib.WordArray.create([t << 24], 1))
        },
        unpad: function (e) {
            var t = 255 & e.words[e.sigBytes - 1 >>> 2];
            e.sigBytes -= t
        }
    }, Or.pad.Iso10126)), Qt || (Qt = 1, Zt.exports = (Nr = f(), o(), Nr.pad.Iso97971 = {
        pad: function (e, t) {
            e.concat(Nr.lib.WordArray.create([2147483648], 1)), Nr.pad.ZeroPadding.pad(e, t)
        },
        unpad: function (e) {
            Nr.pad.ZeroPadding.unpad(e), e.sigBytes--
        }
    }, Nr.pad.Iso97971)), er || (er = 1, rr.exports = (qr = f(), o(), qr.pad.ZeroPadding = {
        pad: function (e, t) {
            t *= 4;
            e.clamp(), e.sigBytes += t - (e.sigBytes % t || t)
        },
        unpad: function (e) {
            for (var t = e.words, r = e.sigBytes - 1, r = e.sigBytes - 1; 0 <= r; r--)
                if (t[r >>> 2] >>> 24 - r % 4 * 8 & 255) {
                    e.sigBytes = r + 1;
                    break
                }
        }
    }, qr.pad.ZeroPadding)), sr || (sr = 1, nr.exports = (Lr = f(), o(), Lr.pad.NoPadding = {
        pad: function () { },
        unpad: function () { }
    }, Lr.pad.NoPadding)), or || (or = 1, cr.exports = (Er = f(), o(), Br = Er.lib.CipherParams, Dr = Er.enc.Hex, Er.format.Hex = {
        stringify: function (e) {
            return e.ciphertext.toString(Dr)
        },
        parse: function (e) {
            e = Dr.parse(e);
            return Br.create({
                ciphertext: e
            })
        }
    }, Er.format.Hex)), ur(), fr(), yr || (yr = 1, wr.exports = (Er = f(), Me(), $e(), bt(), o(), Cr = (Rr = Er).lib.StreamCipher, Ir = Rr.algo, kr = Ir.RC4 = Cr.extend({
        _doReset: function () {
            for (var e = this._key, t = e.words, r = e.sigBytes, s = this._S = [], i = 0; i < 256; i++) s[i] = i;
            for (var i = 0, n = 0; i < 256; i++) {
                var o = i % r,
                    o = t[o >>> 2] >>> 24 - o % 4 * 8 & 255,
                    n = (n + s[i] + o) % 256,
                    o = s[i];
                s[i] = s[n], s[n] = o
            }
            this._i = this._j = 0
        },
        _doProcessBlock: function (e, t) {
            e[t] ^= cs.call(this)
        },
        keySize: 8,
        ivSize: 0
    }), Rr.RC4 = Cr._createHelper(kr), Ir = Ir.RC4Drop = kr.extend({
        cfg: kr.cfg.extend({
            drop: 192
        }),
        _doReset: function () {
            kr._doReset.call(this);
            for (var e = this.cfg.drop; 0 < e; e--) cs.call(this)
        }
    }), Rr.RC4Drop = Cr._createHelper(Ir), Er.RC4)), Ar || (Ar = 1, br.exports = (Rr = f(), Me(), $e(), bt(), o(), Ir = (Cr = Rr).lib.StreamCipher, Pr = Cr.algo, m = [], g = [], p = [], Pr = Pr.Rabbit = Ir.extend({
        _doReset: function () {
            for (var e = this._key.words, t = this.cfg.iv, r = 0; r < 4; r++) e[r] = 16711935 & (e[r] << 8 | e[r] >>> 24) | 4278255360 & (e[r] << 24 | e[r] >>> 8);
            for (var s = this._X = [e[0], e[3] << 16 | e[2] >>> 16, e[1], e[0] << 16 | e[3] >>> 16, e[2], e[1] << 16 | e[0] >>> 16, e[3], e[2] << 16 | e[1] >>> 16], i = this._C = [e[2] << 16 | e[2] >>> 16, 4294901760 & e[0] | 65535 & e[1], e[3] << 16 | e[3] >>> 16, 4294901760 & e[1] | 65535 & e[2], e[0] << 16 | e[0] >>> 16, 4294901760 & e[2] | 65535 & e[3], e[1] << 16 | e[1] >>> 16, 4294901760 & e[3] | 65535 & e[0]], r = this._b = 0; r < 4; r++) as.call(this);
            for (r = 0; r < 8; r++) i[r] ^= s[r + 4 & 7];
            if (t) {
                var t = t.words,
                    n = t[0],
                    t = t[1],
                    n = 16711935 & (n << 8 | n >>> 24) | 4278255360 & (n << 24 | n >>> 8),
                    t = 16711935 & (t << 8 | t >>> 24) | 4278255360 & (t << 24 | t >>> 8),
                    o = n >>> 16 | 4294901760 & t,
                    a = t << 16 | 65535 & n;
                i[0] ^= n, i[1] ^= o, i[2] ^= t, i[3] ^= a, i[4] ^= n, i[5] ^= o, i[6] ^= t, i[7] ^= a;
                for (r = 0; r < 4; r++) as.call(this)
            }
        },
        _doProcessBlock: function (e, t) {
            var r = this._X;
            as.call(this), m[0] = r[0] ^ r[5] >>> 16 ^ r[3] << 16, m[1] = r[2] ^ r[7] >>> 16 ^ r[5] << 16, m[2] = r[4] ^ r[1] >>> 16 ^ r[7] << 16, m[3] = r[6] ^ r[3] >>> 16 ^ r[1] << 16;
            for (var s = 0; s < 4; s++) m[s] = 16711935 & (m[s] << 8 | m[s] >>> 24) | 4278255360 & (m[s] << 24 | m[s] >>> 8), e[t + s] ^= m[s]
        },
        blockSize: 4,
        ivSize: 2
    }), Cr.Rabbit = Ir._createHelper(Pr), Rr.Rabbit)), Sr || (Sr = 1, ns.exports = (Pr = f(), Me(), $e(), bt(), o(), je = (xr = Pr).lib.StreamCipher, Tr = xr.algo, a = [], d = [], l = [], Tr = Tr.RabbitLegacy = je.extend({
        _doReset: function () {
            for (var e = this._key.words, t = this.cfg.iv, r = this._X = [e[0], e[3] << 16 | e[2] >>> 16, e[1], e[0] << 16 | e[3] >>> 16, e[2], e[1] << 16 | e[0] >>> 16, e[3], e[2] << 16 | e[1] >>> 16], s = this._C = [e[2] << 16 | e[2] >>> 16, 4294901760 & e[0] | 65535 & e[1], e[3] << 16 | e[3] >>> 16, 4294901760 & e[1] | 65535 & e[2], e[0] << 16 | e[0] >>> 16, 4294901760 & e[2] | 65535 & e[3], e[1] << 16 | e[1] >>> 16, 4294901760 & e[3] | 65535 & e[0]], i = this._b = 0; i < 4; i++) os.call(this);
            for (i = 0; i < 8; i++) s[i] ^= r[i + 4 & 7];
            if (t) {
                var e = t.words,
                    t = e[0],
                    e = e[1],
                    t = 16711935 & (t << 8 | t >>> 24) | 4278255360 & (t << 24 | t >>> 8),
                    e = 16711935 & (e << 8 | e >>> 24) | 4278255360 & (e << 24 | e >>> 8),
                    n = t >>> 16 | 4294901760 & e,
                    o = e << 16 | 65535 & t;
                s[0] ^= t, s[1] ^= n, s[2] ^= e, s[3] ^= o, s[4] ^= t, s[5] ^= n, s[6] ^= e, s[7] ^= o;
                for (i = 0; i < 4; i++) os.call(this)
            }
        },
        _doProcessBlock: function (e, t) {
            var r = this._X;
            os.call(this), a[0] = r[0] ^ r[5] >>> 16 ^ r[3] << 16, a[1] = r[2] ^ r[7] >>> 16 ^ r[5] << 16, a[2] = r[4] ^ r[1] >>> 16 ^ r[7] << 16, a[3] = r[6] ^ r[3] >>> 16 ^ r[1] << 16;
            for (var s = 0; s < 4; s++) a[s] = 16711935 & (a[s] << 8 | a[s] >>> 24) | 4278255360 & (a[s] << 24 | a[s] >>> 8), e[t + s] ^= a[s]
        },
        blockSize: 4,
        ivSize: 2
    }), xr.RabbitLegacy = je._createHelper(Tr), Pr.RabbitLegacy)), e);
    var _, b, ms, gs, ps, S, fs, ys, x, T, vs = we;
    class P { }
    P.PAY_IP = "https://purchase2.minigame.vip", P.MINI_ORDER_ID = "v2/purchase/miniorder", P.SET_DATA = "v1/archive", P.GET_DATA = "v1/archive", P.STORAGE_IP = "https://storage.minigame.vip:30443";
    class ws { }
    ws.ADS_NETWORK_NOT_FOUND = "ADS_NETWORK_NOT_FOUND";
    class As { }
    As.DOMAIN = "https://ingress.minigame.vip:30443", As.TESTDOMAIN = "https://app.minigame.work:19443", As.API_PATH = "/v1/mam/api/mda/random", As.BATCH_API_PATH = "/v1/mam/api/mda/batch_random";
    class _s { }
    _s.ADFLY_REPORT_URL = "https://cpl.minigame.work:19443/v1/event-publish/api/event/publish", _s.ADFLY_REPORT_DOMAIN = "https://ingress.minigame.vip:30443", _s.ADFLY_REPORT_PUBLISH = "v1/event-publish/api/event/publish";
    const bs = class mn {
        constructor() {
            this.handleUrl = e => t => {
                if (t) {
                    const r = [];
                    Object.keys(t).forEach(e => r.push("keys=" + t[e])), -1 === e.search(/\?/) ? "object" == typeof t && (e += "?" + r.join("&")) : e += "&" + r.join("&")
                }
                return e
            }
        }
        static get instance() {
            return this._instance || (this._instance = new mn), this._instance
        }
        getDataAsync(a) {
            return h(this, void 0, void 0, function* () {
                console.info("====> getData userId: ", Bs.getUserId()), "" === Bs.getUserId() && console.error("=====> userId is null");
                var e = q.get,
                    t = `${c.channelName}_${c.channel}_${c.gameId}_` + Bs.getUserId(),
                    r = (console.info("get data id: ", t), (new Date).toUTCString().toString()),
                    s = vs.enc.Base64,
                    i = vs.HmacSHA512;
                let n = `/${P.GET_DATA}/${t}?`,
                    o = `${P.PAY_IP}/dev/${P.GET_DATA}/${t}?`;
                return a.forEach((e, t) => {
                    0 !== t && (o += "&", n += "&"), o += "keys=" + e, n += "keys=" + e
                }), t = s.stringify(i(`(request-target): get ${n}
x-date: ${r}
digest: `, "HMACSHA512-SecretKey")), (s = new Headers).append("Authorization", `Signature keyId="write",algorithm="hmac-sha512",headers="(request-target) x-date digest",signature="${t}"`), s.append("x-date", r), i = {
                        method: e,
                        headers: s,
                        redirect: "follow"
                    }, yield fetch(o, i).then(e => e.ok ? e.json() : Promise.reject({
                        code: e.status,
                        message: `get ${o} fail status: ` + e.status
                    })).then(e => (console.info(`get ${o} success response: ` + JSON.stringify(e)), Promise.resolve(e.data))).catch(e => (console.error(`get ${o} error: ` + e.message), Promise.reject({
                        code: "CloudStorage getData error",
                        message: e.message
                    })))
            })
        }
        setDataAsync(a) {
            return h(this, void 0, void 0, function* () {
                "" === Bs.getUserId() && console.error("=====> userId is null");
                var e = q.post,
                    t = (new Date).toUTCString().toString(),
                    r = vs.SHA256,
                    s = vs.enc.Base64,
                    i = vs.HmacSHA512,
                    n = `${c.channelName}_${c.channel}_${c.gameId}_` + Bs.getUserId(),
                    n = (console.info("set data id: ", n), {
                        id: n,
                        data: a
                    }),
                    r = "SHA-256=" + s.stringify(r(JSON.stringify(n))),
                    s = s.stringify(i(`(request-target): post /${P.SET_DATA}
x-date: ${t}
digest: ` + r, "HMACSHA512-SecretKey")),
                    s = ((i = new Headers).append("Authorization", `Signature keyId="write",algorithm="hmac-sha512",headers="(request-target) x-date digest",signature="${s}"`), i.append("Content-Type", "application/json"), i.append("x-date", t), i.append("digest", r), {
                        method: e,
                        headers: i,
                        body: JSON.stringify(n)
                    });
                const o = P.PAY_IP + "/dev/" + P.SET_DATA;
                return console.info("=====> cloudStorage setData: ", JSON.stringify(n)), yield fetch(o, s).then(e => e.ok ? e.json() : Promise.reject({
                    code: e.status,
                    message: `post ${o} fail status: ` + e.status
                })).then(e => (console.info(`post ${o} success response: ` + JSON.stringify(e)), Promise.resolve())).catch(e => (console.error("CloudStorage setData error: " + e.message), Promise.reject({
                    message: "CloudStorage setData error: " + e.message
                })))
            })
        }
    }.instance;
    const Ss = class gn {
        static get instance() {
            return this._instance || (this._instance = new gn), this._instance
        }
        init() { }
        getDataAsync(e) {
            if (!e || 0 === e.length) return Promise.reject({
                message: "LocalStorage getData keys null"
            });
            var t = {};
            for (const r of e) t[r] = pe(r);
            return console.info("======> get local data: ", t), Promise.resolve(t)
        }
        setDataAsync(e) {
            if (!e) return Promise.reject({
                message: "LocalStorage setData data null"
            });
            for (const t in e) fe(t, e[t]);
            return ye(), console.info("======> set local data: ", e), Promise.resolve()
        }
    }.instance;
    (et = _ = _ || {}).Local = "Local", et.Cloud = "Cloud", et.None = "None", (ms = b = b || {}).GuestUid = "guestUid", ms.UserPhone = "userPhone", ms.StorageType = "storageType";
    const R = class pn {
        constructor() {
            this._storageType = _.None, this._guestUid = "", this._userPhone = ""
        }
        static get instance() {
            return this._instance || (this._instance = new pn), this._instance
        }
        init() {
            Ss.init()
        }
        set storageType(e) {
            this._storageType = e, fe(b.StorageType, this._storageType), ye()
        }
        get storageType() {
            return pe(b.StorageType) && (this._storageType = pe(b.StorageType)), this._storageType
        }
        set guestUid(e) {
            this._guestUid = e, fe(b.GuestUid, this._guestUid), ye()
        }
        get guestUid() {
            return pe(b.GuestUid) && (this._guestUid = pe(b.GuestUid)), this._guestUid
        }
        set userPhone(e) {
            this._userPhone = e, fe(b.UserPhone, this._userPhone), ye()
        }
        get userPhone() {
            return pe(b.UserPhone) && (this._userPhone = pe(b.UserPhone)), this._userPhone
        }
        isNewUser() {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = ge,
                        t = Object.keys(e),
                        r = yield bs.getDataAsync(t), s = !r;
                    return console.info(`====> check keys: ${t}/
 getData: ${r}
 !!getData: ` + s), Promise.resolve(s)
                } catch (e) {
                    return console.error("isNewUser error: " + e.message), Promise.reject({
                        code: "isNewUser error",
                        message: e.message
                    })
                }
            })
        }
        checkNewUser() {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = yield this.isNewUser();
                    return e ? yield this.dealBindingAccountSuccess() : this.dealExistAccountBinding(), Promise.resolve(e)
                } catch (e) {
                    return console.error("checkNewUser error: " + e.message), Promise.reject({
                        code: "checkNewUser error",
                        message: "" + e.message
                    })
                }
            })
        }
        dealExistAccountBinding() {
            var e = {
                btnName: "SWITCH"
            };
            e.message = `Sorry,This account already exists,
please change a new account.

If you want switch account,
please click the button.`, e.btnFunc = () => {
                    xs.show()
                }, Rs.init(e), Rs.show()
        }
        dealBindingAccountSuccess() {
            return h(this, void 0, void 0, function* () {
                try {
                    return yield bs.setDataAsync(ge), Ps.success({
                        message: "Register success.",
                        autoCloseTime: 2,
                        top: "50%",
                        left: "50%"
                    }), Promise.resolve()
                } catch (e) {
                    return Ps.success({
                        message: "Register fail.",
                        autoCloseTime: 2,
                        top: "50%",
                        left: "50%"
                    }), Promise.reject({
                        code: "fail save local data to cloud",
                        message: e.message
                    })
                }
            })
        }
        getDataAsync(e) {
            return (this._storageType === _.Cloud ? bs : Ss).getDataAsync(e)
        }
        setDataAsync(e) {
            return (this._storageType === _.Cloud ? bs : Ss).setDataAsync(e)
        }
    }.instance,
        C = {
            addCallbackEvent(e) {
                e && 0 < e.length && e.forEach(t => {
                    t.ele && t.ele.addEventListener(t.eventName, e => {
                        t.eventFunc && t.eventFunc(e)
                    })
                })
            },
            createDailogContainer(e) {
                let t = document.getElementById("minigameDailogContainer");
                return t || ((t = document.createElement("div")).setAttribute("id", "minigameDailogContainer"), t.setAttribute("style", `${e ? "display:none;" : ""}font-size: 16px;font-family: Microsoft YaHei;font-weight: 400; position: fixed;top:0;  z-index: 20000; overflow: hidden; width: 100vw;height: 100vh; background-color: rgb(0, 0, 0,0.6);`), document.body.append(t)), t
            },
            removeDailogContainer(e) {
                var t = document.getElementById("minigameDailogContainer");
                t && t.childNodes && t.childNodes.length <= 1 ? t && t.remove() : e && e instanceof Function && e()
            }
        },
        xs = {
            currentCtx: null,
            show() {
                const i = document.createElement("div");
                i.setAttribute("style", "position: absolute;z-index:1;width:100%;height:100%"), i.innerHTML = `    
      <div style="position: absolute;  left: 0;    top: 0;  bottom: 0;  right: 0;  margin: auto;  width: 289px;  height: 289px;   background: #FFFFFF; box-shadow: 0px 2px 7px 0px rgba(143, 143, 143, 0.48);  border-radius: 11px;    display: flex;flex-direction: column;align-items: center;justify-content: center;   ">
          <div id="registerCloseBtn" style="position: absolute;right: 10px;top: 10px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path style="fill: #4398FE "
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z">
                  </path>
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
              </svg>
          </div>
          <div id="registerError" style="position: absolute;right: 37px;top: 139px;font-size: 6px;font-weight: 400;color: #FB4242;"></div>
          <div style="width: 202px;height: 17px;font-size: 15px;font-family: Microsoft YaHei;font-weight: bold;color: #010101;">Login with Phone Number</div>
          <div style="margin-top:15px;width: 218px;height: 30px;border: 1px solid #BABABA;border-radius: 6px;display: flex;flex-direction: row;align-items: center;justify-content: center;"><div style="    width: 46px;border-right: 1px solid #CECECE ;"><select style="border: none;outline: none;" name="registerAreacode" id="registerAreacode">
              <option value="91">+91</option>
              <option value="1">+1</option>
          </select></div><div style="flex: 1;"><input style="font-size: 12px;font-family: Microsoft YaHei;font-weight: 400;color: #515151;;background-color:transparent;border:0;width:90%;outline:none;margin-left: 6px;"
              type="text" id="registerPhone" name="registerPhone" required placeholder="Please fill in the phone"></div></div>
          <div id="registerSendBtn" style="margin-top:12px;font-size: 12px;font-family: Microsoft YaHei;font-weight: 400;color: #FFFFFF;width: 218px;height: 35px;background: #4398FE;border-radius: 6px;display: flex;flex-direction: column;align-items: center;justify-content: center;">Send</div>                    
          <div id="registerSendText" style="display: none;;text-align: center;margin-top:11px;font-size: 10px;font-family: Microsoft YaHei;font-weight: 400;color: #FFFFFF;width: 218px;height: 35px;background: #BABABA;border-radius: 6px;    padding-top: 3px;box-sizing: border-box;">Wait tor <span id="registerTime">60</span> s <br>To Request Another Code</div>
          <div style="margin-top:15px;width: 218px;height: 30px;border: 1px solid #BABABA;border-radius: 6px;display: flex;flex-direction: column;align-items: center;justify-content: center;"><input style="font-size: 12px;font-family: Microsoft YaHei;font-weight: 400;color: #515151;;background-color:transparent;border:0;width:90%;outline:none" type="text" id="registerVfcode" name="registerVfcode" required placeholder="Verification Code"> </div>
          <div id="registerLoginBtn" style="margin-top:12px;font-size: 12px;font-family: Microsoft YaHei;font-weight: 400;color: #FFFFFF;width: 218px;height: 35px;background: #4398FE;border-radius: 6px;display: flex;flex-direction: column;align-items: center;justify-content: center;">Login</div>
          <div style="margin-top: 15px;    text-align: center;width: 210px;height: 17px;font-size: 8px;font-family: Microsoft YaHei;font-weight: 400;color: #010101;">By proceeding, you agree to our <span><a href="" target="_blank" style="color: #4398FE;" > Terms & Conditions</a></span>& <span><a href="" target="_blank" style="color: #4398FE;">Privacy Policy.</a></span></div>
      </div>`, C.createDailogContainer().append(i), (this.currentCtx = i) && (this.initRegisterUi([91, 86]), C.addCallbackEvent([{
                    ele: i.querySelector("#registerCloseBtn"),
                    eventName: "click",
                    eventFunc: () => {
                        this.hide()
                    }
                }, {
                    ele: i.querySelector("#registerSendBtn"),
                    eventName: "click",
                    eventFunc: () => h(this, void 0, void 0, function* () {
                        i.querySelector("#registerSendBtn") && (i.querySelector("#registerSendBtn").style.display = "none"), i.querySelector("#registerSendText") && (i.querySelector("#registerSendText").style.display = "block"), this.countdownFunc(60);
                        try {
                            var e = "" + (document.getElementById("registerAreacode") && document.getElementById("registerAreacode").value || "") + (document.getElementById("registerPhone") && document.getElementById("registerPhone").value || "");
                            yield ks.sendVerifyCode(e), console.info("sendVerifyCode success")
                        } catch (e) {
                            console.error("sendVerifyCode error", e)
                        }
                    })
                }, {
                    ele: i.querySelector("#registerLoginBtn"),
                    eventName: "click",
                    eventFunc: () => h(this, void 0, void 0, function* () {
                        var e = i.querySelector("#registerAreacode") && i.querySelector("#registerAreacode").value || "",
                            t = i.querySelector("#registerPhone") && i.querySelector("#registerPhone").value || "",
                            r = i.querySelector("#registerVfcode") && i.querySelector("#registerVfcode").value || "";
                        if (10 === t.length && /^\d{1,}$/.test(t))
                            if (0 === r.length) this.displayErrorMessage("verification code error");
                            else {
                                var s, e = "" + e + t;
                                try {
                                    Ts.init(), Ts.show(), yield Bs.userLogin(e, r), console.info("phoneLogin success"), R.storageType === _.Local ? (s = yield R.checkNewUser(), R.storageType = s ? _.Cloud : _.Local, R.userPhone = s ? t : "", Ts.hide()) : (Ts.hide(), R.storageType = _.Cloud, R.userPhone = t, Ps.success({
                                        message: "Login success",
                                        autoCloseTime: 2,
                                        top: "50%",
                                        left: "50%"
                                    })), this.hide()
                                } catch (e) {
                                    console.error("phoneLogin error", e), Ts.hide(), this.hide(), Rs.showWithInit("OK", "Login failed, please try again", () => {
                                        xs.show()
                                    })
                                }
                            }
                        else this.displayErrorMessage("phone number error")
                    })
                }, {
                    ele: i.querySelector("#registerPhone"),
                    eventName: "input",
                    eventFunc: e => {
                        var t = e.target.value || "";
                        /^\d+$/.test(t) ? this.displayErrorMessage("") : (e.target.value = t.replace(/\D+/, ""), this.displayErrorMessage("Please key in numbers!"))
                    }
                }]))
            },
            hide() {
                C.removeDailogContainer(() => {
                    this.currentCtx && this.currentCtx.remove()
                })
            },
            displayErrorMessage(e) {
                var t = this.currentCtx.querySelector("#registerError");
                t && (t.innerText = e)
            },
            addCallbackEvent(e) {
                e && 0 < e.length && e.forEach(t => {
                    t.ele && t.ele.addEventListener(t.eventName, e => {
                        t.eventFunc && t.eventFunc(e)
                    })
                })
            },
            countdownFunc(e) {
                const r = this.currentCtx,
                    s = r.querySelector("#registerTime");
                return function e(t) {
                    s.innerText = t, t--, setTimeout(() => {
                        0 < (s.innerText = t) ? e(t) : (r.querySelector("#registerSendBtn") && (r.querySelector("#registerSendBtn").style.display = "flex"), r.querySelector("#registerSendText") && (r.querySelector("#registerSendText").style.display = "none"))
                    }, 1e3)
                }(e)
            },
            initRegisterUi(e) {
                const r = this.currentCtx.querySelector("#registerAreacode");
                e && 0 < e.length && r && (r.innerHTML = "", e.forEach(e => {
                    var t = document.createElement("option");
                    t.setAttribute("value", "" + e), t.innerText = "+" + e, r.appendChild(t)
                }))
            }
        },
        Ts = {
            currentCtx: null,
            btn: {
                name: "",
                func: () => {
                    Ts.hide()
                }
            },
            init(e) {
                return this.btn.name = "", this.btn.func = () => {
                    Ts.hide()
                }, e && (this.btn.name = e.btnName, this.btn.func = e.btnFunc), this.btn.hidden = !(0 < this.btn.name.length), this
            },
            show() {
                var e = `
      <div style="margin-top: -25px;top: 50%;width: 100%;text-align: center;position: absolute;display: flex;flex-direction: column;justify-content: center;align-items: center;">
          <svg  t="1655447361916" style="animation: waitRotating 2s linear infinite;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3916" width="10" height="10"><path d="M768 576v-128h192v128h-192z m-120.32-290.24l136-135.68 90.24 90.24-135.68 136zM448 768h128v192h-128v-192z m0-704h128v192h-128V64zM150.08 783.68l135.68-136 90.56 90.56-136 135.68z m0-543.36l90.24-90.24 136 135.68-90.56 90.56zM256 576H64v-128h192v128z m617.92 207.68l-90.24 90.24-136-135.68 90.56-90.56z" fill="#409EFF" p-id="3917"></path></svg>
          <p style="color: #409EFF;margin: 3px 0;font-size: 14px;">Loading...</p>
          ${this.btn.name ? `<div id="css_wait_ctx_cancel" style="margin-top: 25px;width: 130px;text-align: center;background: #fff;height: 30px;line-height: 30px;border-radius: 30px;">${this.btn.name}</div>` : ""}
      </div>
      `,
                    t = document.createElement("div"),
                    e = (t.setAttribute("style", "position: absolute;z-index:10;width:100%;height:100%;transition: opacity .3s;background-color: rgb(0, 0, 0,0.6);"), t.innerHTML = e, document.createElement("style")),
                    e = (e.id = "css_wait_style", e.type = "text/css", e.innerHTML = `
    @keyframes waitRotating {
        0% {
        transform: rotateZ(0);
        }
        100% {
            transform: rotateZ(360deg);
        }
    }
    `, t.appendChild(e), C.createDailogContainer().append(t), (this.currentCtx = t).querySelector("#css_wait_ctx_cancel"));
                e && e.addEventListener("click", () => {
                    this.btn.func && this.btn.func(), this.hide()
                })
            },
            hide() {
                C.removeDailogContainer(() => {
                    this.currentCtx && this.currentCtx.remove()
                })
            }
        },
        Ps = {
            success({
                autoCloseTime: e,
                message: t,
                top: r,
                left: s
            }) {
                const i = e || 1,
                    n = r || "50%";
                e = s || "50%";
                const o = document.createElement("div");
                o.innerHTML = `<div style="transition: all 0.5s ease-out;border: 1px solid #e1f3d8;color:#67c23a;background: #f0f9eb;max-width: 300px;min-height: 20px;position: fixed;top: -100%;left:${e};transform: translate(-50%,-50%);z-index: 20001;border-radius: 4px;word-break: break-word;padding: 10px;">
                <div>
                    <svg t="1655970966078" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2181"
                        width="20" height="20">
                        <path
                            d="M512 1024C229.248 1024 0 794.752 0 512S229.248 0 512 0s512 229.248 512 512-229.248 512-512 512z m-114.176-310.954667a53.333333 53.333333 0 0 0 75.434667 0l323.328-323.328a53.333333 53.333333 0 1 0-75.434667-75.434666l-287.914667 283.306666-128.853333-128.853333a53.333333 53.333333 0 1 0-75.434667 75.434667l168.874667 168.874666z"
                            fill="#67c23a" p-id="2182"></path>
                    </svg>
                </div>
                <div>${t}</div>
            </div>`, document.body.append(o), setTimeout(() => {
                    o.firstChild.style.top = n
                }, 500), setTimeout(() => {
                    var e = `${o.firstChild.getBoundingClientRect() && o.firstChild.getBoundingClientRect().height / 2 || 0}px`;
                    o.firstChild.style.top = e, setTimeout(() => {
                        o.remove()
                    }, 1e3 * i)
                }, 1e3)
            },
            error({
                autoCloseTime: e,
                message: t,
                top: r,
                left: s
            }) {
                e && (this.autoCloseTime = e);
                const i = e || 1,
                    n = r || "50%";
                e = s || "50%";
                const o = document.createElement("div");
                o.innerHTML = `<div  style="transition: all 0.5s ease-out;border: 1px solid #fde2e2;color:#f56c6c;background: #fef0f0;max-width: 300px;min-height: 20px;position: fixed;top: -100%;left:${e};transform: translate(-50%,-50%);z-index: 20001;border-radius: 4px;word-break: break-word;padding: 10px;">
                <div>
                    <svg t="1655971895182" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3456" width="20" height="20"><path d="M827.392 195.584q65.536 65.536 97.792 147.456t32.256 167.936-32.256 167.936-97.792 147.456-147.456 98.304-167.936 32.768-168.448-32.768-147.968-98.304-98.304-147.456-32.768-167.936 32.768-167.936 98.304-147.456 147.968-97.792 168.448-32.256 167.936 32.256 147.456 97.792zM720.896 715.776q21.504-21.504 18.944-49.152t-24.064-49.152l-107.52-107.52 107.52-107.52q21.504-21.504 24.064-49.152t-18.944-49.152-51.712-21.504-51.712 21.504l-107.52 106.496-104.448-104.448q-21.504-20.48-49.152-23.04t-49.152 17.92q-21.504 21.504-21.504 52.224t21.504 52.224l104.448 104.448-104.448 104.448q-21.504 21.504-21.504 51.712t21.504 51.712 49.152 18.944 49.152-24.064l104.448-104.448 107.52 107.52q21.504 21.504 51.712 21.504t51.712-21.504z" p-id="3457" fill="#f56c6c"></path></svg>
                </div>
                <div>${t}</div>
            </div>`, document.body.append(o), setTimeout(() => {
                    o.firstChild.style.top = n
                }, 500), setTimeout(() => {
                    var e = `${o.firstChild.getBoundingClientRect() && o.firstChild.getBoundingClientRect().height / 2 || 0}px`;
                    o.firstChild.style.top = e, setTimeout(() => {
                        o.remove()
                    }, 1e3 * i)
                }, 1e3)
            }
        },
        Rs = {
            message: `Sorry,This account already exists,
please change a new account.\r
\r
If you want switch account,
please click the button.`,
            currentCtx: null,
            btn: {
                name: "OK",
                func: () => { }
            },
            init(e) {
                return this.message = "", this.btn.name = "", this.btn.func = () => { }, e && (this.message = e.message, this.btn.name = e.btnName, this.btn.func = e.btnFunc), this
            },
            show() {
                var e = `    
    <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%,-50%);width: 278px;  min-height: 210px;   background: #FFFFFF; box-shadow: 0px 2px 7px 0px rgba(143, 143, 143, 0.48);  border-radius: 11px;    display: flex;flex-direction: column;align-items: center;">
        <div style="margin: 20px 0 0px;display: flex;flex-direction: column;justify-content: center;align-items: center;"><div style="width:50px;height:50px;border-radius:50px;    background: url(/images/weiyou.png);background-position: center;background-repeat: no-repeat;background-size: contain;"></div>
        <div style="max-width:268px;padding: 10px 0;min-height: 80px;width: 100%;overflow: hidden;text-align: center;word-break: break-word;box-sizing: border-box;line-height: 20px;white-space: pre-wrap;word-break: break-word;">${this.message}</div>                
        <div id="confirmMessage" style=" margin-bottom: 20px;display: flex; justify-content: center; align-items: center;width: 230px; height: 35px; border-radius: 6px;background: #4398FE;  font-size: 13px;font-family: Microsoft YaHei;font-weight: 400;color: #FFFF" >${this.btn.name}</div>
    </div>`,
                    t = document.createElement("div");
                t.setAttribute("style", "position: absolute;z-index:1;width:100%;height:100%"), t.innerHTML = e, C.createDailogContainer().append(t), (this.currentCtx = t) && C.addCallbackEvent([{
                    ele: t.querySelector("#minigameDailogContainer #confirmMessage"),
                    eventName: "click",
                    eventFunc: () => {
                        this.removeUi(), this.btn.func && this.btn.func instanceof Function && this.btn.func()
                    }
                }])
            },
            showWithInit(e, t, r) {
                var s = {};
                s.btnName = e, s.message = t, s.btnFunc = r, this.init(s), this.show()
            },
            removeUi() {
                C.removeDailogContainer(() => {
                    this.currentCtx && this.currentCtx.remove()
                })
            }
        };
    (ot = gs = gs || {}).WAITING = "0", ot.PAYING = "1", ot.SUCCESS = "2";
    class Cs {
        constructor() {
            this._curProducts = [], this._curProductInfos = []
        }
        static getInstance() {
            return this._instance || (this._instance = new Cs), this._instance
        }
        init(t) {
            return h(this, void 0, void 0, function* () {
                Cs._instance = this;
                try {
                    emoPaySDK.api.initSDK(t), console.info("inititial emo pay sdk success")
                } catch (e) {
                    return Rs.showWithInit("OK", "Payment initialization failed"), Promise.reject({
                        code: "emoPay init fail",
                        message: e.message
                    })
                }
                try {
                    var e = yield this.query();
                    return this._curProducts.length = 0, this._curProducts = this._curProducts.concat(e), console.info("query goods info: ", this._curProducts), Promise.resolve()
                } catch (e) {
                    return Promise.reject({
                        code: "query goods fail",
                        message: e.message
                    })
                }
            })
        }
        pay(i, n) {
            return h(this, void 0, void 0, function* () {
                let e = !1;
                try {
                    e = yield this.checkLoginAsync()
                } catch (e) {
                    return Rs.showWithInit("OK", `Network error, please check 
if the network is available`), Promise.reject({
                        code: "pay error",
                        message: e.message
                    })
                }
                if (!e) return Rs.showWithInit("Login", `You are currently not logged in, 
or the token has expired, 
please log in again`, () => {
                    xs.show()
                }), Promise.reject({
                    code: "login error",
                    message: "without login, please login frist."
                });
                try {
                    var t = {},
                        r = (t.orderNo = n || de(), t.productId = i, yield this.buyGoods(t)),
                        s = {
                            paymentID: "",
                            signedRequest: ""
                        };
                    return s.productID = i, s.purchaseTime = r.paidTime, s.purchaseToken = r.cpOrderNo, Promise.resolve(s)
                } catch (e) {
                    return Rs.showWithInit("OK", "Payment failed, please pay again"), Promise.reject({
                        code: "pay fail",
                        message: e.message
                    })
                }
            })
        }
        query() {
            return new Promise((t, s) => {
                emoPaySDK.api.requestGoods(e => {
                    0 !== e.code && s({
                        code: "request goods fail",
                        message: e.msg
                    }), null != e.data && 0 !== e.data.length || s({
                        code: "request goods empty",
                        message: "request goods empty"
                    });
                    const r = [];
                    e = e.data;
                    (this._curProductInfos = e).forEach(e => {
                        var t = {};
                        t.title = e.goodsName, t.price = "" + e.amount, t.productID = e.goodsId, t.description = e.goodsExp, t.priceCurrencyCode = "", t.imageURI = "", r.push(t)
                    }), t(r)
                })
            })
        }
        queryUncomsume() {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = yield me(`${P.PAY_IP}/${P.MINI_ORDER_ID}/query`, {
                        thirdUid: emoPaySDK.api.getUserId()
                    }), t = (console.log("query uncomsume orderInfos: ", e), e.paidMiniOrders);
                    const s = [];
                    return t.forEach(t => {
                        var e = this._curProducts.filter(e => e.productID === t.productId)[0],
                            r = {
                                paymentID: "",
                                purchaseTime: ""
                            };
                        r.productID = e.productID, r.purchaseToken = t.thirdOrderId, r.signedRequest = "", s.push(r)
                    }), Promise.resolve(s)
                } catch (e) {
                    return Promise.reject({
                        code: "query uncomsume order",
                        message: e.message
                    })
                }
            })
        }
        consume(e) {
            return h(this, void 0, void 0, function* () {
                try {
                    yield me(`${P.PAY_IP}/${P.MINI_ORDER_ID}/consume`, {
                        mini_order_id: e
                    });
                    return Promise.resolve()
                } catch (e) {
                    return Promise.reject({
                        code: "consume_fail",
                        message: e.message
                    })
                }
            })
        }
        onReady(e) { }
        checkUserLoginStatus() {
            return new Promise((t, r) => {
                emoPaySDK.api.checkUserLoginStatus(e => {
                    0 === e ? t(!0) : -1 === e || -2 === e ? t(!1) : r({
                        code: "check user login status error",
                        message: JSON.stringify(e)
                    })
                })
            })
        }
        buyGoods(i) {
            return console.info("=====> pay options: ", i), new Promise((t, r) => {
                var e, s = this._curProductInfos.filter(e => e.goodsId === i.productId)[0];
                null == s ? r({
                    message: "product not found"
                }) : (e = {
                    game_id: c.gameId
                }, e = JSON.stringify(e), console.info("=====> emoPay buyGoods ing"), emoPaySDK.api.buyGoods(s, i.orderNo, e, "http://purchase.minigame.vip/v2/purchase/emo/callback", e => {
                    console.info("emoPay buyGoods response: ", e), 0 === e.code && null != e.data ? e.data.paySt === gs.SUCCESS ? (console.info("pay success"), t(e.data)) : (console.info("pay fail"), r({
                        code: "pay fail",
                        message: e.msg
                    })) : r({
                        code: "buy goods fail",
                        message: e.msg
                    })
                }))
            })
        }
        guestLogin() {
            return new Promise((t, r) => {
                emoPaySDK.api.guestLogin(e => {
                    0 === e.code ? (console.info("guest login success"), t()) : (console.info("guest login fail"), r({
                        code: "guest login fail",
                        message: e.msg
                    }))
                })
            })
        }
        sendVerifyCode(e) {
            return new Promise((t, r) => {
                emoPaySDK.api.requestOpt(e, e => {
                    0 === e.code ? t() : r({
                        code: "send verify code fail",
                        message: e.msg
                    })
                })
            })
        }
        phoneLogin(e, s) {
            return new Promise((t, r) => {
                emoPaySDK.api.phoneLogin(e, s, e => {
                    0 === e.code ? t() : r({
                        code: "phone login fail",
                        message: e.msg
                    })
                })
            })
        }
        userLogin(e, t) {
            return this.phoneLogin(e, t)
        }
        getUserId() {
            return emoPaySDK.api.getUserId() || ""
        }
        getUserToken() {
            return emoPaySDK.api.getUserToken()
        }
        checkLoginAsync() {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = yield this.checkUserLoginStatus();
                    return e && R.storageType !== _.Cloud || !e ? Promise.resolve(!1) : Promise.resolve(!0)
                } catch (e) {
                    return Promise.reject({
                        code: "check Login error",
                        message: e.message
                    })
                }
            })
        }
    }
    const ks = Cs.getInstance(),
        Is = {};
    Is.EmoPay = Cs;
    class Es {
        static getClass(e, t) {
            return void 0 === Is[e] || null === Is[e] ? (console.warn(`未找到 className：${e} 对应实现`), null) : new Is[e](t)
        }
        static checkValidClass(e) {
            return void 0 === Is[e] || null === Is[e] ? null : e
        }
    }
    const Bs = class fn {
        constructor() {
            this._payPlatormInfo = null, this._curPayment = null, this._isPayEnable = !1, this._inited = !1
        }
        static get instance() {
            return this._instance || (this._instance = new fn), this._instance
        }
        set payEnable(e) {
            this._isPayEnable = e
        }
        get payEnable() {
            return this._isPayEnable
        }
        get inited() {
            return this._inited
        }
        init(e) {
            throw new Error("Method not implemented.")
        }
        pay(e, t) {
            return console.info("=====> pay productID: ", e), this._inited ? this._curPayment ? this._curPayment.pay(e, t) : (console.error("purchase fail no payment selected"), Promise.reject({
                code: "purchaseAsync fail",
                message: "no payment selected"
            })) : (Rs.showWithInit("OK", `The payment initialization failed. 
Please restart the game if you 
want to make a payment.`), Promise.reject({
                code: "fail to initialize payment",
                message: "payment inited false"
            }))
        }
        query() {
            return h(this, void 0, void 0, function* () {
                if (!this._curPayment) return Promise.reject({
                    code: "getCatalogAsync fail",
                    message: "no payment selected"
                });
                try {
                    var e = yield this._curPayment.query();
                    return console.info("get products : ", e), e
                } catch (e) {
                    return Promise.reject({
                        message: "getCatalog fail " + e.message
                    })
                }
            })
        }
        queryUncomsume() {
            return this._curPayment ? this._curPayment.queryUncomsume() : Promise.reject({
                code: "getPurchasesAsync fail",
                message: "no payment selected"
            })
        }
        consume(e) {
            return this._curPayment ? this._curPayment.consume(e) : Promise.reject({
                code: "consumePurchaseAsync fail",
                message: "no payment selected"
            })
        }
        onReady(e) {
            this._curPayment ? this._curPayment.onReady(e) : console.error("no payment selected")
        }
        fetchPayConfig(r) {
            return h(this, void 0, void 0, function* () {
                try {
                    var e, t = yield fetch(r);
                    return 404 === t.status ? Promise.reject({
                        code: "fetchPayConfig fail " + r
                    }) : (e = (yield t.json()).infos.filter(e => e.enabled)[0], this._curPayment = Es.getClass(e.id), this._payPlatormInfo = e, this._curPayment ? (console.info("load pay config: ", r), this._isPayEnable = !0, Promise.resolve()) : Promise.reject({
                        code: "this._curPayment null " + e.id
                    }))
                } catch (e) {
                    return Promise.reject({
                        message: "fetchPayConfig fail " + e.message
                    })
                }
            })
        }
        loadSDK() {
            return h(this, void 0, void 0, function* () {
                try {
                    return yield ce(this._payPlatormInfo.sdkUrl, !0), console.info("load pay dk: ", this._payPlatormInfo.sdkUrl), Promise.resolve()
                } catch (e) {
                    return Promise.reject({
                        message: "load pay sdk fail " + e.message
                    })
                }
            })
        }
        loadPayment(e) {
            return h(this, void 0, void 0, function* () {
                try {
                    return yield this.fetchPayConfig(e), yield this.loadSDK(), this._curPayment.init(this._payPlatormInfo.channel), this._inited = !0, Promise.resolve()
                } catch (e) {
                    return Promise.reject({
                        code: "loadPayment fail",
                        message: e.message
                    })
                }
            })
        }
        setPayment(e) {
            e ? this._curPayment = e : console.error("payment is null")
        }
        getUserId() {
            return this._curPayment ? this._curPayment.getUserId() : ""
        }
        guestLogin() {
            return this._curPayment ? this._curPayment.guestLogin() : Promise.reject({
                code: "payHelper guestLogin fail",
                message: "this _curPayment is null"
            })
        }
        userLogin(e, t) {
            return this._curPayment ? this._curPayment.userLogin(e, t) : Promise.reject({
                code: "payHelper userLogin fail",
                message: "this _curPayment is null"
            })
        }
        checkLoginAsync() {
            return this._curPayment ? this._curPayment.checkLoginAsync() : Promise.reject({
                code: "checkLoginAsync fail",
                message: "no payment selected"
            })
        }
    }.instance;
    class k extends j {
        constructor() {
            super(...arguments), this._services = []
        }
        static createDefaultInstance() {
            return this._instance || (this._instance = new k(window)), this._instance
        }
        static get instance() {
            if (this._instance) return this._instance;
            throw {
                code: "NO_SERVER_INSTANCE",
                message: "MediationServer is not initialized"
            }
        }
        _findService(t) {
            return this._services.find(e => e.type === t)
        }
        dispatch(e, t) {
            const r = e,
                s = this._findService(e.type);
            s ? s.onRequest(r).then(e => {
                s.isOneWay || j.postMessageTo(t, e, "*")
            }).catch(e => {
                console.error("===> Service Error: ", e);
                e = n(r, e.code, e.message);
                j.postMessageTo(t, e, "*")
            }) : (console.info("=====> Service Not Found: ", e), e = i(r), j.postMessageTo(t, e, "*"))
        }
        registerService(e) {
            this._services.push(e)
        }
        registerQuickService(e, t = !1, r = s.quickHandler) {
            e = s.createSimpleService(e, t, r);
            this.registerService(e)
        }
        removeService(t) {
            -1 < this._services.indexOf(t) && (this._services = this._services.filter(e => e !== t))
        }
        removeServiceByType(e) {
            e = this._findService(e);
            e && this.removeService(e)
        }
    }

    function Ds(r, e) {
        return h(this, void 0, void 0, function* () {
            return new Promise(function (e, t) {
                t(r)
            })
        })
    } (S = ps = ps || {}).emptyWait = function (r) {
        return h(this, void 0, void 0, function* () {
            return new Promise(function (e, t) {
                r ? t(new Error("Failed by design")) : e()
            })
        })
    }, S.emptyWaitObject = function (r) {
        return h(this, void 0, void 0, function* () {
            return new Promise(function (e, t) {
                e(r)
            })
        })
    }, S.emptyWaitBool = function (r, e) {
        return h(this, void 0, void 0, function* () {
            return new Promise(function (e, t) {
                e(r)
            })
        })
    }, S.emptyWaitString = function (r, e) {
        return h(this, void 0, void 0, function* () {
            return new Promise(function (e, t) {
                e(r)
            })
        })
    }, S.emptyWaitError = Ds, S.emptyWaitUnsupportApi = function (t) {
        return h(this, void 0, void 0, function* () {
            return Ds((e = t, {
                code: M.CODE.UNSUPPORTED_API,
                message: "unsupport api:" + e
            }));
            var e
        })
    }, S.generateId = function () {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
    };
    const Ns = new class {
        getCatalogAsync() {
            return ps.emptyWaitObject([])
        }
        purchaseAsync(e) {
            return ps.emptyWaitObject(null)
        }
        getPurchasesAsync() {
            return ps.emptyWaitObject([])
        }
        consumePurchaseAsync(e) {
            return ps.emptyWaitObject(null)
        }
        onReady(e) {
            e()
        }
    };
    class Os {
        constructor() {
            this._payType = "", this.getAvailableGoodsResult = null, this.queryUnConsumeOrderResult = null, this.payResult = null, this.consumeOrderResult = null
        }
        getCatalogAsync() {
            return new Promise((i, n) => {
                var e = window.AdInteractive;
                e || n("Android AdInteractive is not exist"), e.getAvailableGoods(), this.getAvailableGoodsResult = (e, t, r) => {
                    if (e) {
                        console.info("====> getAvailableGoodsResult productInfos: ", t);
                        e = JSON.parse(t);
                        const s = [];
                        e.forEach(e => {
                            var t = {};
                            t.title = e.goodsName, t.description = "", t.imageURI = "", t.price = e.amount, t.priceCurrencyCode = e.currencyCode, t.productID = e.goodsId, s.push(t)
                        }), i(s)
                    } else n({
                        code: "android_getCatelogAsync_error",
                        message: "" + r
                    })
                }
            })
        }
        purchaseAsync(o) {
            return new Promise((i, n) => {
                var e, t = window.AdInteractive;
                t ? (e = de(), t.pay(o.productID, e), this.payResult = (e, t, r, s) => {
                    e ? ((e = {}).productID = o.productID, e.paymentID = "", e.purchaseToken = t, e.purchaseTime = u.getTimestamp().toString(), e.signedRequest = "", e.developerPayload = o.developerPayload, this._payType = r, i(e)) : n({
                        code: "android_purchaseAsync_error",
                        message: "" + s
                    })
                }) : n("Android AdInteractive is not exist")
            })
        }
        getPurchasesAsync() {
            return new Promise((i, n) => {
                var e = window.AdInteractive;
                e ? (e.queryUnConsumeOrder(), this.queryUnConsumeOrderResult = (e, t, r) => {
                    if (e) {
                        console.info("====> queryUnConsumeOrderResult productInfos: ", t);
                        e = JSON.parse(t);
                        const s = [];
                        e.forEach(e => {
                            var t = {};
                            t.purchaseToken = e.id, t.paymentID = e.thirdUid, t.purchaseTime = u.getTimestamp().toString(), t.productID = e.productId, t.signedRequest = "", s.push(t)
                        }), i(s)
                    } else n({
                        code: "android_getPurchasesAsync_error",
                        message: "" + r
                    })
                }) : n("Android AdInteractive is not exist")
            })
        }
        consumePurchaseAsync(t) {
            return new Promise((r, s) => {
                var e = window.AdInteractive;
                e ? (e.consume(t, this._payType), this.consumeOrderResult = (e, t) => {
                    e ? r() : s({
                        code: "android_consumePurchaseAsync_error",
                        message: "" + t
                    })
                }) : s("Android AdInteractive is not exist")
            })
        }
        onReady(e) {
            e && e()
        }
        onGetAvailableGoodsResult(e, t, r) {
            console.info(`====> onGetAvailableGoodsResult isSuccess: ${e}, productInfos: ${t}, errorMessage: ` + r), this.getAvailableGoodsResult ? this.getAvailableGoodsResult(e, t, r) : console.info("====> getAvailableGoodsResult is not init")
        }
        onQueryUnConsumeOrderResult(e, t, r) {
            console.info(`====> onQueryUnConsumeOrderResult isSuccess: ${e}, productInfos: ${t}, errorMessage: ` + r), this.queryUnConsumeOrderResult ? this.queryUnConsumeOrderResult(e, t, r) : console.info("====> queryUnConsumeOrderResult is not init")
        }
        onPayResult(e, t, r, s) {
            console.info(`====> onPayResult isSuccess: ${e}, orderId: ${t}, errorMessage: ` + s), this.payResult ? this.payResult(e, t, r, s) : console.info("====> payResult is not init")
        }
        onConsumeOrderResult(e, t) {
            console.info(`====> onComsumeOrderResult isSuccess: ${e}, errorMessage: ` + t), this.consumeOrderResult ? this.consumeOrderResult(e, t) : console.info("====> onComsumeOrderResult is not init")
        }
    }
    class Fs {
        constructor() {
            this._payment = null
        }
        static get instance() {
            return this._instance || (this._instance = new Fs), this._instance
        }
        init() {
            var e = window.AdInteractive;
            this._payment = e ? new Os : Ns
        }
        getCatalogAsync() {
            return this._payment.getCatalogAsync()
        }
        purchaseAsync(e) {
            return this._payment.purchaseAsync(e)
        }
        getPurchasesAsync() {
            return this._payment.getPurchasesAsync()
        }
        consumePurchaseAsync(e) {
            return this._payment.consumePurchaseAsync(e)
        }
        onReady(e) {
            this._payment.onReady(e)
        }
        onGetAvailableGoodsResult(e, t, r) {
            var s;
            this._payment && null != (s = this._payment) && s.onGetAvailableGoodsResult(e, t, r)
        }
        onQueryUnConsumeOrderResult(e, t, r) {
            var s;
            this._payment && null != (s = this._payment) && s.onQueryUnConsumeOrderResult(e, t, r)
        }
        onPayResult(e, t, r, s) {
            var i;
            this._payment && null != (i = this._payment) && i.onPayResult(e, t, r, s)
        }
        onConsumeOrderResult(e, t) {
            var r;
            this._payment && null != (r = this._payment) && r.onConsumeOrderResult(e, t)
        }
    }
    Fs._instance = null;
    const I = Fs.instance;
    window.onGetAvailableGoodsResult = I.onGetAvailableGoodsResult.bind(I), window.onQueryUnConsumeOrderResult = I.onQueryUnConsumeOrderResult.bind(I), window.onPayResult = I.onPayResult.bind(I), window.onConsumeOrderResult = I.onConsumeOrderResult.bind(I);
    class qs extends t {
        static createRequest() {
            return {
                type: qs.requestType
            }
        }
        static createService() {
            return new qs(qs.requestType, !1, qs.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            return I.getCatalogAsync().then(e => Promise.resolve(i(t, JSON.stringify(e)))).catch(e => Promise.reject(n(t, e.code, e.message)))
        }
    }
    qs.requestType = "PayInstantCatalogService";
    class Ms extends t {
        static createRequest(e) {
            return {
                type: Ms.requestType,
                payload: e
            }
        }
        static createService() {
            return new Ms(Ms.requestType, !1, Ms.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            return I.purchaseAsync(t.payload).then(e => Promise.resolve(i(t, e))).catch(e => Promise.reject(n(t, e.code, e.message)))
        }
    }
    Ms.requestType = "PayInstantPurchasesService";
    class Ls extends t {
        static createRequest() {
            return {
                type: Ls.requestType
            }
        }
        static createService() {
            return new Ls(Ls.requestType, !1, Ls.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            return I.getPurchasesAsync().then(e => Promise.resolve(i(t, e))).catch(e => Promise.reject(n(t, e.code, e.message)))
        }
    }
    Ls.requestType = "PayInstantGetPurchasesService";
    class js extends t {
        static createRequest(e) {
            return {
                type: js.requestType,
                payload: e
            }
        }
        static createService() {
            return new js(js.requestType, !1, js.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            var e = t.payload;
            return I.consumePurchaseAsync(e).then(() => Promise.resolve(i(t))).catch(e => Promise.reject(n(t, e.code, e.message)))
        }
    }
    js.requestType = "PayInstantConsumePurchaseService";
    class Hs extends t {
        static createRequest(e) {
            return {
                type: Hs.requestType,
                payload: e
            }
        }
        static createService() {
            return new Hs(Hs.requestType, !1, Hs.handleRequestAsync)
        }
        static handleRequestAsync(e) {
            return I.onReady(e.payload), Promise.resolve(i(e))
        }
    }
    Hs.requestType = "PayInstantOnReadyService";
    let Us, zs = !0,
        E, $s, Ws;
    const B = {
        x: 360,
        y: 640
    };

    function Gs() {
        Us.style.display = "none"
    }

    function D(e, ...t) {
        console.log("[ima] - " + e, ...t)
    }

    function Ks(e) {
        var t;
        D("setupIma", {
            url: e
        }), Ws = new window.google.ima.AdDisplayContainer(Us), ($s = new window.google.ima.AdsLoader(Ws)).addEventListener(window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, Ys, !1), $s.addEventListener(window.google.ima.AdErrorEvent.Type.AD_ERROR, Vs, !1), D("requestAds", {
            url: e = e
        }), (t = new window.google.ima.AdsRequest).adTagUrl = e, t.linearAdSlotWidth = B.x, t.linearAdSlotHeight = B.y, t.nonLinearAdSlotWidth = B.x, t.nonLinearAdSlotHeight = B.y, $s.requestAds(t)
    }

    function Ys(e) {
        var t = new window.google.ima.AdsRenderingSettings,
            r = (t.enablePreloading = !0, (E = e.getAdsManager(Ws, t)).addEventListener(window.google.ima.AdErrorEvent.Type.AD_ERROR, Vs), [window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED, window.google.ima.AdEvent.Type.COMPLETE, window.google.ima.AdEvent.Type.LOADED, window.google.ima.AdEvent.Type.STARTED, window.google.ima.AdEvent.Type.USER_CLOSE, window.google.ima.AdEvent.Type.SKIPPED, window.google.ima.AdEvent.Type.CLICK]);
        for (const s in r) E.addEventListener(r[s], Js);
        zs || Qs()
    }

    function Vs(e) {
        if (D("onAdError:", e.getError()), Gs(), E) try {
            E.destroy()
        } catch (e) { }
        E = null
    }

    function Js(e) {
        var t = e.getAd();
        switch (D("onAdEvent:", e.type, {
            ad: t,
            adEvent: e
        }), e.type) {
            case window.google.ima.AdEvent.Type.LOADED:
            case window.google.ima.AdEvent.Type.STARTED:
                break;
            case window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
            case window.google.ima.AdEvent.Type.COMPLETE:
            case window.google.ima.AdEvent.Type.USER_CLOSE:
            case window.google.ima.AdEvent.Type.SKIPPED:
                Gs();
                break;
            case window.google.ima.AdEvent.Type.CLICK:
        }
    }

    function Qs() {
        D("showAds"), Us.style.display = "block", Ws.initialize();
        try {
            E.init(B.x, B.y, window.google.ima.ViewMode.NORMAL), E.start(), D("showAds success")
        } catch (e) {
            Gs(), D("showAds error: ", e)
        }
    }

    function Xs(e, t) {
        var r, s, i;
        D("loadPreroll"), window.google ? e ? (Us = (t = t) || ((t = document.createElement("div")).id = "ads-container", t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.style.width = "100%", t.style.height = "100%", t.style.zIndex = "10000", t.style.display = "none", t.style.backgroundColor = "#000", document.body.appendChild(t), t), t = window, r = (s = document).documentElement, s = s.getElementsByTagName("body")[0], i = t.innerWidth || r.clientWidth || s.clientWidth, t = t.innerHeight || r.clientHeight || s.clientHeight, B.x = i < 320 ? 320 : i, B.y = t < 320 ? 320 : t, D("setupAdsSize AdsSize:", {
            width: B.x,
            height: B.y
        }), window.addEventListener("resize", function (e) {
            var t, r;
            E && (D("resize AdsSize:", {
                x: t = B.x,
                y: r = B.y
            }), E.resize(t, r, window.google.ima.ViewMode.NORMAL))
        }), Ks(e)) : console.error("[ima] 加载开屏广告失败，未提供广告地址") : console.error("[ima] IMA SDK 加载失败，请检查 //imasdk.googleapis.com/js/sdkloader/ima3.js 是否加载成功")
    }

    function Zs(e) {
        return h(this, void 0, void 0, function* () {
            document.querySelector("script[src^='https://imasdk.googleapis.com/js/sdkloader/ima3.js']") || ce("https://imasdk.googleapis.com/js/sdkloader/ima3.js").then(() => {
                console.info("[ima] init ima success"), "on" === (null == e ? void 0 : e.preload) && (window.google && null != e && e.adTargetUrl ? Xs(null == e ? void 0 : e.adTargetUrl) : console.error("[ima] init ima error without window.google and adTargetUrl: ", {
                    google: window.google,
                    options: e
                }))
            }).catch(e => {
                console.error("[ima] init ima error: ", e)
            })
        })
    }

    function ei(e) {
        return h(this, void 0, void 0, function* () {
            document.querySelector("script[src^='https://securepubads.g.doubleclick.net/tag/js/gpt.js']") || ce("https://securepubads.g.doubleclick.net/tag/js/gpt.js").then(() => {
                window.googletag = window.googletag || {
                    cmd: []
                }, console.info("[admanager] init afg success")
            }).catch(e => {
                console.error("[admanager] init afg error: ", e)
            })
        })
    }

    function ti(e) {
        return h(this, void 0, void 0, function* () {
            document.querySelector("script[src^='https://sdk.minigame.vip/js/adivery.global.js']") || ce("https://sdk.minigame.vip/js/adivery.global.js").then(() => {
                console.info("[adivery] init afg success")
            }).catch(e => {
                console.error("[adivery] init afg error: ", e)
            })
        })
    }

    function ri(e) {
        return h(this, void 0, void 0, function* () {
            document.querySelector("script[src^='https://us-east-web-static.s3.amazonaws.com/sthybrid/dywx-ad-sdk.js']") || ce("https://us-east-web-static.s3.amazonaws.com/sthybrid/dywx-ad-sdk.js").then(() => {
                window.dywxBridge = new window.DYWXBridge((null == e ? void 0 : e.app_id) || "", function () {
                    console.log("[JS]: DYWXBridge is ready!")
                }), console.info("[bridge] init afg success")
            }).catch(e => {
                console.error("[bridge] init afg error: ", e)
            })
        })
    }

    function si(e) {
        var t, r, s, i;
        document.querySelector("script[src^='https://cdn.taboola.com/libtrc/flatmedia-network/loader.js']") || (window._taboola = window._taboola || [], _taboola.push({
            article: "auto"
        }), t = document.createElement("script"), r = document.getElementsByTagName("script")[0], s = "//cdn.taboola.com/libtrc/flatmedia-network/loader.js", i = "tb_loader_script", document.getElementById(i) || (t.async = 1, t.src = s, t.id = i, r.parentNode.insertBefore(t, r)), window.performance && "function" == typeof window.performance.mark && window.performance.mark("tbl_ic"))
    }

    function ii(e) {
        var t, r, s, i;
        document.querySelector("script[src^='https://cdn.taboola.com/libtrc/minigame-network/loader.js']") || (window._taboola = window._taboola || [], _taboola.push({
            article: "auto"
        }), t = document.createElement("script"), r = document.getElementsByTagName("script")[0], s = "//cdn.taboola.com/libtrc/minigame-network/loader.js", i = "tb_loader_script", document.getElementById(i) || (t.async = 1, t.src = s, t.id = i, r.parentNode.insertBefore(t, r)), window.performance && "function" == typeof window.performance.mark && window.performance.mark("tbl_ic"))
    }

    function ni(c) {
        var d, l;
        return h(this, void 0, void 0, function* () {
            console.info("[minigame] initAfg"), window.adsbygoogle = window.adsbygoogle || [];

            function e(e) {
                window.adsbygoogle.push(e)
            }
            var t;
            window.adBreak = e, window.adConfig = e;
            try {
                var r = null == (d = null == c ? void 0 : c.afg) ? void 0 : d.attributes,
                    s = (r && "on" !== r["data-adbreak-test"] && delete r["data-adbreak-test"], document.querySelector("script[src^='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js']"));
                if (s) {
                    s.getAttribute("data-ad-host") && r["data-ad-channel"] && delete r["data-ad-channel"], !s.getAttribute("data-ad-host") && r["data-ad-host-channel"] && delete r["data-ad-host-channel"];
                    for (const o in r) !s.getAttribute(o) && r[o] && 0 < r[o].length && s.setAttribute(o, r[o])
                } else {
                    for (const a in r) r[a] || delete r[a];
                    ce("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", !0, r).then(() => { }).catch(e => {
                        console.error("[minigame] init afg error: ", e)
                    })
                }
                var i, n = null == (l = null == c ? void 0 : c.afg) ? void 0 : l.config;
                n && (i = {}, n.preloadAdBreaks && (i.preloadAdBreaks = n.preloadAdBreaks), n.onReady && (i.onReady = () => {
                    console.info("afg ==> ready")
                }), window.adConfig(i), t = n, console.info("setAfgOption", t), K = t, "auto" === n.preloadAdBreaks) && (yield u.waitTime(1e3), ne())
            } catch (e) {
                console.error("init Afg error: ", e.message)
            }
        })
    }

    function oi(r) {
        return h(this, void 0, void 0, function* () {
            try {
                var e = r || function () {
                    var e = new URLSearchParams(window.location.search);
                    let t = "minigame-config.json",
                        r = !1;
                    return e.has("mn_config") && (t = e.get("mn_config"), console.debug("[minigame] config: ", t), r = !0), !r && e.has("mn_channel") && (e = e.get("mn_channel"), console.debug("[minigame] channel: ", e), t = e + "-config.json"), t
                }(),
                    t = (i = e, yield new Promise((t, r) => {
                        const s = new XMLHttpRequest;
                        s.open("GET", i), s.onload = function () {
                            var e;
                            200 === s.status ? (e = JSON.parse(s.responseText), console.info("config loaded:", e), t(e)) : r({
                                message: "fail to get config data from " + i
                            })
                        }, s.onerror = function () {
                            r({
                                message: "fail to get config data from : " + s.statusText
                            })
                        }, s.send()
                    }));
                return Promise.resolve(t)
            } catch (e) {
                return console.error("[minigame] load minigame option error: ", e), Promise.reject(e)
            }
            var i
        })
    }
    let ai = null;

    function ci(e, t, r, s, i) {
        ai ? ai(e, t, r, s, i) : console.warn("[minigame] gaEvent is invalid!")
    }

    function di(t, r, s, e) {
        return h(this, void 0, void 0, function* () {
            try {
                ci("", t + `_${r}_${s}_start`, "", 0, !0), yield e(), ci("", t + `_${r}_${s}_success`, "", 0, !0)
            } catch (e) {
                throw ci("", t + `_${r}_${s}_fail`, "", 0, !0), e
            }
        })
    }
    window.gaEvent = ai;
    class li {
        constructor() {
            this._runningAsyncTask = null, this._queues = [], this._isProcessingTaskUUID = 0, this._enable = !0, this.complete = null
        }
        get queues() {
            return this._queues
        }
        get enable() {
            return this._enable
        }
        set enable(e) {
            this._enable !== e && (this._enable = e) && 0 < this.size && this.play()
        }
        push(e, t = null) {
            var r = li._$uuid_count++;
            return this._queues.push({
                uuid: r,
                callbacks: [e],
                params: t
            }), r
        }
        pushMulti(e, ...t) {
            var r = li._$uuid_count++;
            return this._queues.push({
                uuid: r,
                callbacks: t,
                params: e
            }), r
        }
        remove(t) {
            var e;
            if ((null == (e = this._runningAsyncTask) ? void 0 : e.uuid) === t) console.warn("A running task cannot be removed");
            else
                for (let e = 0; e < this._queues.length; e++)
                    if (this._queues[e].uuid === t) {
                        this._queues.splice(e, 1);
                        break
                    }
        }
        get size() {
            return this._queues.length
        }
        get isProcessing() {
            return 0 < this._isProcessingTaskUUID
        }
        get isStop() {
            return !(0 < this._queues.length || this.isProcessing)
        }
        get runningParams() {
            return this._runningAsyncTask ? this._runningAsyncTask.params : null
        }
        clear() {
            this._queues = [], this._isProcessingTaskUUID = 0, this._runningAsyncTask = null
        }
        next(e, t = null) {
            this._isProcessingTaskUUID === e ? (this._isProcessingTaskUUID = 0, this._runningAsyncTask = null, this.play(t)) : this._runningAsyncTask && console.info("====> runningAsyncTask: ", this._runningAsyncTask)
        }
        step() {
            this.isProcessing && this.next(this._isProcessingTaskUUID)
        }
        play(r = null) {
            if (!this.isProcessing && this._enable) {
                var s = this._queues.shift();
                if (s) {
                    const a = (this._runningAsyncTask = s).uuid;
                    this._isProcessingTaskUUID = a;
                    var i = s.callbacks;
                    if (1 === i.length) i[0]((e = null) => {
                        this.next(a, e)
                    }, s.params, r);
                    else {
                        let t = i.length;
                        const c = [];
                        var n = (e = null) => {
                            --t, c.push(e || null), 0 === t && this.next(a, c)
                        },
                            o = t;
                        for (let e = 0; e < o; e++) i[e](n, s.params, r)
                    }
                } else this._isProcessingTaskUUID = 0, this._runningAsyncTask = null, this.complete && this.complete(r)
            }
        }
        yieldTime(i, n = null) {
            this.push(function (e, t, r) {
                const s = setTimeout(() => {
                    clearTimeout(s), n && n(), e(r)
                }, i)
            }, {
                des: "AsyncQueue.yieldTime"
            })
        }
        static excuteTimes(e, t = null) {
            let r = e;
            return () => {
                0 === --r && t && t()
            }
        }
    }
    li._$uuid_count = 1;
    class hi {
        constructor(e) {
            this._isReward = !1, this._adInstants = [], this._curAdInstant = null, this._refreshTotalShowTimeCallback = null, this._isFinish = !1, this._isReward = e
        }
        get IsFinish() {
            return this._isFinish
        }
        set refreshTotalShowTimeCallback(e) {
            this._refreshTotalShowTimeCallback = e
        }
        get refreshTotalShowTimeCallback() {
            return this._refreshTotalShowTimeCallback
        }
        getCurAdName() {
            return ""
        }
        onShowAdsResult(e, t) {
            var r;
            console.info(`onShowAdsResult: isSuccess: ${e}, errMessage: ${t}, this._curAdInstant: ` + this._curAdInstant), this._curAdInstant && null != (r = this._curAdInstant) && r.onShowAdsResult(e, t)
        }
    } (ut = fs = fs || {}).PREROLL = "preroll", ut.INTERSTITIAL = "interstitial", ut.REWARDED = "reward", ut.BANNER = "banner";
    class N {
        constructor(e, t, r, s) {
            this._adName = "", this._strategyName = "AdsStrategy", this._placementId = e, this._isRewarded = t, this._isOpened = !0, this._type = this._isRewarded ? fs.REWARDED : fs.INTERSTITIAL, console.info("AdsStrategy constructor placementId: type: strategyName", e, this._type, this._strategyName)
        }
        getPlacementID() {
            return this._placementId
        }
        getType() {
            return this._type
        }
        setType(e) {
            this._type = e
        }
        getAdName() {
            return this._adName
        }
        setAdName(e) {
            this._adName = e
        }
        getRewardedType() {
            return this._isRewarded
        }
        getAdTypeName() {
            return this._isRewarded ? "rewarded" : "interstitial"
        }
        setRewardedType(e) {
            this._isRewarded = e
        }
        getIsOpened() {
            return this._isOpened
        }
        setIsOpened(e) {
            this._isOpened = e
        }
        getStrategyName() {
            return this._strategyName
        }
        setAdsCallback(e) {
            this._adsCallback = e
        }
        getAdsCallbackOption() {
            return this._adsCallback
        }
    }
    class ui extends N {
        constructor() {
            super(...arguments), this._strategyName = "AfgStrategy"
        }
        loadAsync() {
            return re(),
                function (s, i, n) {
                    void 0 === i && (i = 0), void 0 === n && (n = 50);
                    let o, a;
                    return new Promise(function (e, t) {
                        const r = function () {
                            s() ? (a && clearTimeout(a), e()) : o = setTimeout(r, n)
                        };
                        o = setTimeout(r, n), 0 < i && (a = setTimeout(() => {
                            o && clearTimeout(o), t(M.TIMEOUT)
                        }, i))
                    })
                }(() => Y(), 1e3).then(() => (console.info("[AFG] Ads loaded"), Promise.resolve())).catch(e => (console.info("[AFG] Ads load error: ", e), Promise.reject(e)))
        }
        showAsync() {
            return h(this, void 0, void 0, function* () {
                var e = {
                    isRewardedAd: this.getRewardedType(),
                    placementId: this.getPlacementID(),
                    uid: ""
                },
                    t = e.isRewardedAd ? U.reward : U.next,
                    e = e.placementId;
                console.info(`===> show ad: ${t}|` + e);
                try {
                    return yield se(t, e, this.getAdsCallbackOption()), console.info("[AFG] show ads: success"), Promise.resolve()
                } catch (e) {
                    return console.info("[AFG] show ads: error: ", e), Promise.reject(e)
                }
            })
        }
        isReady() {
            return Y()
        }
    } (x = ys = ys || {})[x.AdTypeEnumNull = 0] = "AdTypeEnumNull", x[x.Display = 1] = "Display", x[x.Float = 2] = "Float", x[x.Banner = 3] = "Banner", x[x.Interstitial = 4] = "Interstitial", x[x.Rewarded = 5] = "Rewarded";
    class mi {
        constructor() {
            this._mdaRewordInfos = [], this._mdaInterstitialInfos = [], this._url = "" + As.DOMAIN + As.BATCH_API_PATH
        }
        static get instance() {
            return this._instance || (this._instance = new mi), this._instance
        }
        setTest(e) {
            e && (this._url = "" + As.TESTDOMAIN + As.BATCH_API_PATH)
        }
        fetchMdaData(i) {
            return h(this, void 0, void 0, function* () {
                try {
                    var e, t = i === ys.Rewarded ? "_mdaRewordInfos" : "_mdaInterstitialInfos";
                    if (0 < this[t].length) return e = this[t].shift(), Promise.resolve(e);
                    var r = yield ue(this._url, {
                        batch: [{
                            adType: i,
                            count: 3
                        }]
                    });
                    if (console.info("====> MDA Info: ", r), 200 !== r.code) return Promise.reject({
                        code: "REQUEST_MDA_ERROR",
                        message: r.message
                    });
                    this[t] = this[t].concat(r.data.ads);
                    var s = this[t].shift();
                    return Promise.resolve(s)
                } catch (e) {
                    return Promise.reject({
                        code: "FETCH_MDS_ERROR",
                        message: e.message
                    })
                }
            })
        }
    }
    mi._instance = null;
    const gi = mi.instance,
        pi = {
            interstitial: 1,
            rewardedVideo: 2,
            banner: 3
        },
        fi = {
            close: "close",
            adLoaded: "finish",
            adLoadError: "loadError",
            click: "click"
        };
    class yi {
        constructor(e, t, r) {
            this.adid = e.id, this.adType = e.type, this.adTargetUrl = e.target_url, this.adMaterial = e.material_url, this.adTemplateUrl = e.template_url, this.adShowAttributeUrl = e.show_attribute_url, this.playLimitTime = e.impression, this.iframe = null, this.adTargetObj = null, this.isInit = !1, this.timeStamp = (new Date).getTime().toString(), this.gaId = t, this.cbOptions = r
        }
        getIframe() {
            return this.iframe
        }
        getGaId() {
            return this.gaId
        }
        getAdType() {
            return this.adType
        }
        getAdTargetUrl() {
            return this.adTargetUrl
        }
        getAdMaterial() {
            return this.adMaterial
        }
        getAdTemplateUrl() {
            return this.adTemplateUrl
        }
        getTimeStamp() {
            return this.timeStamp
        }
        getAdId() {
            return this.adid
        }
        getInit() {
            return this.isInit
        }
        getPlayLimitTime() {
            return this.playLimitTime
        }
        getShowAttributeUrl() {
            return this.adShowAttributeUrl
        }
        onShow() {
            var e;
            null != (e = this.cbOptions) && e.onShow()
        }
        onSuccess() {
            var e;
            null != (e = this.cbOptions) && e.onSuccess()
        }
        onFail() {
            var e;
            null != (e = this.cbOptions) && e.onFail()
        }
        onClose() {
            var e;
            null != (e = this.cbOptions) && e.onClose()
        }
        onClick() {
            var e;
            null != (e = this.cbOptions) && e.onClick()
        }
        createIframe() {
            return new Promise((e, t) => {
                const r = window.document.createElement("iframe");
                r.setAttribute("style", "overflow: hidden !important; width: 100vw !important; height: 100vh !important; top:0 !important; right:0 !important; bottom:0 !important; left:0 !important; position: fixed !important; clear: none !important; display: none !important; float: none !important; margin: 0px !important; max-height: none !important; max-width: none !important; opacity: 1 !important; padding: 0px !important; vertical-align: baseline !important; visibility: visible !important; z-index: 1000000000 !important;"), r.setAttribute("src", this.adTemplateUrl), r.setAttribute("id", "minigameiframe"), r.setAttribute("marginwidth", "0"), r.setAttribute("frameborder", "0"), r.setAttribute("marginheight", "0"), r.setAttribute("scrolling", "no"), window.document.querySelector("html").appendChild(r), r.onload = function () {
                    console.info("iframe loaded"), e(r)
                }, r.onerror = function (e) {
                    console.error("fail to load iframe: ", e), t(new Error(e.toString()))
                }
            })
        }
        showIframe() {
            this.iframe.setAttribute("style", "overflow: hidden !important; width: 100vw !important; height: 100vh !important; top:0 !important; right:0 !important; bottom:0 !important; left:0 !important; position: fixed !important; clear: none !important; display: inline !important; float: none !important; margin: 0px !important; max-height: none !important; max-width: none !important; opacity: 1 !important; padding: 0px !important; vertical-align: baseline !important; visibility: visible !important; z-index: 1000000000 !important;")
        }
        removeIframe() {
            this.isInit && this.iframe.remove(), this.isInit = !1
        }
        initAsync() {
            return h(this, void 0, void 0, function* () {
                try {
                    if (this.iframe = yield this.createIframe(), null === this.iframe) throw console.warn("fail to create iframe"), {
                        code: "NO_IFRAME",
                        msg: "fail to create iframe"
                    };
                    switch (this.adType) {
                        case pi.interstitial:
                        case pi.rewardedVideo:
                            this.adTargetObj = new vi(this);
                            break;
                        case pi.banner:
                            throw {
                                code: "NO_BANNER", msg: "feature is under development"
                            }
                    }
                    var e = {
                        adTargetUrl: this.adTargetUrl,
                        adMaterial: this.adMaterial,
                        timeStamp: this.timeStamp,
                        adId: this.adid,
                        gaId: this.gaId,
                        showAd: !1
                    };
                    return this.adTargetObj.loadAd(e, this.iframe), window.removeEventListener("message", this.receiveMessageFromIframePage.bind(this), !1), window.addEventListener("message", this.receiveMessageFromIframePage.bind(this), !1), this.isInit = !0, this.adTargetObj
                } catch (e) {
                    throw console.error("fail to init minigame ads: ", e), new Error(e.toString())
                }
            })
        }
        receiveMessageFromIframePage(e) {
            if (e.data && (e.data.action && this.timeStamp === e.data.timeStamp && (console.info("receive message from iframe: ", e), this.isInit))) switch (e.data.action) {
                case fi.close:
                    this.adTargetObj.closeAd(), this.onClose();
                    break;
                case fi.adLoaded:
                    this.adTargetObj.ready = !0;
                    break;
                case fi.adLoadError:
                    this.adTargetObj.ready = !1;
                    break;
                case fi.click:
                    this.onClick()
            }
        }
    }
    class vi extends class {
        set ready(e) {
            var t;
            this.isReady = e, null != (t = this.adLoadedEvent) && t.call(e)
        }
        get ready() {
            return this.isReady
        }
        constructor(e) {
            this.adCloseEvent = null, this.adLoadedEvent = null, this.adIframe = e
        }
        loadAd(e, t) {
            this.timeStamp = e.timeStamp, console.info("send message to iframe: ", e), t.contentWindow.postMessage(e, "*")
        }
        showAd() {
            return new Promise((e, t) => {
                let r = !1;
                return this.adIframe.getInit() && (this.adIframe.showIframe(), r = !0), r
            })
        }
        closeAd() {
            let e = !1;
            return this.adIframe.getInit() && (this.adIframe.removeIframe(), e = !0), e
        }
        getAdId() {
            return this.adIframe.getAdId()
        }
        getPlayLimitTime() {
            return this.adIframe.getPlayLimitTime()
        }
    } {
        constructor(e) {
            super(e), this.ready = !1
        }
        showAd() {
            return new Promise((e, t) => {
                try {
                    this.adIframe.onShow(), this.adCloseEvent = {}, this.adCloseEvent.call = () => {
                        e()
                    };
                    const r = {
                        adTargetUrl: this.adIframe.getAdTargetUrl(),
                        adShowAttributeUrl: this.adIframe.getShowAttributeUrl(),
                        adMaterial: this.adIframe.getAdMaterial(),
                        timeStamp: this.adIframe.getTimeStamp(),
                        gaId: this.adIframe.getGaId(),
                        adId: this.adIframe.getAdId(),
                        adType: this.adIframe.getAdType(),
                        showAd: !0
                    };
                    super.showAd() && this.ready ? (this.adIframe.getIframe().contentWindow.postMessage(r, "*"), this.adIframe.onSuccess()) : (this.adLoadedEvent = {}, this.adLoadedEvent.call = e => {
                        e ? (this.adIframe.getIframe().contentWindow.postMessage(r, "*"), this.adIframe.onSuccess()) : (this.adIframe.onFail(), t({
                            code: "not ready",
                            msg: "fail to show ad due to not ready"
                        }))
                    })
                } catch (e) {
                    console.error(e), t({
                        code: "not ready",
                        msg: "fail to show ad due to not ready:" + e
                    }), this.adIframe.onFail()
                }
            })
        }
        closeAd() {
            var e;
            let t = !1;
            try {
                super.closeAd() && (t = !0, null != (e = this.adCloseEvent)) && e.call()
            } catch (e) {
                console.error(e)
            }
            return t
        }
    }
    window.createAdIframe = function (e, t, r) {
        return h(this, void 0, void 0, function* () {
            try {
                return yield new yi(e, t, r).initAsync()
            } catch (e) {
                throw {
                    code: "load_ad_error",
                    message: "load ad error: " + e.message
                }
            }
        })
    };
    class wi extends N {
        constructor() {
            super(...arguments), this._curAd = null, this._strategyName = "MdaStrategy", this._isStartLoad = !1, this._isLoaded = !1, this._loadedCallback = null
        }
        loadAsync() {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = {
                        Interstitial: 1,
                        Rewarded: 2
                    },
                        t = yield gi.fetchMdaData(this.getRewardedType() ? ys.Rewarded : ys.Interstitial), r = {}, s = (r.id = t.id, r.type = this.getRewardedType() ? e.Rewarded : e.Interstitial, r.template_url = t.template_url, r.material_url = t.material.url, r.target_url = t.target_url, r.show_attribute_url = t.show_attribute_url, r.support_country = [], r.support_language = [], r.impression = 0, new yi(r, "", this.getAdsCallbackOption()));
                    return console.info("====> MDA start load"), this._isStartLoad = !0, this._curAd = yield s.initAsync(), this._isLoaded = !0, console.info("====> MDA load success"), Promise.resolve()
                } catch (e) {
                    return console.info("====> MDA load error: ", e), Promise.reject({
                        code: "MDA_LOAD_ERROR",
                        message: e.message
                    })
                }
            })
        }
        setEventCallback() {
            this.setAdsCallback({
                onShow: () => {
                    console.log(" =======> MDA show")
                },
                onSuccess: () => {
                    console.log(" =======> MDA success")
                },
                onFail: () => {
                    console.log(" =======> MDA failed")
                },
                onClick: () => {
                    console.log(" =======> MDA clicked")
                },
                onClose: () => {
                    console.log(" =======> MDA closed")
                }
            })
        }
        showAsync() {
            return h(this, void 0, void 0, function* () {
                try {
                    return this._curAd ? (yield this._curAd.showAd(), console.info("====> MDA show success"), Promise.resolve()) : Promise.reject({
                        code: "NO_ADS",
                        message: "[MDA] no ads"
                    })
                } catch (e) {
                    return console.info("====> MDA show error: ", e), Promise.reject({
                        code: "MDA_SHOW_ERROR",
                        message: e.message
                    })
                }
            })
        }
        isReady() {
            return this._curAd && this._curAd.ready
        }
    }
    class Ai extends N {
        constructor() {
            super(...arguments), this._strategyName = "AndroidStrategy", this._showAdsResult = null
        }
        loadAsync() {
            return new Promise((e, t) => {
                e()
            })
        }
        showAsync() {
            return new Promise((t, r) => {
                if (window.AdInteractive) {
                    if (this.getRewardedType()) {
                        var e = window.AdInteractive.isRewardedVideoAdReady();
                        if (console.info("isRewardReady: ", e), !e) return console.info("android show Reward ads fail by not ready"), void r({
                            code: "android show fail",
                            message: "android show Reward ads fail by not ready"
                        });
                        window.AdInteractive.showRewardedVideoAd()
                    } else {
                        if (!window.AdInteractive.isInterstitialAdReady()) return void r({
                            code: "android show fail",
                            message: "android show Inters ads fail by not ready"
                        });
                        window.AdInteractive.showInterstitialAd()
                    }
                    this._showAdsResult = e => {
                        e ? t() : r({
                            code: "android show fail",
                            message: "android show ads fail"
                        })
                    }
                } else r("Android AdInteractive not exist")
            })
        }
        isReady() {
            return !0
        }
        onShowAdsResult(e, t) {
            console.info("====> android call back show success: ", e), this._showAdsResult ? this._showAdsResult(e, t) : console.info("====> android show ads result error")
        }
    }
    const _i = {
        addCallbackEvent(e) {
            e && 0 < e.length && e.forEach(t => {
                t.ele && t.ele.addEventListener(t.eventName, e => {
                    t.eventFunc && t.eventFunc(e)
                })
            })
        },
        createDailogContainer() {
            let e = document.getElementById("minigameDailogContainer");
            return e || ((e = document.createElement("div")).setAttribute("id", "minigameDailogContainer"), e.setAttribute("style", "font-size: 16px;font-family: Microsoft YaHei;font-weight: 400; position: fixed;top:0;  z-index: 20000; overflow: hidden; width: 100vw;height: 100vh; background-color: rgb(0, 0, 0,0.6);"), document.body.append(e)), e
        },
        removeDailogContainer(e) {
            var t = document.getElementById("minigameDailogContainer");
            t && t.childNodes && t.childNodes.length <= 1 ? t && t.remove() : e && e instanceof Function && e()
        }
    };
    class bi {
        constructor(e, t) {
            this.currentContainerElement = null, this.currentContainerParentElement = null, this.currentSpecialContainerRootElement = null, this.ifCommonAd = !0, this.container = null, this.adProperties = null, this.adCloseCallback = null, this.adsCallBack = null, this.currentContainerElement = null, this.currentContainerParentElement = null, this.currentSpecialContainerRootElement = null, e && e.containerObj && (this.container = e.containerObj), e.adProperties ? this.adProperties = e.adProperties : this.adProperties = {}, this.ifCommonAd = e.ifCommonAd, this.adsCallBack = t, this.loadScript()
        }
        showAd(i) {
            return h(this, void 0, void 0, function* () {
                return new Promise((r, s) => h(this, void 0, void 0, function* () {
                    var e, t;
                    try {
                        null != (t = this.adsCallBack) && t.onShow(), this.ifCommonAd ? yield this._addAdToContainer() : yield this._addAdToSpecilContainer(i), null != (e = this.adsCallBack) && e.onSuccess(), this.adCloseCallback = {}, this.adCloseCallback.call = () => {
                            var e;
                            r(), null != (e = this.adsCallBack) && e.onClose()
                        }
                    } catch (e) {
                        null != (t = this.adsCallBack) && t.onFail(), s({
                            code: "show taboola ad error",
                            message: e.message
                        })
                    }
                }))
            })
        }
        closeAd() {
            var e;
            return this.ifCommonAd && this.currentContainerElement ? (null != (e = this.adCloseCallback) && e.call(), this.currentContainerElement.remove(), Promise.resolve(!0)) : !this.ifCommonAd && this.currentSpecialContainerRootElement ? (null != (e = this.adCloseCallback) && e.call(), this._removeSpecilContainer(), Promise.resolve(!0)) : Promise.resolve(!1)
        }
        loadScript() { }
        _setAttributesToElememt(e, t) {
            if (e && t)
                for (const s in e) {
                    var r;
                    Object.hasOwnProperty.call(e, s) && (r = e[s], t.setAttribute(s, r))
                }
        }
        _addAdToContainer() {
            try {
                var t = document.createElement("div"),
                    r = (t.setAttribute("id", this.container.id), this.currentContainerElement = t, this._setAttributesToElememt(this.container.propertysObj, t), document.querySelector("" + this.container.containerStr));
                if (r)
                    if (this.currentContainerParentElement = r, this.container.ifInsertBefore) {
                        let e = null;
                        r.hasChildNodes() && (e = r.childNodes[0]), r.insertBefore(t, e)
                    } else r.appendChild(t);
                return Promise.resolve(!0).then(e => (this._setAd(), this._displayAd(), e))
            } catch (e) {
                return console.error("show taboola ad is error", e), Promise.resolve(!1)
            }
        }
        _addAdToSpecilContainer(t) {
            try {
                var e = `    
        <div style="overflow: hidden;width: 100vw;height: 100vh;background-color: #262626;">
            <div style="display: flex;justify-content: center;border: 1px solid transparent;border-radius: 4px;height: 8vh;background-color: #424242;line-height: 8vh;font-family: Google Sans, Roboto, Arial, sans-serif;font-size: 20px;color: #f5f5f5">
                Ad
                <div style="display: flex;position: absolute;right: 0;flex-direction: row;align-items: center;padding-right: 4%;height: inherit;cursor: pointer;">
                    <div>
                        <div id="closeAd" style="display: ${t.closeTime < 0 ? "flex" : "none"};align-items: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path style="fill: #f5f5f5"
                                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z">
                                </path>
                                <path fill="none" d="M0 0h24v24H0V0z"></path>
                            </svg>
                        </div>
                        <div id="autoSkidAd" style="display:${0 <= t.closeTime ? "block" : "none"}; font-size: 12px">
                        Reward in <span id="autoSkidAdNum">${t.closeTime}</span> seconds
                        </div>
                    </div>
                </div>
            </div>
            <div id="specilContainerTaboolaAd" style="display: flex;flex-direction: column;justify-content: center;align-items: center;width: 100vw;height: 92vh;">

            </div>
        </div>
        `,
                    r = document.createElement("div"),
                    s = (r.setAttribute("style", "position: absolute;z-index:5;width:100%;height:100%"), r.innerHTML = e, _i.createDailogContainer().append(r), this.currentContainerParentElement = r.querySelector("#specilContainerTaboolaAd"), this.currentSpecialContainerRootElement = r, document.createElement("div"));
                s.setAttribute("id", this.container.id), this.currentContainerElement = s, this._setAttributesToElememt(this.container.propertysObj, s), this.currentContainerParentElement.appendChild(s);
                const i = r.querySelector("#closeAd"),
                    n = r.querySelector("#autoSkidAd"),
                    o = r.querySelector("#autoSkidAdNum"),
                    a = (i.addEventListener("click", () => {
                        this.closeAd()
                    }), e => {
                        o.innerText = e, e--, setTimeout(() => {
                            0 < (o.innerText = e) ? a(e) : t.ifautoClose ? this.closeAd() : (i.style.display = "flex", n.style.display = "none")
                        }, 1e3)
                    });
                return a(t.closeTime), Promise.resolve(!0).then(e => (this._setAd(), this._displayAd(), e))
            } catch (e) {
                return console.error("show taboola ad is error", e), Promise.resolve(!1)
            }
        }
        _removeSpecilContainer() {
            _i.removeDailogContainer(() => {
                this.currentSpecialContainerRootElement && this.currentSpecialContainerRootElement.remove()
            })
        }
        _setAd() {
            window._taboola = window._taboola || [], window._taboola.push(Object.assign({
                target_type: "mix"
            }, this.adProperties))
        }
        _displayAd() {
            window._taboola = window._taboola || [], window._taboola.push({
                flush: !0
            })
        }
    }
    bi.ifLoadScript = !1;
    class Si extends bi {
        constructor(e) {
            e.ifCommonAd = !0, super(e)
        }
        showAd() {
            return super.showAd()
        }
        closeAd() {
            return super.closeAd()
        }
    }
    class xi extends bi {
        constructor(e, t) {
            e.taboolaParam.ifCommonAd = !1, e.closeInfo.closeTime = -1, super(e.taboolaParam, t), this.closeProperties = null, this.closeProperties = e.closeInfo
        }
        showAd() {
            return super.showAd(this.closeProperties)
        }
        closeAd() {
            return super.closeAd().then(e => (this.closeProperties.closeBackFunc && this.closeProperties.closeBackFunc instanceof Function && this.closeProperties.closeBackFunc(), e))
        }
    }
    class Ti extends bi {
        constructor(e, t) {
            e.taboolaParam.ifCommonAd = !1, super(e.taboolaParam, t), this.closeProperties = null, this.closeProperties = e.closeInfo
        }
        showAd() {
            return super.showAd(this.closeProperties)
        }
        closeAd() {
            return super.closeAd().then(e => (this.closeProperties.closeBackFunc && this.closeProperties.closeBackFunc instanceof Function && this.closeProperties.closeBackFunc(), e))
        }
    }
    class Pi extends N {
        constructor() {
            super(...arguments), this._curAd = null, this._strategyName = "TaboolaStrategy"
        }
        loadAsync() {
            try {
                var e = {
                    taboolaParam: {
                        containerObj: {
                            id: "taboola-mobile-below-article-thumnbnails_interstitial",
                            propertysObj: {
                                style: "width: 340px;height:450px;overflow: hidden;margin: auto;background: white;"
                            }
                        },
                        adProperties: {
                            mode: "thumbnails-a1",
                            container: "taboola-mobile-below-article-thumnbnails_interstitial",
                            placement: "Mobile below article thumnbnails_Interstitial" + (this.getRewardedType() ? `_${window.channelName}.rewarded` : `_${window.channelName}.interstitial`)
                        },
                        ifCommonAd: !1
                    },
                    closeInfo: {
                        closeTime: 5,
                        ifautoClose: !1,
                        closeBackFunc: () => { }
                    }
                };
                return this.getRewardedType() ? (e.closeInfo.closeBackFunc = () => {
                    console.info("TaboolaRewardAd close")
                }, this._curAd = new Ti(e, this.getAdsCallbackOption())) : (e.closeInfo.closeBackFunc = () => {
                    console.info("TaboolaInterstitialAd close")
                }, this._curAd = new xi(e, this.getAdsCallbackOption())), Promise.resolve()
            } catch (e) {
                return Promise.reject({
                    code: `load ${this.getRewardedType() ? "TaboolaRewardedVideoAd" : "TaboolaInterstitialAd"} error`,
                    message: e
                })
            }
        }
        showAsync() {
            return h(this, void 0, void 0, function* () {
                try {
                    return yield this._curAd.showAd(), Promise.resolve()
                } catch (e) {
                    return Promise.reject({
                        code: `show ${this.getRewardedType() ? "TaboolaRewardedVideoAd" : "TaboolaInterstitialAd"} error`,
                        message: e
                    })
                }
            })
        }
        isReady() {
            return !0
        }
    }
    class Ri {
        constructor(e, t, r) {
            this.adName = "", this.dailogContainerElement = null, this.currentContainerElement = null, this.currentContainerParentElement = null, this.currentSpecialContainerRootElement = null, this.container = null, this.adCloseCallback = null, this.adsCallBack = null, this.displayAdFunc = null, this.closeProperties = null, this.ifContainerOnLoad = !1, this.currentContainerElement = null, this.currentContainerParentElement = null, this.currentSpecialContainerRootElement = null, this.ifContainerOnLoad = t, e && (this.closeProperties = e.closeInfo, e.surfaceParam) && (e.surfaceParam.containerObj && (this.container = e.surfaceParam.containerObj), this.adName = e.surfaceParam.adName || "packageSurfaceAd", e.surfaceParam.preloadFunc instanceof Function && (this.preloadFunc = e.surfaceParam.preloadFunc), this.displayAdFunc = e.surfaceParam.displayAdFunc), this.adsCallBack = r
        }
        setClosePropertiesFunc(e) {
            e && (this.closeProperties = e)
        }
        loadAd() {
            return new Promise((e, t) => h(this, void 0, void 0, function* () {
                try {
                    this.preloadFunc && this.preloadFunc(), this.ifContainerOnLoad && (yield this._addAdToSpecilContainer()), e()
                } catch (e) {
                    t({
                        code: `load ${this.adName} ad error`,
                        message: e.message
                    })
                }
            }))
        }
        showAd() {
            return new Promise((r, s) => h(this, void 0, void 0, function* () {
                var e, t;
                try {
                    null != (t = this.adsCallBack) && t.onShow(), this.ifContainerOnLoad || (yield this._addAdToSpecilContainer()), this.timeFunc(this.closeProperties.closeTime), this.dailogContainerElement.style.display = "", this.currentSpecialContainerRootElement.style.display = "", null != (e = this.adsCallBack) && e.onSuccess(), this.adCloseCallback = {}, this.adCloseCallback.call = () => {
                        var e;
                        r(), null != (e = this.adsCallBack) && e.onClose()
                    }
                } catch (e) {
                    null != (t = this.adsCallBack) && t.onFail(), s({
                        code: `show ${this.adName} ad error`,
                        message: e.message
                    })
                }
            }))
        }
        closeAd() {
            var e;
            return this.currentSpecialContainerRootElement ? (null != (e = this.adCloseCallback) && e.call(), this.dailogContainerElement.style.display = "none", this._removeSpecilContainer(), this.closeProperties.closeBackFunc && this.closeProperties.closeBackFunc instanceof Function && this.closeProperties.closeBackFunc(), Promise.resolve(!0)) : Promise.resolve(!1)
        }
        _setAttributesToElememt(e, t) {
            if (e && t)
                for (const s in e) {
                    var r;
                    Object.hasOwnProperty.call(e, s) && (r = e[s], t.setAttribute(s, r))
                }
        }
        _addAdToSpecilContainer() {
            const t = this.closeProperties;
            try {
                var e = `    
        <div style="overflow: hidden;width: 100vw;height: 100vh;background-color: #262626;">
            <div style="display: flex;justify-content: center;border: 1px solid transparent;border-radius: 4px;height: 8vh;background-color: #424242;line-height: 8vh;font-family: Google Sans, Roboto, Arial, sans-serif;font-size: 20px;color: #f5f5f5">
                Ad
                <div style="display: flex;position: absolute;right: 0;flex-direction: row;align-items: center;padding-right: 4%;height: inherit;cursor: pointer;">
                    <div>
                        <div id="closeAd" style="display: ${t.closeTime < 0 ? "flex" : "none"};align-items: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path style="fill: #f5f5f5"
                                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z">
                                </path>
                                <path fill="none" d="M0 0h24v24H0V0z"></path>
                            </svg>
                        </div>
                        <div id="autoSkidAd" style="display:${0 <= t.closeTime ? "block" : "none"}; font-size: 12px">
                        Reward in <span id="autoSkidAdNum">${t.closeTime}</span> seconds
                        </div>
                    </div>
                </div>
            </div>
            <div id="specilContainerSurfaceAd" style="display: flex;flex-direction: column;justify-content: center;align-items: center;width: 100vw;height: 92vh;">

            </div>
        </div>
        `,
                    r = document.createElement("div"),
                    s = (r.setAttribute("style", "position: absolute;z-index:5;width:100%;height:100%"), r.innerHTML = e, this.currentContainerParentElement = r.querySelector("#specilContainerSurfaceAd"), this.currentSpecialContainerRootElement = r, document.createElement("div"));
                s.setAttribute("id", this.container.id), this.container.text && (s.innerHTML = this.container.text), this.currentContainerElement = s, this._setAttributesToElememt(this.container.propertysObj, s), this.currentContainerParentElement.appendChild(s);
                const i = r.querySelector("#closeAd"),
                    n = r.querySelector("#autoSkidAd"),
                    o = r.querySelector("#autoSkidAdNum");
                return i.addEventListener("click", () => {
                    this.closeAd()
                }), this.timeFunc = e => {
                    o.innerText = e, e--, setTimeout(() => {
                        0 < (o.innerText = e) ? this.timeFunc(e) : t.ifautoClose ? this.closeAd() : (i.style.display = "flex", n.style.display = "none")
                    }, 1e3)
                }, this.dailogContainerElement = C.createDailogContainer(!0), this.currentSpecialContainerRootElement.style.display = "none", this.dailogContainerElement.append(r), Promise.resolve(!0).then(e => (this._displayAd(), e))
            } catch (e) {
                return console.error(`add to ${this.adName} specil container is error`, e), Promise.resolve(!1)
            }
        }
        _removeSpecilContainer() {
            C.removeDailogContainer(() => {
                this.currentSpecialContainerRootElement && this.currentSpecialContainerRootElement.remove()
            })
        }
        _displayAd() {
            this.displayAdFunc && this.displayAdFunc()
        }
    }
    class Ci extends Ri {
        constructor(e, t, r) {
            super(e, t, r), e.closeInfo.closeTime = -1, this.setClosePropertiesFunc(e.closeInfo)
        }
        loadAd() {
            return super.loadAd()
        }
        showAd() {
            return super.showAd()
        }
        closeAd() {
            return super.closeAd().then(e => e)
        }
    }
    class ki extends Ri {
        constructor(e, t, r) {
            super(e, t, r), this.setClosePropertiesFunc(e.closeInfo)
        }
        loadAd() {
            return super.loadAd()
        }
        showAd() {
            return super.showAd()
        }
        closeAd() {
            return super.closeAd().then(e => e)
        }
    }
    const Ii = {
        mda: wi,
        adsense: ui,
        taboola: Pi,
        android: Ai,
        adivery: class extends N {
            constructor() {
                super(...arguments), this._curAd = null, this._strategyName = "AdiveryStrategy"
            }
            loadAsync() {
                return new Promise((t, r) => {
                    var e = this.getPlacementID();
                    this.getRewardedType() ? Adivery.requestRewardedAd(e).then(e => {
                        console.info("adivery Rewarded loaded"), this._curAd = e, t()
                    }, e => {
                        console.info("Failed to load adivery rewarded: ", e), r({
                            code: "ADIVERY_REWARD_LOAD_ERROR",
                            message: e.message
                        })
                    }) : Adivery.requestInterstitialAd(e).then(e => {
                        console.log("Interstitial ad loaded"), this._curAd = e, t()
                    }, e => {
                        console.error("Failed to load interstitial ad", e), r({
                            code: "ADIVERY_INTERSTITIAL_LOAD_ERROR",
                            message: e.message
                        })
                    })
                })
            }
            showAsync() {
                return new Promise((t, r) => {
                    this._curAd ? this.getRewardedType() ? this._curAd.show().then(e => {
                        e ? (console.log("Rewarded ad watched completely"), t()) : (console.log("Rewarded ad closed without reward"), r({
                            code: "dismissed",
                            message: "Rewarded ad closed without reward"
                        }))
                    }, e => {
                        console.info("Failed to display rewarded ad", e), r({
                            code: "ADIVERY_INTERSTITIAL_SHOW_ERROR",
                            message: e.message
                        })
                    }) : this._curAd.show().then(() => {
                        console.info("Adivery Interstitial ad displayed"), t()
                    }, e => {
                        console.info("Adivery Failed to display insterstitial ad", e), r({
                            code: "ADIVERY_INTERSTITIAL_SHOW_ERROR",
                            message: e.message
                        })
                    }) : (console.info("adivery instance null"), r({
                        code: "ADIVERY_INSTANCE_NULL",
                        message: "curAd is null"
                    }))
                })
            }
            isReady() {
                return null !== this._curAd
            }
        },
        admanager: class extends N {
            constructor() {
                super(...arguments), this._curAd = null, this._strategyName = "AdManagerStrategy"
            }
            loadAsync() {
                return new Promise((t, r) => {
                    var e;
                    this.getRewardedType() ? (console.log("(admanager placementID is:", this.getPlacementID()), e = this.getPlacementID(), new Promise((s, i) => {
                        console.log("admanager loadRewardedSlot");
                        const n = window.googletag || {
                            cmd: []
                        };
                        let o = null,
                            a;
                        n.cmd.push(function () {
                            if (o = n.defineOutOfPageSlot(e || "/22817871455/ca-games-pub-3168355978380813-tag", n.enums.OutOfPageFormat.REWARDED)) {
                                o.addService(n.pubads());
                                const t = function (e) {
                                    n.pubads().removeEventListener("rewardedSlotReady", t), console.log("admanager rewardedSlotReady", e), a = e, s({
                                        rewardedSlot: o,
                                        rewardedSlotReadyEvent: a
                                    })
                                },
                                    r = (n.pubads().addEventListener("rewardedSlotReady", t), function (e) {
                                        n.pubads().removeEventListener("slotResponseReceived", r), console.log("admanager slotResponseReceived", e);
                                        var e = e.slot,
                                            t = e.getResponseInformation();
                                        console.log("admanager slotResponseReceived getResponseInformation", t), e !== o || t || i()
                                    });
                                n.pubads().addEventListener("slotResponseReceived", r), n.enableServices(), n.display(o), n.cmd.push(() => {
                                    n.pubads().refresh([o])
                                })
                            }
                        })
                    }).then(({
                        rewardedSlotReadyEvent: e
                    }) => {
                        e ? (console.info("admanager Rewarded loaded"), this._curAd = e, t()) : (console.info("admanager Rewarded not loaded"), r({
                            code: "ADMANAGER_REWARDED_LOAD_ERROR",
                            message: "admanager Rewarded not loaded"
                        }))
                    }).catch(e => {
                        console.info("admanager Rewarded not loaded, error:", e), r({
                            code: "ADMANAGER_REWARDED_LOAD_ERROR",
                            message: (null == e ? void 0 : e.message) || "Failed to load admanager Rewarded"
                        })
                    })) : r({
                        code: "ADMANAGER_INTERSTITIAL_LOAD_ERROR",
                        message: "admanager not support interstitial yet"
                    })
                })
            }
            showAsync() {
                return new Promise((t, r) => {
                    var o;
                    this._curAd ? this.getRewardedType() ? (o = [{
                        rewardedSlotReadyEvent: this._curAd
                    }["rewardedSlotReadyEvent"]][0], new Promise((i, e) => {
                        console.log("admanager makeRewardedVisible", {
                            rewardedSlotReadyEvent: o
                        });
                        const n = window.googletag || {
                            cmd: []
                        };
                        if (o) {
                            let s;
                            n.cmd.push(() => {
                                const t = function (e) {
                                    n.pubads().removeEventListener("rewardedSlotGranted", t), console.log("admanager rewardedSlotGranted", e), s = e.payload
                                },
                                    r = function (e) {
                                        n.pubads().removeEventListener("rewardedSlotClosed", r), console.log("admanager rewardedSlotClosed", e), i(s)
                                    };
                                n.pubads().addEventListener("rewardedSlotClosed", r), n.pubads().addEventListener("rewardedSlotGranted", t)
                            }), o.makeRewardedVisible()
                        }
                    }).then(e => {
                        e ? (this.getAdsCallbackOption().onSuccess(), console.log("admanager Rewarded ad watched completely"), t()) : r({
                            code: "dismissed",
                            message: "Rewarded ad closed without reward"
                        })
                    })) : r({
                        code: "ADMANAGER_INTERSTITIAL_SHOW_ERROR",
                        message: "admanager not support show interstitial yet"
                    }) : (console.info("admanager instance null"), r({
                        code: "ADMANAGER_INSTANCE_NULL",
                        message: "curAd is null"
                    }))
                })
            }
            isReady() {
                return null !== this._curAd
            }
        },
        bridge: class extends N {
            constructor() {
                super(...arguments), this._curAd = !1, this._strategyName = "BridgeStrategy", this._BridgePlacementId = "ads_minigame_splash", this._options = {}
            }
            loadAsync() {
                return new Promise((t, r) => {
                    window.dywxBridge.preloadAd(this._BridgePlacementId, this._options, new window.DYWXBridge.AdCallback({
                        onAdLoaded: e => {
                            this._curAd = !0, console.log("[bridge]: step into onAdLoaded callback, result:", e), t()
                        },
                        onAdFailedToLoad: function (e) {
                            console.error("[bridge]: step into onAdFailedToLoad, result:", e), r({
                                code: "BRIDGE_REWARD_LOAD_ERROR",
                                message: e
                            })
                        }
                    }))
                })
            }
            showAsync() {
                return new Promise((t, r) => {
                    this._curAd ? window.dywxBridge.showAd(this._BridgePlacementId, this._options, new window.DYWXBridge.AdCallback({
                        onAdImpression: e => {
                            console.log("[bridge]: step into onAdImpression, result:", e), t()
                        },
                        onAdError: e => {
                            console.log("[bridge]: step into onAdError, result:", e), r({
                                code: "dismissed",
                                message: "Rewarded ad closed without reward"
                            })
                        }
                    })) : (console.info("[bridge]: bridge instance is not ready"), r({
                        code: "BRIDGE_INSTANCE_NOT_READY",
                        message: "curAd is fail"
                    }))
                })
            }
            isReady() {
                return this._curAd
            }
        },
        packageAdmanager: class extends N {
            constructor() {
                super(...arguments), this._curAd = null, this._strategyName = "PackageAdmanagerStrategy", this._curAdName = ""
            }
            loadAsync() {
                return h(this, void 0, void 0, function* () {
                    try {
                        this._curAdName = this.getRewardedType() ? "PackageAdmanagerRewardAd" : "PackageAdmanagerInterstitialAd";
                        const r = this._curAdName + "-display-" + (new Date).getTime(),
                            s = this.getPlacementID();
                        let e;
                        var t = {
                            surfaceParam: {
                                containerObj: {
                                    id: r,
                                    propertysObj: {
                                        style: "min-width: 300px; min-height: 60px;margin: auto;"
                                    }
                                },
                                adName: "PackageAdmanager",
                                preloadFunc: () => {
                                    window.googletag = window.googletag || {
                                        cmd: []
                                    }, window.googletag.cmd.push(function () {
                                        e = window.googletag.defineSlot(s, [
                                            [300, 250],
                                            [320, 480],
                                            [336, 280],
                                            [300, 600]
                                        ], r).addService(window.googletag.pubads()), window.googletag.enableServices()
                                    })
                                },
                                displayAdFunc: () => {
                                    window.googletag.cmd.push(function () {
                                        window.googletag.display(r)
                                    })
                                }
                            },
                            closeInfo: {
                                closeTime: 5,
                                ifautoClose: !1,
                                closeBackFunc: () => { }
                            }
                        };
                        return t.closeInfo.closeBackFunc = () => {
                            console.info(this._curAdName + " close")
                        }, this.getRewardedType() ? this._curAd = new ki(t, !1, this.getAdsCallbackOption()) : this._curAd = new Ci(t, !1, this.getAdsCallbackOption()), yield this._curAd.loadAd(), Promise.resolve()
                    } catch (e) {
                        return Promise.reject({
                            code: `load ${this._curAdName} error`,
                            message: e
                        })
                    }
                })
            }
            showAsync() {
                return h(this, void 0, void 0, function* () {
                    try {
                        return yield this._curAd.showAd(), Promise.resolve()
                    } catch (e) {
                        return Promise.reject({
                            code: `show ${this._curAdName} error`,
                            message: e
                        })
                    }
                })
            }
            isReady() {
                return null != this._curAd
            }
        },
        playit: class extends N {
            constructor() {
                super(...arguments), this._strategyName = "PlayitStragegy"
            }
            loadAsync() {
                return this.getRewardedType() && window.WebViewJavascriptBridge.callHandler("prepareReward"), Promise.resolve()
            }
            showAsync() {
                return new Promise((t, r) => {
                    const s = window.WebViewJavascriptBridge;
                    this.invokeJavaNextLevel(() => {
                        this.getRewardedType() ? s.callHandler("hasRewardAd", {}, function (e) {
                            JSON.parse(e).hasAd ? s.callHandler("showReward", {}, function (e) {
                                e = JSON.parse(e);
                                e.close && (e.reward ? (s.callHandler("prepareReward"), t()) : r({
                                    code: "PLAYIT_REWARD_ERROR",
                                    message: "playit reward show error"
                                }))
                            }) : r({
                                code: "PLAYIT_REWARD_ERROR",
                                message: "playit reward is not ready"
                            })
                        }) : s.callHandler("hasInterstitial", {}, function (e) {
                            JSON.parse(e).hasAd ? s.callHandler("showInterstitial", {}, function (e) {
                                JSON.parse(e).suc ? t() : r({
                                    code: "PLAYIT_INTERST_ERROR",
                                    message: "playit interst show error"
                                })
                            }) : r({
                                code: "PLAYIT_INTERST_ERROR",
                                message: "playit interst is not ready"
                            })
                        })
                    })
                })
            }
            isReady() {
                return !0
            }
            invokeJavaNextLevel(e) {
                window.WebViewJavascriptBridge ? e && e() : document.addEventListener("WebViewJavascriptBridgeReady", function () {
                    e && e()
                }, !1)
            }
        }
    };
    class Ei extends hi {
        constructor(e, t, r) {
            super(e), this._config = null, this._next = null, this._curSucTimes = 0, this._curAdName = "", this._config = t, this._next = r
        }
        loadAsync(r) {
            return h(this, void 0, void 0, function* () {
                try {
                    var e, t;
                    return this._curSucTimes < this._config.showTimes || -1 === this._config.showTimes ? void 0 === (e = Ii[this._config.adsName]) ? (this._isFinish = !0, this._next && this._next(), console.info(`======> error: ${this._config.adsName} waterfall strategy not found, exec queue next`), Promise.reject({
                        code: ws.ADS_NETWORK_NOT_FOUND,
                        message: this._config.adsName + " waterfall strategy not found"
                    })) : ((t = new e(this._config.placementId || r, this._isReward)).setAdsCallback({
                        onShow: () => {
                            console.log(`====> ${this._curAdName} show`)
                        },
                        onSuccess: () => {
                            console.log(`====> ${this._curAdName} success`), this._curSucTimes++, this._curSucTimes === this._config.showTimes && (this._isFinish = !0, this._next) && this._next(), this._refreshTotalShowTimeCallback && this._refreshTotalShowTimeCallback()
                        },
                        onFail: () => {
                            console.log(`====> ${this._curAdName} failed`)
                        },
                        onClick: () => {
                            console.log(`====> ${this._curAdName} clicked`)
                        },
                        onClose: () => {
                            console.log(`====> ${this._curAdName} closed`)
                        }
                    }), t.setAdName(this._config.adsName), yield di(t.getAdName(), t.getAdTypeName(), "load", t.loadAsync.bind(t)), this._adInstants.push(t), Promise.resolve()) : Promise.reject({
                        code: "load waterFall ad error",
                        message: "has reach showTimes"
                    })
                } catch (e) {
                    return Promise.reject({
                        code: "load waterFall ad error",
                        message: e.message
                    })
                }
            })
        }
        showAsync() {
            return h(this, void 0, void 0, function* () {
                try {
                    var e;
                    return this._adInstants.length <= 0 ? Promise.reject({
                        code: "show adInstant error",
                        message: "there is no ad instant"
                    }) : this._curSucTimes < this._config.showTimes || -1 === this._config.showTimes ? (e = this._adInstants.shift(), this._curAdName = e.getStrategyName(), this._curAdInstant = e, yield di(e.getAdName(), e.getAdTypeName(), "show", e.showAsync.bind(e)), Promise.resolve()) : void 0
                } catch (e) {
                    return Promise.reject(e)
                }
            })
        }
        getCurAdName() {
            return this._curAdName = this._adInstants[0].getStrategyName(), this._curAdName
        }
        getLoadTimeInterval() {
            let e = 0;
            return this._config || (e = 0, console.info("adsWaterFall's config null")), e = this._config.timeInterval || 0
        }
    }
    class Bi extends hi {
        constructor(e, t) {
            super(e), this.adsNames = [], this.curAdName = "", this.adsNames = this.adsNames.concat(t)
        }
        loadAsync(a) {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = Ii,
                        t = Math.floor(Math.random() * this.adsNames.length),
                        r = this.adsNames[t],
                        s = e[r],
                        i = {
                            onShow: () => {
                                console.log(`====> ${this.curAdName} show`)
                            },
                            onSuccess: () => {
                                console.log(`====> ${this.curAdName} success`), this._refreshTotalShowTimeCallback && this._refreshTotalShowTimeCallback()
                            },
                            onFail: () => {
                                console.log(`====> ${this.curAdName} failed`)
                            },
                            onClick: () => {
                                console.log(`====> ${this.curAdName} clicked`)
                            },
                            onClose: () => {
                                console.log(`====> ${this.curAdName} closed`)
                            }
                        };
                    if (this._adInstants.length <= 0)
                        for (let e = 0; e < 2; e++) {
                            var n = new s(a, this._isReward);
                            n.setAdName(r), this._adInstants.push(n), n.setAdsCallback(i), yield di(n.getAdName(), n.getAdTypeName(), "load", n.loadAsync.bind(n))
                        } else {
                        var o = new s(a, this._isReward);
                        o.setAdName(r), this._adInstants.push(o), o.setAdsCallback(i), yield di(o.getAdName(), o.getAdTypeName(), "load", o.loadAsync.bind(o))
                    }
                    return Promise.resolve()
                } catch (e) {
                    return Promise.reject({
                        code: "load keep bottom ad error",
                        message: e.message
                    })
                }
            })
        }
        showAsync() {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = this._adInstants.shift();
                    return this.curAdName = e.getStrategyName(), this._curAdInstant = e, yield di(e.getAdName(), e.getAdTypeName(), "show", e.showAsync.bind(e)), Promise.resolve()
                } catch (e) {
                    return Promise.reject({
                        code: "Keep_Bottom_ad_show_error",
                        message: e.message
                    })
                }
            })
        }
        getCurAdName() {
            return this.curAdName = this._adInstants[0].getStrategyName(), this.curAdName
        }
    }
    class Di extends hi {
        constructor(e, t) {
            super(e), this.adsNames = [], this.adsNames = this.adsNames.concat(t)
        }
        loadAsync(n) {
            return h(this, void 0, void 0, function* () {
                if (0 === this.adsNames.length) return console.info("====> No Substitute Ads's config"), Promise.resolve();
                try {
                    var t, r = {
                        adsense: ui,
                        taboola: Pi,
                        android: Ai,
                        mda: wi
                    };
                    const s = {
                        AfgStrategy: "adsense",
                        TaboolaStrategy: "taboola",
                        AndroidStrategy: "android",
                        MdaStrategy: "mda"
                    };
                    for (let e = 0; e < this.adsNames.length; e++) {
                        const i = this.adsNames[e];
                        this._adInstants.some((e, t, r) => {
                            e = e.getStrategyName();
                            return s[e] === i
                        }) || ((t = new r[i](n, this._isReward)).setAdName(i), this._adInstants.push(t), yield di(t.getAdName(), t.getAdTypeName(), "load", t.loadAsync.bind(t)))
                    }
                    return Promise.resolve()
                } catch (e) {
                    return console.info("====> load substitute ad error: ", e.message), Promise.resolve()
                }
            })
        }
        showAsync(s) {
            return h(this, void 0, void 0, function* () {
                // if (0 === this.adsNames.length) return console.info("====> No Substitute Ads's config"), Promise.reject({
                // 	code: "AdsSubstitute show error",
                // 	message: "No Substitute Ads's config"
                // });
                try {
                    return this._refreshTotalShowTimeCallback && this._refreshTotalShowTimeCallback();
                    var e = this._adInstants.find(e => e.getStrategyName() !== s);
                    if (!e) return Promise.reject({
                        code: "AdsSubstitute show error",
                        message: s + " is the same with substitute ad"
                    });
                    this._curAdInstant = e;
                    var t = this._adInstants.indexOf(e);
                    this._adInstants.splice(t, 1);
                    const r = e.getStrategyName();
                    return e.setAdsCallback({
                        onShow: () => {
                            console.log(`====> ${r} success`)
                        },
                        onSuccess: () => {
                            console.log(`====> ${r} success`), this._refreshTotalShowTimeCallback && this._refreshTotalShowTimeCallback()
                        },
                        onFail: () => {
                            console.log(`====> ${r} failed`)
                        },
                        onClick: () => {
                            console.log(`====> ${r} clicked`)
                        },
                        onClose: () => {
                            console.log(`====> ${r} closed`)
                        }
                    }), yield di(e.getAdName(), e.getAdTypeName(), "show", e.showAsync.bind(e)), Promise.resolve()
                } catch (e) {
                    return Promise.reject(e)
                }
            })
        }
    } (vt = T = T || {}).waterFall = "waterFall", vt.keepBottom = "keepBottom";
    class Ni {
        constructor(e, t, r) {
            this.config = null, this.isReward = !1, this.lastShowTime = 0, this.enabled = !0, this.limitTime = 0, this.adsWaterFall = [], this.adsWaterFallQueue = [], this.adsKeepBottom = null, this.adsSubstitute = null, this.queue = null, this.adState = T.waterFall, this.curAds = null, this.curShowTimes = 0, this.placementID = "", this.isReward = e, this.config = t, this.enabled = !r && this.config.enabled, this.limitTime = this.config.limitTime, this.adsKeepBottom = new Bi(this.isReward, this.config.strategy.keepBottom), this.adsSubstitute = new Di(this.isReward, this.config.strategy.substitute), this.queue = new li, this.pushToQueue(), this.onComplete(), this.queue.play()
        }
        pushToQueue() {
            this.config.strategy.waterFall.forEach((s, e, t) => {
                this.queue.push((t, e, r) => h(this, void 0, void 0, function* () {
                    var e = new Ei(this.isReward, s, t);
                    this.adsWaterFall.push(e), e.refreshTotalShowTimeCallback = () => {
                        this.lastShowTime = u.getTimeBySecond(), this.curShowTimes++
                    }
                }))
            })
        }
        onComplete() {
            this.queue.complete = () => h(this, void 0, void 0, function* () {
                this.adState = T.keepBottom, console.info("====> waterFall ads finish."), yield this.adsKeepBottom.loadAsync(this.placementID), console.info("====> preload keepBottom ads")
            })
        }
        loadAsync(r) {
            return h(this, void 0, void 0, function* () {
                if (0 === this.placementID.length && (this.placementID = r), !this.enabled) return le(`load ${this.isReward ? "rewardAd" : "interstitialAd"} is disabled`), Promise.resolve();
                try {
                    var e, t;
                    return yield this.adsSubstitute.loadAsync(r), this.adState === T.waterFall ? (e = this.adsWaterFall.find(e => !1 === e.IsFinish), this.adsWaterFallQueue.push(e), t = (this.adsWaterFallQueue.length - 1) * e.getLoadTimeInterval(), yield u.waitTime(1e3 * t), yield e.loadAsync(r), Promise.resolve()) : this.adState === T.keepBottom ? this.adsKeepBottom.loadAsync(r) : Promise.reject({
                        code: "Ads load  error",
                        message: "ad state error"
                    })
                } catch (e) {
                    return e.code === ws.ADS_NETWORK_NOT_FOUND ? this.adState === T.waterFall ? this.adsWaterFall.find(e => !1 === e.IsFinish).loadAsync(r) : this.adState === T.keepBottom ? this.adsKeepBottom.loadAsync(r) : Promise.reject({
                        code: "Ads load  error",
                        message: "ad state error"
                    }) : Promise.reject({
                        code: this.adState + " load ad error",
                        message: e.message
                    })
                }
            })
        }
        showAsync() {
            return h(this, void 0, void 0, function* () {
                if (!this.enabled) return le(`show ${this.isReward ? "rewardAd" : "interstitialAd"} is disabled`), Promise.resolve();
                if (this.curShowTimes >= this.config.totalTimes && -1 !== this.config.totalTimes) return Promise.reject({
                    code: `show ${this.isReward ? "rewardAd" : "interstitialAd"} error`,
                    message: "had reach the max show times"
                });
                var e, t = u.getTimeBySecond() - this.lastShowTime;
                if (t < this.limitTime) return Promise.reject({
                    code: `show ${this.isReward ? "rewardAd" : "interstitialAd"} frequently`,
                    message: this.limitTime - t + " seconds remain"
                });
                let r = "";
                try {
                    return this.adState === T.waterFall ? (e = this.adsWaterFall.find(e => !1 === e.IsFinish), r = e.getCurAdName(), yield (this.curAds = e).showAsync(), Promise.resolve()) : this.adState === T.keepBottom ? (r = this.adsKeepBottom.getCurAdName(), this.curAds = this.adsKeepBottom, yield this.adsKeepBottom.showAsync(), this.lastShowTime = u.getTimeBySecond(), this.curShowTimes++, Promise.resolve()) : Promise.reject({
                        code: "load ad error",
                        message: "ad state error"
                    })
                } catch (e) {
                    if ("dismissed" === e.code) return Promise.reject({
                        code: `show ${this.isReward ? "rewardAd" : "interstitialAd"} error`,
                        message: e.message
                    });
                    this.curAds = this.adsSubstitute;
                    try {
                        return yield this.adsSubstitute.showAsync(r), this.curShowTimes++, Promise.resolve()
                    } catch (e) {
                        return Promise.reject(e)
                    }
                }
            })
        }
        onShowAdsResult(e, t) {
            console.info(`====> ${this.isReward ? "rewardAd" : "interstitialAd"} show result: ${e}, this.curAds: ` + this.curAds), this.curAds ? this.curAds.onShowAdsResult(e, t) : console.error("adsController onShowAdsResult error: cur ads is null")
        }
    }
    class Oi { }
    class Fi extends Oi {
        constructor() {
            super(...arguments), this._showBannerResult = null, this._hideBannerResult = null
        }
        showBannerAsync(e) {
            return new Promise((t, r) => {
                window.AdInteractive ? (window.AdInteractive.showBannerAd(), this._showBannerResult = e => {
                    e ? t() : r({
                        code: "android show fail",
                        message: "android show banner ads fail"
                    })
                }) : r("Android AdInteractive not exist")
            })
        }
        hideBannerAsync() {
            return new Promise((t, r) => {
                window.AdInteractive ? (window.AdInteractive.hideBannerAd(), this._hideBannerResult = e => {
                    e ? t() : r({
                        code: "android hide fail",
                        message: "android hide banner ads fail"
                    })
                }) : r("Android AdInteractive not exist")
            })
        }
        onShowBannerResult(e) {
            this._showBannerResult ? this._showBannerResult(e) : console.error("android show banner result error")
        }
        onHideBannerResult(e) {
            this._hideBannerResult ? this._hideBannerResult(e) : console.error("android hide banner result error")
        }
    }
    class qi extends Oi {
        constructor() {
            super(...arguments), this._bannerElement = "minigameTaboolaBanner"
        }
        showBannerAsync(e) {
            try {
                var t = document.createElement("div"),
                    r = (t.setAttribute("id", "minigameTaboolaBanner"), t.setAttribute("style", "font-size: 16px;font-family: Microsoft YaHei;font-weight: 400; position: fixed;bottom:0;  z-index: 19999; overflow: hidden; width: 100vw;height: 80px; background-color: black;display: flex;align-items: end;justify-content: center;"), document.body.append(t), {
                        containerObj: {
                            id: "taboola-below-article-thumbnails_stream",
                            containerStr: "#" + this._bannerElement,
                            ifInsertBefore: !1,
                            propertysObj: {
                                style: "width:320px;height:70px;overflow: hidden;background: #fff;"
                            }
                        },
                        adProperties: {
                            mode: "thumbnails-stream",
                            container: "taboola-below-article-thumbnails_stream",
                            placement: `Below Article Thumbnails_Stream_${window.channelName}.game.banner`
                        }
                    });
                return new Si(r).showAd()
            } catch (e) {
                return Promise.reject({
                    code: "show tabool banner error",
                    message: e.message
                })
            }
        }
        hideBannerAsync() {
            var e = document.getElementById(this._bannerElement);
            return e && e.remove(), Promise.resolve()
        }
    }
    class Mi extends Oi {
        constructor() {
            super(...arguments), this._bannerElement = "minigameTaboolaBanner"
        }
        showBannerAsync(e) {
            try {
                var t = document.createElement("div"),
                    r = (t.setAttribute("id", "minigameTaboolaBanner"), t.setAttribute("style", "font-size: 16px;font-family: Microsoft YaHei;font-weight: 400; position: fixed;bottom:0;  z-index: 19999; overflow: hidden; width: 100vw;height: 80px; background-color: black;display: flex;align-items: end;justify-content: center;"), document.body.append(t), {
                        containerObj: {
                            id: "taboola-mobile-stream-thumbnails",
                            containerStr: "#" + this._bannerElement,
                            ifInsertBefore: !1,
                            propertysObj: {
                                style: "width:320px;height:70px;overflow: hidden;background: #fff;"
                            }
                        },
                        adProperties: {
                            mode: "thumbnails-a-stream",
                            container: "taboola-mobile-stream-thumbnails",
                            placement: "Mobile Stream Thumbnails"
                        }
                    });
                return new Si(r).showAd()
            } catch (e) {
                return Promise.reject({
                    code: "show playit taboola banner error",
                    message: e.message
                })
            }
        }
        hideBannerAsync() {
            var e = document.getElementById(this._bannerElement);
            return e && e.remove(), Promise.resolve()
        }
    }
    class Li {
        constructor(e, t) {
            this.enabled = !0, this._config = null, this._curBannerAd = null, this.curShowTimes = 0, this._config = e, this.enabled = !t && this._config.enabled
        }
        showBannerAsync(t) {
            console.log("showBanner");
            Unity.call("showBanner");
            return h(this, void 0, void 0, function* () {
                if (!this.enabled) return le("show banner is disabled"), Promise.resolve();
                if (this.curShowTimes >= this._config.totalTimes && -1 !== this._config.totalTimes) return Promise.reject({
                    code: "show banner error",
                    message: "banner show times is over"
                });
                try {
                    var e = new {
                        taboola: qi,
                        android: Fi,
                        playitTaboola: Mi
                    }[this._config.adsName];
                    return yield (this._curBannerAd = e).showBannerAsync(t), this.curShowTimes++, Promise.resolve()
                } catch (e) {
                    return Promise.reject(e)
                }
            })
        }
        hideBannerAsync() {
            console.log("hideBanner");
            Unity.call("hideBanner");
            return this.enabled ? this._curBannerAd.hideBannerAsync() : (le("hide banner is disabled"), Promise.resolve())
        }
        onShowBannerResult(e, t) {
            var r;
            this._curBannerAd ? null != (r = this._curBannerAd) && r.onShowBannerResult(e, t) : console.error("ShowBanner Android Callback Error: cur bannnerAd is null")
        }
        onHideBannerResult(e, t) {
            var r;
            this._curBannerAd ? null != (r = this._curBannerAd) && r.onHideBannerResult(e, t) : console.error("HideBanner Android Callback Error: cur bannnerAd is null")
        }
    }
    class ji {
        constructor() {
            this._config = null
        }
        get config() {
            return this._config
        }
        static get instance() {
            return this._instance || (this._instance = new ji), this._instance
        }
        fetchConfigAsync(r) {
            return h(this, void 0, void 0, function* () {
                try {
                    var e = r,
                        t = yield fetch(e);
                    return 404 === t.status ? Promise.reject({
                        code: "No_Config_File",
                        message: "there is no config file " + e
                    }) : (this._config = yield t.json(), console.info("fetch MinigameAd config success: ", this._config), Promise.resolve())
                } catch (e) {
                    return Promise.reject({
                        code: "fetch MinigameAd fail",
                        message: e.message
                    })
                }
            })
        }
    }
    ji._instance = null;
    const Hi = ji.instance,
        Ui = {
            adType: {
                interstitial: {
                    enabled: !0,
                    limitTime: 30,
                    totalTimes: -1,
                    strategy: {
                        waterFall: [{
                            adsName: "adsense",
                            showTimes: -1
                        }],
                        keepBottom: [],
                        substitute: []
                    }
                },
                reward: {
                    enabled: !0,
                    limitTime: 0,
                    totalTimes: -1,
                    strategy: {
                        waterFall: [{
                            adsName: "adsense",
                            showTimes: -1
                        }],
                        keepBottom: ["adsense"],
                        substitute: ["adsense"]
                    }
                },
                banner: {
                    enabled: !1,
                    adsName: "taboola",
                    totalTimes: 3
                },
                preroll: {
                    adsName: "adsense",
                    preload: "on"
                }
            }
        },
        zi = e => {
            var t, r;
            return e.enabled ? ({
                waterFall: e,
                keepBottom: t,
                substitute: r
            } = e.strategy, e = [...e.map(e => e.adsName), ...t, ...r], [...new Set([...e])]) : []
        };
    class $i {
        constructor() {
            this.interstitialAdsController = null, this.rewardAdsController = null, this.bannerAdsController = null, this.config = null, this.disabledAd = !1
        }
        static get instance() {
            return this._instance || (this._instance = new $i), this._instance
        }
        setConfig() {
            this.config = Hi.config || Ui
        }
        getConfig() {
            return this.config
        }
        getDisableAds() {
            return this.disabledAd
        }
        setDisableAds(e) {
            this.disabledAd = e || !1, this.disabledAd && le("[minigame] ads disabled")
        }
        initScripts(r) {
            var s;
            return h(this, void 0, void 0, function* () {
                var e, i, n, t = [...new Set([...zi(this.config.adType.interstitial), ...zi(this.config.adType.reward)].concat(this.config.adType.banner.enabled ? [this.config.adType.banner.adsName] : []).concat(null != (s = this.config.adType.preroll) && s.adsName ? [this.config.adType.preroll.adsName] : []))];
                e = t, i = r, n = {
                    ima: {
                        adTargetUrl: null == (s = this.config.adType.preroll) ? void 0 : s.adTargetUrl,
                        preload: (null == (s = this.config.adType.preroll) ? void 0 : s.preload) || "on"
                    }
                }, yield h(void 0, void 0, void 0, function* () {
                    const r = {
                        adsense: ni,
                        adivery: ti,
                        admanager: ei,
                        bridge: ri,
                        packageAdmanager: ei,
                        ima: Zs,
                        taboola: ii,
                        playitTaboola: si
                    },
                        s = [];
                    return e.forEach(e => {
                        var t;
                        r[e] && ("ima" === e && null != (t = null == n ? void 0 : n.ima) && t.adTargetUrl ? s.push(r[e](n.ima)) : s.push(r[e](i)))
                    }), Promise.all(s)
                })
            })
        }
        createAdInstants() {
            return h(this, void 0, void 0, function* () {
                this.rewardAdsController = new Ni(!0, this.config.adType.reward, this.getDisableAds()), this.interstitialAdsController = new Ni(!1, this.config.adType.interstitial, this.getDisableAds()), this.bannerAdsController = new Li(this.config.adType.banner, this.getDisableAds())
            })
        }
        loadAsync(e, t) {
            e=true;
            if(t){
                return this._refreshTotalShowTimeCallback && this._refreshTotalShowTimeCallback();
            }
            return console.info("====> load AD placementId: ", e, "isReward: ", t), (t ? this.rewardAdsController : this.interstitialAdsController).loadAsync(e)
        }
        showAsync(e) {
            if (e) {

                console.log("showReward");
                Unity.call("showReward");
            } else {

                console.log("showInter");
                Unity.call("showInter");
            }
            return console.info("====> show AD isReward: ", e), (e ? this.rewardAdsController : this.interstitialAdsController).showAsync()
        }
        loadBannerAsync(e) {
            return this.bannerAdsController.showBannerAsync(e)
        }
        hideBannerAsync() {
            return this.bannerAdsController.hideBannerAsync()
        }
        showPrerollAsync() {
            var e, t, r;
            return c.isH5AndroidApp() ? this.interstitialAdsController.showAsync() : (e = "adsense" === (null == (e = this.config.adType.preroll) ? void 0 : e.adsName), t = "ima" === (null == (t = this.config.adType.preroll) ? void 0 : t.adsName), r = void 0 === (null == (r = this.config.adType.preroll) ? void 0 : r.preload) || "on" === (null == (r = this.config.adType.preroll) ? void 0 : r.preload), t ? r ? function () {
                return h(this, void 0, void 0, function* () {
                    D("showPrerollWithPreloadAsync"), zs = !0, Qs()
                })
            }() : function (e, t) {
                return h(this, void 0, void 0, function* () {
                    D("showPrerollAsync", {
                        adTargetUrl: e,
                        container: t
                    }), zs = !1, Xs(e, t)
                })
            }(null == (t = this.config.adType.preroll) ? void 0 : t.adTargetUrl) : e ? se(U.preroll, "preroll", void 0) : this.interstitialAdsController.showAsync())
        }
        onShowAdsResult(e, t, r) {
            console.info(`=====> androidCallJs onShowAdsResult isReward: ${e}, isSuccess: ${t}, message: ` + r), (e ? this.rewardAdsController : this.interstitialAdsController).onShowAdsResult(t, r)
        }
        onShowBannerResult(e, t) {
            console.info(`=====> androidCallJs onShowBannerResult isSuccess: ${e}, errMessage: ` + t), this.bannerAdsController.onShowBannerResult(e, t)
        }
        onHideBannerResult(e, t) {
            console.info(`=====> androidCallJs onHideBannerResult isSuccess: ${e}, errMessage: ` + t), this.bannerAdsController.onHideBannerResult(e, t)
        }
    }
    $i._instance = null;
    const O = $i.instance;
    window.showProllAsync = O.showPrerollAsync.bind(O), window.onShowAdsResult = O.onShowAdsResult.bind(O), window.onShowBannerResult = O.onShowBannerResult.bind(O), window.onHideBannerResult = O.onHideBannerResult.bind(O);
    class Wi extends t {
        static createRequest(e) {
            return {
                type: Wi.requestType,
                payload: e
            }
        }
        static createService() {
            return new Wi(Wi.requestType, !1, Wi.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            var e = t.payload.placementId,
                r = t.payload.isRewardedAd;
            return t.payload.uid, O.loadAsync(e, r).then(() => (console.info("====>load Ads success"), Promise.resolve(i(t)))).catch(e => Promise.resolve(n(t, e.code, e.message)))
        }
    }
    Wi.requestType = "AFGAdInstantLoadService";
    class Gi extends t {
        static createService() {
            return new Gi(Gi.requestType, !1, Gi.handleRequestAsync)
        }
        static createRequest(e) {
            return {
                type: Gi.requestType,
                payload: e
            }
        }
        static handleRequestAsync(r) {
            return h(this, void 0, void 0, function* () {
                var e = r.payload.isRewardedAd ? U.reward : U.next,
                    t = r.payload.placementId;
                return r.payload.uid, console.info(`===> show ad: ${e}|` + t), O.showAsync(r.payload.isRewardedAd).then(() => (console.info("====>show ads: success"), Promise.resolve(i(r)))).catch(e => (console.info("====>showAdsStrategy show ads: failed: ", e), Promise.resolve(n(r, e.code, e.message))))
            })
        }
    }
    Gi.requestType = "AFGAdInstantShowService";
    const Ki = {
        PROGRESS: "MINIGAME_PROGRESS",
        INIT: "MINIGAME_INIT",
        START_GAME: "MINIGAME_START_GAME"
    };
    class Yi extends t {
        static createRequest(e) {
            return {
                type: Yi.requestType,
                payload: e
            }
        }
        static createService() {
            return new Yi(Yi.requestType, !1, Yi.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            return R.setDataAsync(t.payload).then(() => Promise.resolve(i(t))).catch(e => Promise.resolve(n(t, e.code, e.message)))
        }
    }
    Yi.requestType = "StorageInstantSetDataService";
    class Vi extends t {
        static createRequest(e) {
            return {
                type: Vi.requestType,
                payload: e
            }
        }
        static createService() {
            return new Vi(Vi.requestType, !1, Vi.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            return R.getDataAsync(t.payload).then(e => Promise.resolve(i(t, e))).catch(e => Promise.resolve(n(t, e.code, e.message)))
        }
    }
    Vi.requestType = "StorageInstantGetDataService";
    class Ji extends t {
        static createRequest(e) {
            return {
                type: Ji.requestType,
                payload: e
            }
        }
        static createService() {
            return new Ji(Ji.requestType, !1, Ji.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            return O.loadBannerAsync(t.payload).then(() => Promise.resolve(i(t))).catch(e => Promise.reject(n(t, e.code, e.message)))
        }
    }
    Ji.requestType = "BannerShowService";
    class Qi extends t {
        static createRequest() {
            return {
                type: Qi.requestType
            }
        }
        static createService() {
            return new Qi(Qi.requestType, !1, Qi.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            return O.hideBannerAsync().then(() => Promise.resolve(i(t))).catch(e => Promise.reject(n(t, e.code, e.message)))
        }
    }
    Qi.requestType = "BannerHideService";
    class Xi extends t {
        static createRequest() {
            return {
                type: Xi.requestType
            }
        }
        static createService() {
            return new Xi(Xi.requestType, !1, Xi.handleRequestAsync)
        }
        static handleRequestAsync(r) {
            return new Promise((e, t) => {
                e(i(r, c))
            })
        }
    }
    Xi.requestType = "CommonInfoService";
    const Zi = class yn {
        constructor() {
            this._shareResult = null
        }
        static get instance() {
            return this._instance || (this._instance = new yn), this._instance
        }
        shareAsync(t) {
            return new Promise((r, s) => {
                var e;
                window.AdInteractive ? (console.info("====> AdInteractive.share : ", t), window.AdInteractive.share(t.image, null == (e = t.media) ? void 0 : e.gif.url, null == (e = t.media) ? void 0 : e.video.url), this._shareResult = (e, t) => {
                    console.info("====> onShareResult isSuccess: " + e), e ? r() : s({
                        code: "android share fail",
                        message: t
                    })
                }) : (console.info("====> android share fail by no AdInteractive"), s({
                    code: "android share fail",
                    message: "android share fail by no AdInteractive"
                }))
            })
        }
        onShareResult(e, t) {
            this._shareResult ? this._shareResult(e, t) : console.error(`onShareResult === isSuccess : ${e}, errMessage : ` + t)
        }
    }.instance;
    window.onShareResult = Zi.onShareResult.bind(Zi);
    class en extends t {
        static createRequest(e) {
            return {
                type: en.requestType,
                payload: e
            }
        }
        static createService() {
            return new en(en.requestType, !1, en.handleRequestAsync)
        }
        static handleRequestAsync(t) {
            return Zi.shareAsync(t.payload).then(() => Promise.resolve(i(t))).catch(e => Promise.resolve(n(t, e.code, e.message)))
        }
    }
    en.requestType = "ShareService";
    class tn extends t {
        static createRequest(e) {
            return {
                type: tn.requestType,
                payload: e
            }
        }
        static createService() {
            return new tn(tn.requestType, !1, tn.handleRequestAsync)
        }
        static handleRequestAsync(e) {
            var t;
            return window.AdInteractive ? (window.AdInteractive.trackEvent(e.payload), console.info("====> android trackEvent " + e.payload), Promise.resolve(i(e))) : (t = {
                code: "ANDROID_INSTANCE_ERROR",
                message: "Android AdInteractive not exist"
            }, Promise.resolve(n(e, t.code, t.message)))
        }
    }
    tn.requestType = "AndroidLogEventService";
    class rn {
        onGameEvent(t) {
            var r = new URLSearchParams(window.location.search);
            if (r.has("clickid")) {
                var s = r.get("clickid");
                let e = "";
                r.has("gaid") && (e = r.get("gaid"));
                r = {}, t = (r.subject = t.eventName, t.label && (r.eventValue = t.label), {});
                t.channelId = c.getChannelName(), t.gameId = c.minigameOption.game_id, t.clickId = s, t.event = r, t.ts = "" + u.getTimeBySecond(), 0 < e.length && (t.gaid = e), this.reportToMinigameEventGateway(t), console.info("====> reportModel: ", t)
            } else console.error("location search hasn't clickid field")
        }
        reportToMinigameEventGateway(a) {
            return h(this, void 0, void 0, function* () {
                var e = q.post,
                    t = (new Date).toUTCString().toString(),
                    r = vs.SHA256,
                    s = vs.enc.Base64,
                    i = vs.HmacSHA512,
                    n = a,
                    r = "SHA-256=" + s.stringify(r(JSON.stringify(n))),
                    s = s.stringify(i(`(request-target): post /${_s.ADFLY_REPORT_PUBLISH}
x-date: ${t}
digest: ` + r, "HMACSHA512-SecretKey")),
                    i = new Headers,
                    s = (i.append("Authorization", `Signature keyId="write",algorithm="hmac-sha512",headers="(request-target) x-date digest",signature="${s}"`), i.append("Content-Type", "application/json"), i.append("x-date", t), i.append("digest", r), {
                        method: e,
                        headers: i,
                        body: JSON.stringify(n)
                    });
                const o = _s.ADFLY_REPORT_DOMAIN + "/" + _s.ADFLY_REPORT_PUBLISH;
                console.info("=====> reportToMinigameEventGateway: ", JSON.stringify(n)), yield fetch(o, s).then(e => {
                    e.ok ? (e.json(), console.info(`====> reportToMinigameEventGateway post ${o} success response: ` + JSON.stringify(e.json()))) : console.error(`====> reportToMinigameEventGateway post ${o} fail status: ` + e.status)
                }).catch(e => {
                    console.error("====> reportToMinigameEventGateway setData error: " + e.message)
                })
            })
        }
    }
    class sn {
        static get instance() {
            return this._instance || (this._instance = new sn), this._instance
        }
        constructor() {
            this._curReport = null, this._curReport = new rn
        }
        onGameEvent(e) {
            e ? this._curReport ? this._curReport.onGameEvent(e) : console.error("cur report instance is null") : console.error("report event is null")
        }
    }
    sn._instance = null;
    const nn = sn.instance;
    class on extends t {
        static createRequest(e) {
            return {
                type: on.requestType,
                payload: e
            }
        }
        static createService() {
            return new on(on.requestType, !1, on.handleRequestAsync)
        }
        static handleRequestAsync(e) {
            return nn.onGameEvent(e.payload), Promise.resolve(i(e))
        }
    }
    on.requestType = "GameEventReportService";
    const an = {
        show(e) {
            const t = e.autoCloseTime || 2;
            var r = e.top || "50%";
            const s = e.finalTop || "30%";
            var i = e.left || "50%";
            const n = document.createElement("div");
            n.innerHTML = `<div style="transition: all 0.5s ease-out;position: fixed;top: -100%;left:${i};transform: translate(-50%,0%);z-index: 20002;width:100%;text-align: center;">
            <div style="display: inline-block;font-size: 12px;font-weight: 500;color: #F2F8FF;line-height: 17px;background: rgba(20,31,43,0.8);max-width: 280px;min-width: 100px;min-height: 20px;border-radius: 9px;word-break: break-word;padding: 10px;">
                <div>${e.message}</div>
            </div>
        </div>`, document.body.append(n), n.firstChild.style.top = r, setTimeout(() => {
                n.firstChild.style.top = s, setTimeout(() => {
                    n.remove()
                }, 1e3 * t)
            }, 1)
        },
        error(e) {
            e.autoCloseTime && (this.autoCloseTime = e.autoCloseTime);
            const t = e.autoCloseTime || 1;
            var r = e.top || "50%";
            const s = e.finalTop || "0px";
            var i = e.left || "50%";
            const n = document.createElement("div");
            n.innerHTML = `<div  style="transition: all 0.5s ease-out;border: 1px solid #fde2e2;color:#f56c6c;background: #fef0f0;max-width: 300px;min-height: 20px;position: fixed;top: -100%;left:${i};transform: translate(-50%,0%);z-index: 20001;border-radius: 4px;word-break: break-word;padding: 10px;">
                <div>
                    <svg t="1655971895182" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3456" width="20" height="20"><path d="M827.392 195.584q65.536 65.536 97.792 147.456t32.256 167.936-32.256 167.936-97.792 147.456-147.456 98.304-167.936 32.768-168.448-32.768-147.968-98.304-98.304-147.456-32.768-167.936 32.768-167.936 98.304-147.456 147.968-97.792 168.448-32.256 167.936 32.256 147.456 97.792zM720.896 715.776q21.504-21.504 18.944-49.152t-24.064-49.152l-107.52-107.52 107.52-107.52q21.504-21.504 24.064-49.152t-18.944-49.152-51.712-21.504-51.712 21.504l-107.52 106.496-104.448-104.448q-21.504-20.48-49.152-23.04t-49.152 17.92q-21.504 21.504-21.504 52.224t21.504 52.224l104.448 104.448-104.448 104.448q-21.504 21.504-21.504 51.712t21.504 51.712 49.152 18.944 49.152-24.064l104.448-104.448 107.52 107.52q21.504 21.504 51.712 21.504t51.712-21.504z" p-id="3457" fill="#f56c6c"></path></svg>
                </div>
                <div>${e.message}</div>
            </div>`, document.body.append(n), n.firstChild.style.top = r, setTimeout(() => {
                n.firstChild.style.top = s, setTimeout(() => {
                    n.remove()
                }, 1e3 * t)
            }, 1)
        }
    };
    class cn extends t {
        static createRequest(e) {
            return {
                type: this.requestType,
                payload: e
            }
        }
        static createService() {
            return new cn(this.requestType, !1, this.handleRequestAsync)
        }
        static handleRequestAsync(r) {
            const s = r.payload;
            return void 0 === s ? Promise.resolve(i(r)) : new Promise((t, e) => {
                try {
                    window.xwJsbCallback = e => {
                        t(i(r))
                    }, window.xworld.jsbridge(JSON.stringify({
                        method: "finishGame",
                        params: {
                            relay_data: s.relay_data,
                            score: s.score
                        },
                        callback: "xwJsbCallback"
                    }))
                } catch (e) {
                    an.show({
                        message: e.message
                    }), console.error("sharp report score error: ", e.message), t(i(r))
                }
            })
        }
    }
    cn.requestType = "SharpMatchService";
    let dn = "gamepage.html",
        ln = "gamepageFrame";
    const hn = {
        startServiceServer: function () {
            k.createDefaultInstance(), k.instance.start()
        },
        setGamePageUrl: function (e) {
            dn = e
        },
        setGamePageFrame: function (e) {
            ln = e
        },
        loadGamePage: function () {
            var e, t;
            e = dn, t = ln, t = document.getElementById(t), console.assert(null != t), t.src = e
        },
        onWindowLoad: function () {
            window.removeEventListener("load", hn.onWindowLoad), hn.startServiceServer(), hn.loadGamePage()
        },
        registerProgressService: function (e) {
            k.instance.registerQuickService(Ki.PROGRESS, !0, s.createQuickHandler(e))
        },
        registerInitGameService: function (e) {
            k.instance.registerQuickService(Ki.INIT, !0, s.createQuickHandler(e))
        },
        registerStartGameService: function (e) {
            k.instance.registerQuickService(Ki.START_GAME, !0, s.createQuickHandler(e))
        },
        enableAfgService(e, t) {
            k.instance.registerService(Wi.createService()), k.instance.registerService(Gi.createService()), k.instance.registerService(Ji.createService()), k.instance.registerService(Qi.createService()), k.instance.registerService(Yi.createService()), k.instance.registerService(Vi.createService()), k.instance.registerService(Xi.createService()), k.instance.registerService(en.createService()), k.instance.registerService(qs.createService()), k.instance.registerService(js.createService()), k.instance.registerService(Ls.createService()), k.instance.registerService(Hs.createService()), k.instance.registerService(Ms.createService()), c.isH5AndroidApp() && k.instance.registerService(tn.createService()), k.instance.registerService(on.createService()), c.isSharpMatch() && k.instance.registerService(cn.createService())
        },
        loadConfigAsync(i) {
            return h(this, void 0, void 0, function* () {
                var e, t;
                i = e = -1 === (e = i).indexOf("st=") ? -1 === e.indexOf("?") ? e + "?st=" + (new Date).getTime() : e + "&st=" + (new Date).getTime() : e;
                try {
                    var r = i.replace("config", "realization");
                    yield Hi.fetchConfigAsync(r)
                } catch (e) {
                    console.error("load MinigameAd: ", e)
                }
                O.setConfig();
                let s;
                try {
                    s = yield oi(i)
                } catch (e) {
                    console.error("loadConfigAsync :", e)
                }
                O.setDisableAds(null === s || void 0 === s ? void 0 : s.ads_disabled), O.getDisableAds() || (yield O.initScripts(s)), O.createAdInstants();
                try {
                    c.init(s), R.init()
                } catch (e) {
                    console.error("init config error: ", e)
                }
                try {
                    t = s, window.AdInteractive && t.game_id && (window.AdInteractive.changeGame(t.game_id), console.info("gameId: ", t.game_id))
                } catch (e) {
                    console.info("sendGameIdToAndroid error: ", e)
                }
                try {
                    I.init()
                } catch (e) {
                    console.error("init payments error: ", e)
                }
                return console.info("===> configOptions: ", s), s
            })
        },
        registerLogEvent: function (e) {
            e = e, ai = e
        },
        receiveCommonData(e) {
            c.playPageData = e
        },
        version: "1.3 b0019"
    };
    console.info("MiniGameCenter SDK version: " + hn.version), window.minigameCenter = hn
});
