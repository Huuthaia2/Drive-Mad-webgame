var Module = typeof Module != "undefined" ? Module : {};
if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
    if (Module["ENVIRONMENT_IS_PTHREAD"]) return;
    var loadPackage = function(metadata) {
        var PACKAGE_PATH = "";
        if (typeof window === "object") {
            PACKAGE_PATH = window["encodeURIComponent"](
                window.location.pathname
                .toString()
                .substring(0, window.location.pathname.toString().lastIndexOf("/")) +
                "/"
            );
        } else if (
            typeof process === "undefined" &&
            typeof location !== "undefined"
        ) {
            PACKAGE_PATH = encodeURIComponent(
                location.pathname
                .toString()
                .substring(0, location.pathname.toString().lastIndexOf("/")) + "/"
            );
        }
        var PACKAGE_NAME = "index.data";
        var REMOTE_PACKAGE_BASE = "index.data";
        if (
            typeof Module["locateFilePackage"] === "function" &&
            !Module["locateFile"]
        ) {
            Module["locateFile"] = Module["locateFilePackage"];
            err(
                "warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)"
            );
        }
        var REMOTE_PACKAGE_NAME = Module["locateFile"] ?
            Module["locateFile"](REMOTE_PACKAGE_BASE, "") :
            REMOTE_PACKAGE_BASE;
        var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];

        function fetchRemotePackage(packageName, packageSize, callback, errback) {
            if (
                typeof process === "object" &&
                typeof process.versions === "object" &&
                typeof process.versions.node === "string"
            ) {
                require("fs").readFile(packageName, function(err, contents) {
                    if (err) {
                        errback(err);
                    } else {
                        callback(contents.buffer);
                    }
                });
                return;
            }
            var xhr = new XMLHttpRequest();
            xhr.open("GET", packageName, true);
            xhr.responseType = "arraybuffer";
            xhr.onprogress = function(event) {
                var url = packageName;
                var size = packageSize;
                if (event.total) size = event.total;
                if (event.loaded) {
                    if (!xhr.addedTotal) {
                        xhr.addedTotal = true;
                        if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
                        Module.dataFileDownloads[url] = {
                            loaded: event.loaded,
                            total: size,
                        };
                    } else {
                        Module.dataFileDownloads[url].loaded = event.loaded;
                    }
                    var total = 0;
                    var loaded = 0;
                    var num = 0;
                    for (var download in Module.dataFileDownloads) {
                        var data = Module.dataFileDownloads[download];
                        total += data.total;
                        loaded += data.loaded;
                        num++;
                    }
                    total = Math.ceil((total * Module.expectedDataFileDownloads) / num);
                    if (Module["setStatus"])
                        Module["setStatus"](
                            "Downloading data... (" + loaded + "/" + total + ")"
                        );
                } else if (!Module.dataFileDownloads) {
                    if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
                }
            };
            xhr.onerror = function(event) {
                throw new Error("NetworkError for: " + packageName);
            };
            xhr.onload = function(event) {
                if (
                    xhr.status == 200 ||
                    xhr.status == 304 ||
                    xhr.status == 206 ||
                    (xhr.status == 0 && xhr.response)
                ) {
                    var packageData = xhr.response;
                    callback(packageData);
                } else {
                    throw new Error(xhr.statusText + " : " + xhr.responseURL);
                }
            };
            xhr.send(null);
        }

        function handleError(error) {
            console.error("package error:", error);
        }
        var fetchedCallback = null;
        var fetched = Module["getPreloadedPackage"] ?
            Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) :
            null;
        if (!fetched)
            fetchRemotePackage(
                REMOTE_PACKAGE_NAME,
                REMOTE_PACKAGE_SIZE,
                function(data) {
                    if (fetchedCallback) {
                        fetchedCallback(data);
                        fetchedCallback = null;
                    } else {
                        fetched = data;
                    }
                },
                handleError
            );

        function runWithFS() {
            function assert(check, msg) {
                if (!check) throw msg + new Error().stack;
            }
            Module["FS_createPath"]("/", "assets", true, true);
            Module["FS_createPath"]("/assets", "blocks", true, true);
            Module["FS_createPath"]("/assets", "views", true, true);
            Module["FS_createPath"]("/assets", "games", true, true);
            Module["FS_createPath"]("/assets", "sounds", true, true);

            function DataRequest(start, end, audio) {
                this.start = start;
                this.end = end;
                this.audio = audio;
            }
            DataRequest.prototype = {
                requests: {},
                open: function(mode, name) {
                    this.name = name;
                    this.requests[name] = this;
                    Module["addRunDependency"]("fp " + this.name);
                },
                send: function() {},
                onload: function() {
                    var byteArray = this.byteArray.subarray(this.start, this.end);
                    this.finish(byteArray);
                },
                finish: function(byteArray) {
                    var that = this;
                    Module["FS_createDataFile"](
                        this.name,
                        null,
                        byteArray,
                        true,
                        true,
                        true
                    );
                    Module["removeRunDependency"]("fp " + that.name);
                    this.requests[this.name] = null;
                },
            };
            var files = metadata["files"];
            for (var i = 0; i < files.length; ++i) {
                new DataRequest(
                    files[i]["start"],
                    files[i]["end"],
                    files[i]["audio"] || 0
                ).open("GET", files[i]["filename"]);
            }

            function processPackageData(arrayBuffer) {
                assert(arrayBuffer, "Loading data file failed.");
                assert(
                    arrayBuffer instanceof ArrayBuffer,
                    "bad input to processPackageData"
                );
                var byteArray = new Uint8Array(arrayBuffer);
                DataRequest.prototype.byteArray = byteArray;
                var files = metadata["files"];
                for (var i = 0; i < files.length; ++i) {
                    DataRequest.prototype.requests[files[i].filename].onload();
                }
                Module["removeRunDependency"]("datafile_index.data");
            }
            Module["addRunDependency"]("datafile_index.data");
            if (!Module.preloadResults) Module.preloadResults = {};
            Module.preloadResults[PACKAGE_NAME] = {
                fromCache: false
            };
            if (fetched) {
                processPackageData(fetched);
                fetched = null;
            } else {
                fetchedCallback = processPackageData;
            }
        }
        if (Module["calledRun"]) {
            runWithFS();
        } else {
            if (!Module["preRun"]) Module["preRun"] = [];
            Module["preRun"].push(runWithFS);
        }
    };
    loadPackage({
        files: [{
                filename: "/assets/blocks/ACCELEROMETER_V",
                start: 0,
                end: 313
            },
            {
                filename: "/assets/blocks/ARCH",
                start: 313,
                end: 490
            },
            {
                filename: "/assets/blocks/BALL",
                start: 490,
                end: 635
            },
            {
                filename: "/assets/blocks/BOX",
                start: 635,
                end: 850
            },
            {
                filename: "/assets/blocks/BRICKS",
                start: 850,
                end: 1033
            },
            {
                filename: "/assets/blocks/BUTTERFLY",
                start: 1033,
                end: 2330
            },
            {
                filename: "/assets/blocks/BUTTON",
                start: 2330,
                end: 2853
            },
            {
                filename: "/assets/blocks/BUTTON_B",
                start: 2853,
                end: 3738
            },
            {
                filename: "/assets/blocks/CAMERA_ORBIT",
                start: 3738,
                end: 5126
            },
            {
                filename: "/assets/blocks/COMMENT",
                start: 5126,
                end: 5240
            },
            {
                filename: "/assets/blocks/CpF_LIST_ELEMENT_Cp",
                start: 5240,
                end: 5606,
            },
            {
                filename: "/assets/blocks/DASH_CAT",
                start: 5606,
                end: 7471
            },
            {
                filename: "/assets/blocks/DINO",
                start: 7471,
                end: 12090
            },
            {
                filename: "/assets/blocks/DINO_RED",
                start: 12090,
                end: 13825
            },
            {
                filename: "/assets/blocks/DIRT",
                start: 13825,
                end: 13918
            },
            {
                filename: "/assets/blocks/DIRT_B",
                start: 13918,
                end: 14097
            },
            {
                filename: "/assets/blocks/DIRT_SLAB",
                start: 14097,
                end: 14219
            },
            {
                filename: "/assets/blocks/ECpC_SET_VAR_E",
                start: 14219,
                end: 14596
            },
            {
                filename: "/assets/blocks/ECVV_SET_ANG_LIMITS_E",
                start: 14596,
                end: 15053,
            },
            {
                filename: "/assets/blocks/ECVV_SET_ANG_MOTOR_E",
                start: 15053,
                end: 15508,
            },
            {
                filename: "/assets/blocks/ECVV_SET_ANG_SPRING_E",
                start: 15508,
                end: 15963,
            },
            {
                filename: "/assets/blocks/ECVV_SET_LIN_LIMITS_E",
                start: 15963,
                end: 16418,
            },
            {
                filename: "/assets/blocks/ECVV_SET_LIN_MOTOR_E",
                start: 16418,
                end: 16874,
            },
            {
                filename: "/assets/blocks/ECVV_SET_LIN_SPRING_E",
                start: 16874,
                end: 17324,
            },
            {
                filename: "/assets/blocks/EC_SET_VAR_E",
                start: 17324,
                end: 17579
            },
            {
                filename: "/assets/blocks/EFFF_VOLUME_PITCH_E",
                start: 17579,
                end: 18022,
            },
            {
                filename: "/assets/blocks/EFF_LOOP_EFE",
                start: 18022,
                end: 18392
            },
            {
                filename: "/assets/blocks/EFF_SET_SCORE_E",
                start: 18392,
                end: 18776
            },
            {
                filename: "/assets/blocks/EFF_SFX_PLAY_FE",
                start: 18776,
                end: 19158
            },
            {
                filename: "/assets/blocks/EFpF_SET_VAR_E",
                start: 19158,
                end: 19532
            },
            {
                filename: "/assets/blocks/EFpO_MENU_ITEM_E",
                start: 19532,
                end: 19904
            },
            {
                filename: "/assets/blocks/EFp_DEC_VAR_E",
                start: 19904,
                end: 20170
            },
            {
                filename: "/assets/blocks/EFp_INC_VAR_E",
                start: 20170,
                end: 20442
            },
            {
                filename: "/assets/blocks/EF_INSPECT_E",
                start: 20442,
                end: 20791
            },
            {
                filename: "/assets/blocks/EF_RANDOM_SEED_E",
                start: 20791,
                end: 21179
            },
            {
                filename: "/assets/blocks/EF_SET_VAR_E",
                start: 21179,
                end: 21430
            },
            {
                filename: "/assets/blocks/EF_SFX_STOP_E",
                start: 21430,
                end: 21806
            },
            {
                filename: "/assets/blocks/EOF_SET_BOUNCE_E",
                start: 21806,
                end: 22198
            },
            {
                filename: "/assets/blocks/EOF_SET_FRICTION_E",
                start: 22198,
                end: 22594,
            },
            {
                filename: "/assets/blocks/EOF_SET_MASS_E",
                start: 22594,
                end: 22977
            },
            {
                filename: "/assets/blocks/EOOV_ADD_CONSTRAINT_EC",
                start: 22977,
                end: 23428,
            },
            {
                filename: "/assets/blocks/EOpO_SET_VAR_E",
                start: 23428,
                end: 23802
            },
            {
                filename: "/assets/blocks/EOT_SET_VISIBLE_E",
                start: 23802,
                end: 24180,
            },
            {
                filename: "/assets/blocks/EOVQ_SET_POS_E",
                start: 24180,
                end: 24642
            },
            {
                filename: "/assets/blocks/EOVVV_ADD_FORCE_E",
                start: 24642,
                end: 25155,
            },
            {
                filename: "/assets/blocks/EOVV_SET_LOCKED_E",
                start: 25155,
                end: 25617,
            },
            {
                filename: "/assets/blocks/EOVV_SET_VEL_E",
                start: 25617,
                end: 26075
            },
            {
                filename: "/assets/blocks/EO_COLLISION_EOFVE",
                start: 26075,
                end: 26596,
            },
            {
                filename: "/assets/blocks/EO_CREATE_EO",
                start: 26596,
                end: 26972
            },
            {
                filename: "/assets/blocks/EO_DESTROY_E",
                start: 26972,
                end: 27349
            },
            {
                filename: "/assets/blocks/EO_INSPECT_E",
                start: 27349,
                end: 27697
            },
            {
                filename: "/assets/blocks/EO_SET_VAR_E",
                start: 27697,
                end: 27948
            },
            {
                filename: "/assets/blocks/EQpQ_SET_VAR_E",
                start: 27948,
                end: 28324
            },
            {
                filename: "/assets/blocks/EQ_INSPECT_E",
                start: 28324,
                end: 28675
            },
            {
                filename: "/assets/blocks/EQ_SET_VAR_E",
                start: 28675,
                end: 28928
            },
            {
                filename: "/assets/blocks/ETpT_SET_VAR_E",
                start: 28928,
                end: 29302
            },
            {
                filename: "/assets/blocks/ET_IF_EEE",
                start: 29302,
                end: 29666
            },
            {
                filename: "/assets/blocks/ET_INSPECT_E",
                start: 29666,
                end: 30015
            },
            {
                filename: "/assets/blocks/ET_SET_VAR_E",
                start: 30015,
                end: 30265
            },
            {
                filename: "/assets/blocks/EVpV_SET_VAR_E",
                start: 30265,
                end: 30640
            },
            {
                filename: "/assets/blocks/EVQF_SET_CAM_E",
                start: 30640,
                end: 31090
            },
            {
                filename: "/assets/blocks/EVQ_SET_LIT_E",
                start: 31090,
                end: 31487
            },
            {
                filename: "/assets/blocks/EV_INSPECT_E",
                start: 31487,
                end: 31835
            },
            {
                filename: "/assets/blocks/EV_SET_GRAVITY_E",
                start: 31835,
                end: 32214
            },
            {
                filename: "/assets/blocks/EV_SET_VAR_E",
                start: 32214,
                end: 32466
            },
            {
                filename: "/assets/blocks/E_BUT_SENSOR_EE",
                start: 32466,
                end: 32836
            },
            {
                filename: "/assets/blocks/E_JOY_SENSOR_VE",
                start: 32836,
                end: 33198
            },
            {
                filename: "/assets/blocks/E_LATE_UPDATE_EE",
                start: 33198,
                end: 33563
            },
            {
                filename: "/assets/blocks/E_LOSE_E",
                start: 33563,
                end: 33936
            },
            {
                filename: "/assets/blocks/E_PLAY_EE",
                start: 33936,
                end: 34298
            },
            {
                filename: "/assets/blocks/E_SCREENSHOT_EE",
                start: 34298,
                end: 34687
            },
            {
                filename: "/assets/blocks/E_SWIPE_EVE",
                start: 34687,
                end: 35059
            },
            {
                filename: "/assets/blocks/E_TOUCH_EFFE",
                start: 35059,
                end: 35494
            },
            {
                filename: "/assets/blocks/E_WIN_E",
                start: 35494,
                end: 35871
            },
            {
                filename: "/assets/blocks/FALSE_T",
                start: 35871,
                end: 36118
            },
            {
                filename: "/assets/blocks/FFF_EULER_Q",
                start: 36118,
                end: 36507
            },
            {
                filename: "/assets/blocks/FFF_JOIN_V",
                start: 36507,
                end: 36894
            },
            {
                filename: "/assets/blocks/FF_ADD_F",
                start: 36894,
                end: 37193
            },
            {
                filename: "/assets/blocks/FF_DIV_F",
                start: 37193,
                end: 37487
            },
            {
                filename: "/assets/blocks/FF_EQL_T",
                start: 37487,
                end: 37788
            },
            {
                filename: "/assets/blocks/FF_GT_T",
                start: 37788,
                end: 38097
            },
            {
                filename: "/assets/blocks/FF_LOG_F",
                start: 38097,
                end: 38413
            },
            {
                filename: "/assets/blocks/FF_LT_T",
                start: 38413,
                end: 38720
            },
            {
                filename: "/assets/blocks/FF_MAX_F",
                start: 38720,
                end: 39025
            },
            {
                filename: "/assets/blocks/FF_MIN_F",
                start: 39025,
                end: 39331
            },
            {
                filename: "/assets/blocks/FF_MOD_F",
                start: 39331,
                end: 39625
            },
            {
                filename: "/assets/blocks/FF_MUL_F",
                start: 39625,
                end: 39930
            },
            {
                filename: "/assets/blocks/FF_POW_F",
                start: 39930,
                end: 40229
            },
            {
                filename: "/assets/blocks/FF_RANDOM_F",
                start: 40229,
                end: 40545
            },
            {
                filename: "/assets/blocks/FF_S2W_VV",
                start: 40545,
                end: 40876
            },
            {
                filename: "/assets/blocks/FF_SUB_F",
                start: 40876,
                end: 41174
            },
            {
                filename: "/assets/blocks/FLOWERS",
                start: 41174,
                end: 41311
            },
            {
                filename: "/assets/blocks/FOLDER_EMPTY",
                start: 41311,
                end: 41451
            },
            {
                filename: "/assets/blocks/FOLDER_LOCKED",
                start: 41451,
                end: 41644
            },
            {
                filename: "/assets/blocks/FOLDER_UNKNOWN",
                start: 41644,
                end: 41809
            },
            {
                filename: "/assets/blocks/FOLIAGE",
                start: 41809,
                end: 41901
            },
            {
                filename: "/assets/blocks/FOLIAGE_B",
                start: 41901,
                end: 42076
            },
            {
                filename: "/assets/blocks/FOLIAGE_BOT",
                start: 42076,
                end: 42209
            },
            {
                filename: "/assets/blocks/FOLIAGE_SLAB",
                start: 42209,
                end: 42370
            },
            {
                filename: "/assets/blocks/FOLIAGE_TOP",
                start: 42370,
                end: 42499
            },
            {
                filename: "/assets/blocks/FpF_LIST_ELEMENT_Fp",
                start: 42499,
                end: 42861,
            },
            {
                filename: "/assets/blocks/FRAME_F",
                start: 42861,
                end: 43071
            },
            {
                filename: "/assets/blocks/F_ABS_F",
                start: 43071,
                end: 43288
            },
            {
                filename: "/assets/blocks/F_CEIL_F",
                start: 43288,
                end: 43506
            },
            {
                filename: "/assets/blocks/F_COS_F",
                start: 43506,
                end: 43724
            },
            {
                filename: "/assets/blocks/F_FLOOR_F",
                start: 43724,
                end: 43945
            },
            {
                filename: "/assets/blocks/F_NEG_F",
                start: 43945,
                end: 44158
            },
            {
                filename: "/assets/blocks/F_ROUND_F",
                start: 44158,
                end: 44378
            },
            {
                filename: "/assets/blocks/F_SIN_F",
                start: 44378,
                end: 44600
            },
            {
                filename: "/assets/blocks/GOAL",
                start: 44600,
                end: 45039
            },
            {
                filename: "/assets/blocks/GRASS_A",
                start: 45039,
                end: 45182
            },
            {
                filename: "/assets/blocks/GRASS_B",
                start: 45182,
                end: 45344
            },
            {
                filename: "/assets/blocks/L2R",
                start: 45344,
                end: 45452
            },
            {
                filename: "/assets/blocks/MARKER",
                start: 45452,
                end: 45565
            },
            {
                filename: "/assets/blocks/MOTOR_X",
                start: 45565,
                end: 46196
            },
            {
                filename: "/assets/blocks/MOTOR_Y",
                start: 46196,
                end: 47053
            },
            {
                filename: "/assets/blocks/MOTOR_Z",
                start: 47053,
                end: 47710
            },
            {
                filename: "/assets/blocks/MULTI_IN",
                start: 47710,
                end: 47819
            },
            {
                filename: "/assets/blocks/MULTI_IN_E",
                start: 47819,
                end: 47932
            },
            {
                filename: "/assets/blocks/MULTI_OUT",
                start: 47932,
                end: 48044
            },
            {
                filename: "/assets/blocks/MULTI_OUT_E",
                start: 48044,
                end: 48159
            },
            {
                filename: "/assets/blocks/NONE",
                start: 48159,
                end: 48369
            },
            {
                filename: "/assets/blocks/NUMBER_F",
                start: 48369,
                end: 48618
            },
            {
                filename: "/assets/blocks/OBSTACLE",
                start: 48618,
                end: 48746
            },
            {
                filename: "/assets/blocks/OO_EQL_T",
                start: 48746,
                end: 49049
            },
            {
                filename: "/assets/blocks/OpF_LIST_ELEMENT_Op",
                start: 49049,
                end: 49410,
            },
            {
                filename: "/assets/blocks/O_GET_POS_VQ",
                start: 49410,
                end: 49744
            },
            {
                filename: "/assets/blocks/O_GET_SIZE_VV",
                start: 49744,
                end: 50068
            },
            {
                filename: "/assets/blocks/O_GET_VEL_VV",
                start: 50068,
                end: 50400
            },
            {
                filename: "/assets/blocks/PARTICLE",
                start: 50400,
                end: 50512
            },
            {
                filename: "/assets/blocks/PASS_THROUGH",
                start: 50512,
                end: 50636
            },
            {
                filename: "/assets/blocks/QpF_LIST_ELEMENT_Qp",
                start: 50636,
                end: 51e3,
            },
            {
                filename: "/assets/blocks/QQF_LERP_Q",
                start: 51e3,
                end: 51389
            },
            {
                filename: "/assets/blocks/QQ_MUL_Q",
                start: 51389,
                end: 51692
            },
            {
                filename: "/assets/blocks/QUATERNION_Q",
                start: 51692,
                end: 52037
            },
            {
                filename: "/assets/blocks/Q_EULER_FFF",
                start: 52037,
                end: 52426
            },
            {
                filename: "/assets/blocks/Q_INV_Q",
                start: 52426,
                end: 52641
            },
            {
                filename: "/assets/blocks/SCREEN_SIZE_FF",
                start: 52641,
                end: 52956
            },
            {
                filename: "/assets/blocks/SCRIPT",
                start: 52956,
                end: 53102
            },
            {
                filename: "/assets/blocks/SFX_Fp",
                start: 53102,
                end: 53424
            },
            {
                filename: "/assets/blocks/SHRUB",
                start: 53424,
                end: 53623
            },
            {
                filename: "/assets/blocks/SLATE",
                start: 53623,
                end: 53717
            },
            {
                filename: "/assets/blocks/SLATE_B",
                start: 53717,
                end: 53922
            },
            {
                filename: "/assets/blocks/SLATE_BOT",
                start: 53922,
                end: 54060
            },
            {
                filename: "/assets/blocks/SLATE_NE",
                start: 54060,
                end: 54173
            },
            {
                filename: "/assets/blocks/SLATE_NW",
                start: 54173,
                end: 54293
            },
            {
                filename: "/assets/blocks/SLATE_SE",
                start: 54293,
                end: 54409
            },
            {
                filename: "/assets/blocks/SLATE_SW",
                start: 54409,
                end: 54529
            },
            {
                filename: "/assets/blocks/SLATE_TOP",
                start: 54529,
                end: 54653
            },
            {
                filename: "/assets/blocks/SLIDER",
                start: 54653,
                end: 56555
            },
            {
                filename: "/assets/blocks/SLIDER_X",
                start: 56555,
                end: 56835
            },
            {
                filename: "/assets/blocks/SLIDER_Y",
                start: 56835,
                end: 57156
            },
            {
                filename: "/assets/blocks/SLIDER_Z",
                start: 57156,
                end: 57454
            },
            {
                filename: "/assets/blocks/SPHERE",
                start: 57454,
                end: 57594
            },
            {
                filename: "/assets/blocks/STEEL",
                start: 57594,
                end: 57734
            },
            {
                filename: "/assets/blocks/STICK_DE",
                start: 57734,
                end: 57885
            },
            {
                filename: "/assets/blocks/STICK_DN",
                start: 57885,
                end: 58037
            },
            {
                filename: "/assets/blocks/STICK_DS",
                start: 58037,
                end: 58194
            },
            {
                filename: "/assets/blocks/STICK_DW",
                start: 58194,
                end: 58352
            },
            {
                filename: "/assets/blocks/STICK_NE",
                start: 58352,
                end: 58506
            },
            {
                filename: "/assets/blocks/STICK_NW",
                start: 58506,
                end: 58669
            },
            {
                filename: "/assets/blocks/STICK_SE",
                start: 58669,
                end: 58826
            },
            {
                filename: "/assets/blocks/STICK_SW",
                start: 58826,
                end: 58986
            },
            {
                filename: "/assets/blocks/STICK_UE",
                start: 58986,
                end: 59140
            },
            {
                filename: "/assets/blocks/STICK_UN",
                start: 59140,
                end: 59310
            },
            {
                filename: "/assets/blocks/STICK_US",
                start: 59310,
                end: 59467
            },
            {
                filename: "/assets/blocks/STICK_UW",
                start: 59467,
                end: 59622
            },
            {
                filename: "/assets/blocks/STICK_X",
                start: 59622,
                end: 59764
            },
            {
                filename: "/assets/blocks/STICK_Y",
                start: 59764,
                end: 59913
            },
            {
                filename: "/assets/blocks/STICK_Z",
                start: 59913,
                end: 60051
            },
            {
                filename: "/assets/blocks/STONE",
                start: 60051,
                end: 60145
            },
            {
                filename: "/assets/blocks/STONE_B",
                start: 60145,
                end: 60322
            },
            {
                filename: "/assets/blocks/STONE_BLOCK",
                start: 60322,
                end: 60520
            },
            {
                filename: "/assets/blocks/STONE_BOT",
                start: 60520,
                end: 60658
            },
            {
                filename: "/assets/blocks/STONE_LOWER",
                start: 60658,
                end: 60799
            },
            {
                filename: "/assets/blocks/STONE_PILLAR",
                start: 60799,
                end: 60954
            },
            {
                filename: "/assets/blocks/STONE_SLAB",
                start: 60954,
                end: 61102
            },
            {
                filename: "/assets/blocks/STONE_TOP",
                start: 61102,
                end: 61227
            },
            {
                filename: "/assets/blocks/SWIPE_CHICK",
                start: 61227,
                end: 64004
            },
            {
                filename: "/assets/blocks/THIS_O",
                start: 64004,
                end: 64119
            },
            {
                filename: "/assets/blocks/TILT_BALL",
                start: 64119,
                end: 64366
            },
            {
                filename: "/assets/blocks/TpF_LIST_ELEMENT_Tp",
                start: 64366,
                end: 64728,
            },
            {
                filename: "/assets/blocks/TRUE_T",
                start: 64728,
                end: 64974
            },
            {
                filename: "/assets/blocks/TT_AND_T",
                start: 64974,
                end: 65267
            },
            {
                filename: "/assets/blocks/TT_EQL_T",
                start: 65267,
                end: 65568
            },
            {
                filename: "/assets/blocks/TT_OR_T",
                start: 65568,
                end: 65859
            },
            {
                filename: "/assets/blocks/T_NOT_T",
                start: 65859,
                end: 66073
            },
            {
                filename: "/assets/blocks/VAR_Cp",
                start: 66073,
                end: 66326
            },
            {
                filename: "/assets/blocks/VAR_Fp",
                start: 66326,
                end: 66575
            },
            {
                filename: "/assets/blocks/VAR_Op",
                start: 66575,
                end: 66825
            },
            {
                filename: "/assets/blocks/VAR_Qp",
                start: 66825,
                end: 67077
            },
            {
                filename: "/assets/blocks/VAR_Tp",
                start: 67077,
                end: 67327
            },
            {
                filename: "/assets/blocks/VAR_Vp",
                start: 67327,
                end: 67577
            },
            {
                filename: "/assets/blocks/VECTOR_V",
                start: 67577,
                end: 67920
            },
            {
                filename: "/assets/blocks/VF_AXIS_ANG_Q",
                start: 67920,
                end: 68245
            },
            {
                filename: "/assets/blocks/VF_MUL_V",
                start: 68245,
                end: 68546
            },
            {
                filename: "/assets/blocks/VpF_LIST_ELEMENT_Vp",
                start: 68546,
                end: 68909,
            },
            {
                filename: "/assets/blocks/VQ_MUL_V",
                start: 68909,
                end: 69211
            },
            {
                filename: "/assets/blocks/VVVV_LINE_VS_PLANE_V",
                start: 69211,
                end: 69656,
            },
            {
                filename: "/assets/blocks/VV_ADD_V",
                start: 69656,
                end: 69955
            },
            {
                filename: "/assets/blocks/VV_CROSS_V",
                start: 69955,
                end: 70260
            },
            {
                filename: "/assets/blocks/VV_DIST_F",
                start: 70260,
                end: 70559
            },
            {
                filename: "/assets/blocks/VV_DOT_F",
                start: 70559,
                end: 70872
            },
            {
                filename: "/assets/blocks/VV_EQL_T",
                start: 70872,
                end: 71174
            },
            {
                filename: "/assets/blocks/VV_LOOK_ROT_Q",
                start: 71174,
                end: 71501
            },
            {
                filename: "/assets/blocks/VV_RAYCAST_TVO",
                start: 71501,
                end: 71886
            },
            {
                filename: "/assets/blocks/VV_SUB_V",
                start: 71886,
                end: 72184
            },
            {
                filename: "/assets/blocks/V_NORMALIZE_V",
                start: 72184,
                end: 72408
            },
            {
                filename: "/assets/blocks/V_SPLIT_FFF",
                start: 72408,
                end: 72794
            },
            {
                filename: "/assets/blocks/V_W2S_FF",
                start: 72794,
                end: 73126
            },
            {
                filename: "/assets/blocks/WHEEL",
                start: 73126,
                end: 74867
            },
            {
                filename: "/assets/blocks/WOOD_LOWER_X",
                start: 74867,
                end: 75058
            },
            {
                filename: "/assets/blocks/WOOD_LOWER_Z",
                start: 75058,
                end: 75248
            },
            {
                filename: "/assets/blocks/WOOD_UPPER_X",
                start: 75248,
                end: 75439
            },
            {
                filename: "/assets/blocks/WOOD_UPPER_Z",
                start: 75439,
                end: 75629
            },
            {
                filename: "/assets/blocks/WOOD_X",
                start: 75629,
                end: 75804
            },
            {
                filename: "/assets/blocks/WOOD_Y",
                start: 75804,
                end: 75994
            },
            {
                filename: "/assets/blocks/WOOD_Z",
                start: 75994,
                end: 76165
            },
            {
                filename: "/assets/views/baloo2.woff",
                start: 76165,
                end: 100237
            },
            {
                filename: "/assets/views/block_settings.html",
                start: 100237,
                end: 102302,
            },
            {
                filename: "/assets/views/common.css",
                start: 102302,
                end: 107895
            },
            {
                filename: "/assets/views/common.js",
                start: 107895,
                end: 115815
            },
            {
                filename: "/assets/views/confirm_deletion.html",
                start: 115815,
                end: 118184,
            },
            {
                filename: "/assets/views/create_user.html",
                start: 118184,
                end: 120412,
            },
            {
                filename: "/assets/views/game_moderation.html",
                start: 120412,
                end: 125080,
            },
            {
                filename: "/assets/views/messagebox.html",
                start: 125080,
                end: 127196
            },
            {
                filename: "/assets/views/select_level.html",
                start: 127196,
                end: 139970,
            },
            {
                filename: "/assets/views/show_hint.html",
                start: 139970,
                end: 141099
            },
            {
                filename: "/assets/views/sign_in.html",
                start: 141099,
                end: 143557
            },
            {
                filename: "/assets/atlas.png",
                start: 143557,
                end: 395104
            },
            {
                filename: "/assets/db",
                start: 395104,
                end: 395346
            },
            {
                filename: "/assets/games/menu",
                start: 395346,
                end: 400941
            },
            {
                filename: "/assets/games/5F084A0BCE06B710",
                start: 400941,
                end: 451559,
            },
            {
                filename: "/bundle_games.txt",
                start: 451559,
                end: 451575
            },
            {
                filename: "/assets/sounds/36837_engine_no_click.wav",
                start: 451575,
                end: 463613,
                audio: 1,
            },
            {
                filename: "/assets/sounds/188204_scrape.wav",
                start: 463613,
                end: 495649,
                audio: 1,
            },
            {
                filename: "/assets/sounds/78937_squeek.wav",
                start: 495649,
                end: 505759,
                audio: 1,
            },
            {
                filename: "/assets/sounds/257357_button.wav",
                start: 505759,
                end: 507123,
                audio: 1,
            },
            {
                filename: "/assets/sounds/249929_splash1.wav",
                start: 507123,
                end: 518827,
                audio: 1,
            },
            {
                filename: "/assets/sounds/315935_bang.wav",
                start: 518827,
                end: 571337,
                audio: 1,
            },
            {
                filename: "/assets/sounds/floor6.wav",
                start: 571337,
                end: 602361,
                audio: 1,
            },
            {
                filename: "/assets/sounds/399095_jump.wav",
                start: 602361,
                end: 607739,
                audio: 1,
            },
            {
                filename: "/assets/sounds/521481_camera.wav",
                start: 607739,
                end: 623171,
                audio: 1,
            },
            {
                filename: "/assets/sounds/194795_ui_button.wav",
                start: 623171,
                end: 625273,
                audio: 1,
            },
            {
                filename: "/assets/sounds/146721_ui_beep.wav",
                start: 625273,
                end: 629775,
                audio: 1,
            },
            {
                filename: "/assets/sounds/chaching.wav",
                start: 629775,
                end: 679055,
                audio: 1,
            },
            {
                filename: "/assets/sounds/363090_coin.wav",
                start: 679055,
                end: 683813,
                audio: 1,
            },
            {
                filename: "/assets/sounds/coin02_band.wav",
                start: 683813,
                end: 695797,
                audio: 1,
            },
            {
                filename: "/assets/sounds/error1.wav",
                start: 695797,
                end: 717057,
                audio: 1,
            },
        ],
        remote_package_size: 717057,
    });
})();
var moduleOverrides = Object.assign({}, Module);
var arguments_ = [];
var thisProgram = "./this.program";
var quit_ = (status, toThrow) => {
    throw toThrow;
};
var ENVIRONMENT_IS_WEB = typeof window == "object";
var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
var ENVIRONMENT_IS_NODE =
    typeof process == "object" &&
    typeof process.versions == "object" &&
    typeof process.versions.node == "string";
var scriptDirectory = "";

function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory);
    }
    return scriptDirectory + path;
}
var read_, readAsync, readBinary, setWindowTitle;

function logExceptionOnExit(e) {
    if (e instanceof ExitStatus) return;
    let toLog = e;
    err("exiting due to exception: " + toLog);
}
var fs;
var nodePath;
var requireNodeFS;
if (ENVIRONMENT_IS_NODE) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = require("path").dirname(scriptDirectory) + "/";
    } else {
        scriptDirectory = __dirname + "/";
    }
    requireNodeFS = () => {
        if (!nodePath) {
            fs = require("fs");
            nodePath = require("path");
        }
    };
    read_ = function shell_read(filename, binary) {
        requireNodeFS();
        filename = nodePath["normalize"](filename);
        return fs.readFileSync(filename, binary ? undefined : "utf8");
    };
    readBinary = (filename) => {
        var ret = read_(filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret);
        }
        return ret;
    };
    readAsync = (filename, onload, onerror) => {
        requireNodeFS();
        filename = nodePath["normalize"](filename);
        fs.readFile(filename, function(err, data) {
            if (err) onerror(err);
            else onload(data.buffer);
        });
    };
    if (process["argv"].length > 1) {
        thisProgram = process["argv"][1].replace(/\\/g, "/");
    }
    arguments_ = process["argv"].slice(2);
    if (typeof module != "undefined") {
        module["exports"] = Module;
    }
    process["on"]("uncaughtException", function(ex) {
        if (!(ex instanceof ExitStatus)) {
            throw ex;
        }
    });
    process["on"]("unhandledRejection", function(reason) {
        throw reason;
    });
    quit_ = (status, toThrow) => {
        if (keepRuntimeAlive()) {
            process["exitCode"] = status;
            throw toThrow;
        }
        logExceptionOnExit(toThrow);
        process["exit"](status);
    };
    Module["inspect"] = function() {
        return "[Emscripten Module object]";
    };
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
    } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(
            0,
            scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1
        );
    } else {
        scriptDirectory = "";
    } {
        read_ = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.send(null);
            return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
            readBinary = (url) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
            };
        }
        readAsync = (url, onload, onerror) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = () => {
                if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                    onload(xhr.response);
                    return;
                }
                onerror();
            };
            xhr.onerror = onerror;
            xhr.send(null);
        };
    }
    setWindowTitle = (title) => (document.title = title);
} else {}
var out = Module["print"] || console.log.bind(console);
var err = Module["printErr"] || console.warn.bind(console);
Object.assign(Module, moduleOverrides);
moduleOverrides = null;
if (Module["arguments"]) arguments_ = Module["arguments"];
if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
if (Module["quit"]) quit_ = Module["quit"];

function warnOnce(text) {
    if (!warnOnce.shown) warnOnce.shown = {};
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
    }
}
var wasmBinary;
if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
var noExitRuntime = Module["noExitRuntime"] || true;
if (typeof WebAssembly != "object") {
    abort("no native wasm support detected");
}
var wasmMemory;
var ABORT = false;
var EXITSTATUS;

function assert(condition, text) {
    if (!condition) {
        abort(text);
    }
}

function getCFunc(ident) {
    var func = Module["_" + ident];
    return func;
}

function ccall(ident, returnType, argTypes, args, opts) {
    var toC = {
        string: function(str) {
            var ret = 0;
            if (str !== null && str !== undefined && str !== 0) {
                var len = (str.length << 2) + 1;
                ret = stackAlloc(len);
                stringToUTF8(str, ret, len);
            }
            return ret;
        },
        array: function(arr) {
            var ret = stackAlloc(arr.length);
            writeArrayToMemory(arr, ret);
            return ret;
        },
    };

    function convertReturnValue(ret) {
        if (returnType === "string") {
            return UTF8ToString(ret);
        }
        if (returnType === "boolean") return Boolean(ret);
        return ret;
    }
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    if (args) {
        for (var i = 0; i < args.length; i++) {
            var converter = toC[argTypes[i]];
            if (converter) {
                if (stack === 0) stack = stackSave();
                cArgs[i] = converter(args[i]);
            } else {
                cArgs[i] = args[i];
            }
        }
    }
    var ret = func.apply(null, cArgs);

    function onDone(ret) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
    }
    ret = onDone(ret);
    return ret;
}

function cwrap(ident, returnType, argTypes, opts) {
    argTypes = argTypes || [];
    var numericArgs = argTypes.every(function(type) {
        return type === "number";
    });
    var numericRet = returnType !== "string";
    if (numericRet && numericArgs && !opts) {
        return getCFunc(ident);
    }
    return function() {
        return ccall(ident, returnType, argTypes, arguments, opts);
    };
}
var UTF8Decoder =
    typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
    } else {
        var str = "";
        while (idx < endPtr) {
            var u0 = heapOrArray[idx++];
            if (!(u0 & 128)) {
                str += String.fromCharCode(u0);
                continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
                str += String.fromCharCode(((u0 & 31) << 6) | u1);
                continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
                u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
                u0 =
                    ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0);
            } else {
                var ch = u0 - 65536;
                str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
            }
        }
    }
    return str;
}

function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
        }
        if (u <= 127) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u;
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 192 | (u >> 6);
            heap[outIdx++] = 128 | (u & 63);
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 224 | (u >> 12);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
        } else {
            if (outIdx + 3 >= endIdx) break;
            heap[outIdx++] = 240 | (u >> 18);
            heap[outIdx++] = 128 | ((u >> 12) & 63);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
        }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx;
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}

function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343)
            u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
        if (u <= 127) ++len;
        else if (u <= 2047) len += 2;
        else if (u <= 65535) len += 3;
        else len += 4;
    }
    return len;
}

function allocateUTF8(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = _malloc(size);
    if (ret) stringToUTF8Array(str, HEAP8, ret, size);
    return ret;
}

function allocateUTF8OnStack(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = stackAlloc(size);
    stringToUTF8Array(str, HEAP8, ret, size);
    return ret;
}

function writeArrayToMemory(array, buffer) {
    HEAP8.set(array, buffer);
}
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferAndViews(buf) {
    buffer = buf;
    Module["HEAP8"] = HEAP8 = new Int8Array(buf);
    Module["HEAP16"] = HEAP16 = new Int16Array(buf);
    Module["HEAP32"] = HEAP32 = new Int32Array(buf);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
}
var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 33554432;
var wasmTable;
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;

function keepRuntimeAlive() {
    return noExitRuntime;
}

function preRun() {
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function")
            Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift());
        }
    }
    callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
    runtimeInitialized = true;
    if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
    FS.ignorePermissions = false;
    TTY.init();
    callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
    callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function")
            Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift());
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
    __ATINIT__.unshift(cb);
}

function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb);
}
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;

function getUniqueRunDependency(id) {
    return id;
}

function addRunDependency(id) {
    runDependencies++;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
    }
}

function removeRunDependency(id) {
    runDependencies--;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
        }
    }
}

function abort(what) {
    {
        if (Module["onAbort"]) {
            Module["onAbort"](what);
        }
    }
    what = "Aborted(" + what + ")";
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    what += ". Build with -sASSERTIONS for more info.";
    var e = new WebAssembly.RuntimeError(what);
    throw e;
}
var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
    return filename.startsWith(dataURIPrefix);
}

function isFileURI(filename) {
    return filename.startsWith("file://");
}
var wasmBinaryFile;
wasmBinaryFile = "index.wasm";
if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary(file) {
    try {
        if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
            return readBinary(file);
        } else {
            throw "both async and sync fetching of the wasm failed";
        }
    } catch (err) {
        abort(err);
    }
}

function getBinaryPromise() {
    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch == "function" && !isFileURI(wasmBinaryFile)) {
            return fetch(wasmBinaryFile, {
                    credentials: "same-origin"
                })
                .then(function(response) {
                    if (!response["ok"]) {
                        throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
                    }
                    return response["arrayBuffer"]();
                })
                .catch(function() {
                    return getBinary(wasmBinaryFile);
                });
        } else {
            if (readAsync) {
                return new Promise(function(resolve, reject) {
                    readAsync(
                        wasmBinaryFile,
                        function(response) {
                            resolve(new Uint8Array(response));
                        },
                        reject
                    );
                });
            }
        }
    }
    return Promise.resolve().then(function() {
        return getBinary(wasmBinaryFile);
    });
}

function createWasm() {
    var info = {
        a: asmLibraryArg
    };

    function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module["asm"] = exports;
        wasmMemory = Module["asm"]["kb"];
        updateGlobalBufferAndViews(wasmMemory.buffer);
        wasmTable = Module["asm"]["Nb"];
        addOnInit(Module["asm"]["lb"]);
        removeRunDependency("wasm-instantiate");
    }
    addRunDependency("wasm-instantiate");

    function receiveInstantiationResult(result) {
        receiveInstance(result["instance"]);
    }

    function instantiateArrayBuffer(receiver) {
        return getBinaryPromise()
            .then(function(binary) {
                return WebAssembly.instantiate(binary, info);
            })
            .then(function(instance) {
                return instance;
            })
            .then(receiver, function(reason) {
                err("failed to asynchronously prepare wasm: " + reason);
                abort(reason);
            });
    }

    function instantiateAsync() {
        if (!wasmBinary &&
            typeof WebAssembly.instantiateStreaming == "function" &&
            !isDataURI(wasmBinaryFile) &&
            !isFileURI(wasmBinaryFile) &&
            !ENVIRONMENT_IS_NODE &&
            typeof fetch == "function"
        ) {
            return fetch(wasmBinaryFile, {
                credentials: "same-origin"
            }).then(
                function(response) {
                    var result = WebAssembly.instantiateStreaming(response, info);
                    return result.then(receiveInstantiationResult, function(reason) {
                        err("wasm streaming compile failed: " + reason);
                        err("falling back to ArrayBuffer instantiation");
                        return instantiateArrayBuffer(receiveInstantiationResult);
                    });
                }
            );
        } else {
            return instantiateArrayBuffer(receiveInstantiationResult);
        }
    }
    if (Module["instantiateWasm"]) {
        try {
            var exports = Module["instantiateWasm"](info, receiveInstance);
            return exports;
        } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false;
        }
    }
    instantiateAsync();
    return {};
}
var tempDouble;
var tempI64;
var ASM_CONSTS = {
    287104: ($0, $1) => {
        checkHintFileExist(UTF8ToString($0), $1);
    },
    287148: () => {
        hideOverlayGradient();
    },
    287173: ($0) => {
        downloadFileInBrowser(UTF8ToString($0));
    },
    287215: ($0, $1, $2) => {
        fetchUrl(UTF8ToString($0), $1, $2);
    },
    287252: ($0) => {
        webViewOpen(UTF8ToString($0));
    },
    287285: () => {
        webViewClose();
    },
    287303: ($0) => {
        webViewExecuteJS(UTF8ToString($0));
    },
    287341: () => {
        hideOverlayGradient();
    },
    287366: () => {
        FS.syncfs(false, function(err) {
            if (err) {
                simpleLogC("syncfs error " + err);
            }
        });
    },
    287452: () => {
        FS.syncfs(true, function(err) {
            if (err) {
                simpleLogC("syncfs error " + err);
            }
        });
    },
    287537: () => {
        firebaseSignout();
    },
    287558: () => {
        adInterstitialLoad();
    },
    287584: () => {
        adInterstitialShow();
    },
    287610: () => {
        adRewardedLoad();
    },
    287632: () => {
        adRewardedShow();
    },
    287654: () => {
        adInit();
    },
    287668: () => {
        adInit();
    },
    287682: ($0, $1, $2) => {
        showShareFileModal(UTF8ToString($0), UTF8ToString($1), UTF8ToString($2));
    },
    287757: ($0) => {
        window.open(UTF8ToString($0), "_blank");
    },
    287802: () => {
        location.reload();
    },
    287825: ($0, $1, $2, $3) => {
        showStoreLinkModal(UTF8ToString($0), $1, $2, $3);
    },
    287877: () => {
        FS.mkdir("/sandbox");
        FS.mount(IDBFS, {}, "/sandbox");
        FS.syncfs(true, function(err) {
            if (err) {
                simpleLogC("syncfs error " + err);
            }
            try {
                ccall("app_init", "v");
            } catch (err) {
                simpleLogC("app_init() error " + err);
            }
            hideOverlay();
        });
    },
    288123: () => {
        return document.getElementById("canvas").width;
    },
    288173: () => {
        return document.getElementById("canvas").height;
    },
    288224: ($0) => {
        setDeepLinkLoadingFraction($0);
    },
};

function get_device_pixel_ratio() {
    return window.devicePixelRatio;
}

function get_hostname() {
    return getHostname();
}

function get_url_level_index() {
    return getUrlLevelIndex();
}

function is_daily_reward_possible() {
    return dailyRewardPossible;
}

function is_latest_browser_tab() {
    try {
        return localStorage["startup-time"] == startupTimeStr;
    } catch (err) {
        return true;
    }
}

function poki_gameplay_start() {
    pokiEnsureStart();
}

function poki_gameplay_stop() {
    pokiEnsureStop();
}

function poki_level_start(li) {

}

function set_latest_browser_tab() {
    startupTimeStr = Date.now().toString();
    try {
        localStorage["startup-time"] = startupTimeStr;
    } catch (err) {}
}

function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
            callback(Module);
            continue;
        }
        var func = callback.func;
        if (typeof func == "number") {
            if (callback.arg === undefined) {
                getWasmTableEntry(func)();
            } else {
                getWasmTableEntry(func)(callback.arg);
            }
        } else {
            func(callback.arg === undefined ? null : callback.arg);
        }
    }
}

function withStackSave(f) {
    var stack = stackSave();
    var ret = f();
    stackRestore(stack);
    return ret;
}
var wasmTableMirror = [];

function getWasmTableEntry(funcPtr) {
    var func = wasmTableMirror[funcPtr];
    if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
    }
    return func;
}

function handleException(e) {
    if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS;
    }
    quit_(1, e);
}

function getRandomDevice() {
    if (
        typeof crypto == "object" &&
        typeof crypto["getRandomValues"] == "function"
    ) {
        var randomBuffer = new Uint8Array(1);
        return function() {
            crypto.getRandomValues(randomBuffer);
            return randomBuffer[0];
        };
    } else if (ENVIRONMENT_IS_NODE) {
        try {
            var crypto_module = require("crypto");
            return function() {
                return crypto_module["randomBytes"](1)[0];
            };
        } catch (e) {}
    }
    return function() {
        abort("randomDevice");
    };
}
var PATH = {
    isAbs: (path) => path.charAt(0) === "/",
    splitPath: (filename) => {
        var splitPathRe =
            /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
    },
    normalizeArray: (parts, allowAboveRoot) => {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
                parts.splice(i, 1);
            } else if (last === "..") {
                parts.splice(i, 1);
                up++;
            } else if (up) {
                parts.splice(i, 1);
                up--;
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..");
            }
        }
        return parts;
    },
    normalize: (path) => {
        var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(
            path.split("/").filter((p) => !!p), !isAbsolute
        ).join("/");
        if (!path && !isAbsolute) {
            path = ".";
        }
        if (path && trailingSlash) {
            path += "/";
        }
        return (isAbsolute ? "/" : "") + path;
    },
    dirname: (path) => {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
            return ".";
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
    },
    basename: (path) => {
        if (path === "/") return "/";
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1) return path;
        return path.substr(lastSlash + 1);
    },
    join: function() {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"));
    },
    join2: (l, r) => {
        return PATH.normalize(l + "/" + r);
    },
};
var PATH_FS = {
    resolve: function() {
        var resolvedPath = "",
            resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path != "string") {
                throw new TypeError("Arguments to path.resolve must be strings");
            } else if (!path) {
                return "";
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = PATH.isAbs(path);
        }
        resolvedPath = PATH.normalizeArray(
            resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute
        ).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    },
    relative: (from, to) => {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);

        function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
                if (arr[start] !== "") break;
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
                if (arr[end] !== "") break;
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break;
            }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..");
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/");
    },
};
var TTY = {
    ttys: [],
    init: function() {},
    shutdown: function() {},
    register: function(dev, ops) {
        TTY.ttys[dev] = {
            input: [],
            output: [],
            ops: ops
        };
        FS.registerDevice(dev, TTY.stream_ops);
    },
    stream_ops: {
        open: function(stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
                throw new FS.ErrnoError(43);
            }
            stream.tty = tty;
            stream.seekable = false;
        },
        close: function(stream) {
            stream.tty.ops.flush(stream.tty);
        },
        flush: function(stream) {
            stream.tty.ops.flush(stream.tty);
        },
        read: function(stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
                throw new FS.ErrnoError(60);
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
                var result;
                try {
                    result = stream.tty.ops.get_char(stream.tty);
                } catch (e) {
                    throw new FS.ErrnoError(29);
                }
                if (result === undefined && bytesRead === 0) {
                    throw new FS.ErrnoError(6);
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset + i] = result;
            }
            if (bytesRead) {
                stream.node.timestamp = Date.now();
            }
            return bytesRead;
        },
        write: function(stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
                throw new FS.ErrnoError(60);
            }
            try {
                for (var i = 0; i < length; i++) {
                    stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
                }
            } catch (e) {
                throw new FS.ErrnoError(29);
            }
            if (length) {
                stream.node.timestamp = Date.now();
            }
            return i;
        },
    },
    default_tty_ops: {
        get_char: function(tty) {
            if (!tty.input.length) {
                var result = null;
                if (ENVIRONMENT_IS_NODE) {
                    var BUFSIZE = 256;
                    var buf = Buffer.alloc(BUFSIZE);
                    var bytesRead = 0;
                    try {
                        bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
                    } catch (e) {
                        if (e.toString().includes("EOF")) bytesRead = 0;
                        else throw e;
                    }
                    if (bytesRead > 0) {
                        result = buf.slice(0, bytesRead).toString("utf-8");
                    } else {
                        result = null;
                    }
                } else if (
                    typeof window != "undefined" &&
                    typeof window.prompt == "function"
                ) {
                    result = window.prompt("Input: ");
                    if (result !== null) {
                        result += "\n";
                    }
                } else if (typeof readline == "function") {
                    result = readline();
                    if (result !== null) {
                        result += "\n";
                    }
                }
                if (!result) {
                    return null;
                }
                tty.input = intArrayFromString(result, true);
            }
            return tty.input.shift();
        },
        put_char: function(tty, val) {
            if (val === null || val === 10) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            } else {
                if (val != 0) tty.output.push(val);
            }
        },
        flush: function(tty) {
            if (tty.output && tty.output.length > 0) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            }
        },
    },
    default_tty1_ops: {
        put_char: function(tty, val) {
            if (val === null || val === 10) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            } else {
                if (val != 0) tty.output.push(val);
            }
        },
        flush: function(tty) {
            if (tty.output && tty.output.length > 0) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            }
        },
    },
};

function zeroMemory(address, size) {
    HEAPU8.fill(0, address, address + size);
}

function mmapAlloc(size) {
    abort();
}
var MEMFS = {
    ops_table: null,
    mount: function(mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0);
    },
    createNode: function(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
                dir: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        lookup: MEMFS.node_ops.lookup,
                        mknod: MEMFS.node_ops.mknod,
                        rename: MEMFS.node_ops.rename,
                        unlink: MEMFS.node_ops.unlink,
                        rmdir: MEMFS.node_ops.rmdir,
                        readdir: MEMFS.node_ops.readdir,
                        symlink: MEMFS.node_ops.symlink,
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek
                    },
                },
                file: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek,
                        read: MEMFS.stream_ops.read,
                        write: MEMFS.stream_ops.write,
                        allocate: MEMFS.stream_ops.allocate,
                        mmap: MEMFS.stream_ops.mmap,
                        msync: MEMFS.stream_ops.msync,
                    },
                },
                link: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        readlink: MEMFS.node_ops.readlink,
                    },
                    stream: {},
                },
                chrdev: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                    },
                    stream: FS.chrdev_stream_ops,
                },
            };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {};
        } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null;
        } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        if (parent) {
            parent.contents[name] = node;
            parent.timestamp = node.timestamp;
        }
        return node;
    },
    getFileDataAsTypedArray: function(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray)
            return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents);
    },
    expandFileStorage: function(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(
            newCapacity,
            (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0
        );
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0)
            node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
    },
    resizeFileStorage: function(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
        } else {
            var oldContents = node.contents;
            node.contents = new Uint8Array(newSize);
            if (oldContents) {
                node.contents.set(
                    oldContents.subarray(0, Math.min(newSize, node.usedBytes))
                );
            }
            node.usedBytes = newSize;
        }
    },
    node_ops: {
        getattr: function(node) {
            var attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
                attr.size = 4096;
            } else if (FS.isFile(node.mode)) {
                attr.size = node.usedBytes;
            } else if (FS.isLink(node.mode)) {
                attr.size = node.link.length;
            } else {
                attr.size = 0;
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr;
        },
        setattr: function(node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp;
            }
            if (attr.size !== undefined) {
                MEMFS.resizeFileStorage(node, attr.size);
            }
        },
        lookup: function(parent, name) {
            throw FS.genericErrors[44];
        },
        mknod: function(parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev);
        },
        rename: function(old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
                var new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name);
                } catch (e) {}
                if (new_node) {
                    for (var i in new_node.contents) {
                        throw new FS.ErrnoError(55);
                    }
                }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.parent.timestamp = Date.now();
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            new_dir.timestamp = old_node.parent.timestamp;
            old_node.parent = new_dir;
        },
        unlink: function(parent, name) {
            delete parent.contents[name];
            parent.timestamp = Date.now();
        },
        rmdir: function(parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
                throw new FS.ErrnoError(55);
            }
            delete parent.contents[name];
            parent.timestamp = Date.now();
        },
        readdir: function(node) {
            var entries = [".", ".."];
            for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue;
                }
                entries.push(key);
            }
            return entries;
        },
        symlink: function(parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node;
        },
        readlink: function(node) {
            if (!FS.isLink(node.mode)) {
                throw new FS.ErrnoError(28);
            }
            return node.link;
        },
    },
    stream_ops: {
        read: function(stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            var size = Math.min(stream.node.usedBytes - position, length);
            if (size > 8 && contents.subarray) {
                buffer.set(contents.subarray(position, position + size), offset);
            } else {
                for (var i = 0; i < size; i++)
                    buffer[offset + i] = contents[position + i];
            }
            return size;
        },
        write: function(stream, buffer, offset, length, position, canOwn) {
            if (buffer.buffer === HEAP8.buffer) {
                canOwn = false;
            }
            if (!length) return 0;
            var node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                if (canOwn) {
                    node.contents = buffer.subarray(offset, offset + length);
                    node.usedBytes = length;
                    return length;
                } else if (node.usedBytes === 0 && position === 0) {
                    node.contents = buffer.slice(offset, offset + length);
                    node.usedBytes = length;
                    return length;
                } else if (position + length <= node.usedBytes) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                    return length;
                }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray) {
                node.contents.set(buffer.subarray(offset, offset + length), position);
            } else {
                for (var i = 0; i < length; i++) {
                    node.contents[position + i] = buffer[offset + i];
                }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length;
        },
        llseek: function(stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position;
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.usedBytes;
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(28);
            }
            return position;
        },
        allocate: function(stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },
        mmap: function(stream, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43);
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === buffer) {
                allocated = false;
                ptr = contents.byteOffset;
            } else {
                if (position > 0 || position + length < contents.length) {
                    if (contents.subarray) {
                        contents = contents.subarray(position, position + length);
                    } else {
                        contents = Array.prototype.slice.call(
                            contents,
                            position,
                            position + length
                        );
                    }
                }
                allocated = true;
                ptr = mmapAlloc(length);
                if (!ptr) {
                    throw new FS.ErrnoError(48);
                }
                HEAP8.set(contents, ptr);
            }
            return {
                ptr: ptr,
                allocated: allocated
            };
        },
        msync: function(stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43);
            }
            if (mmapFlags & 2) {
                return 0;
            }
            var bytesWritten = MEMFS.stream_ops.write(
                stream,
                buffer,
                0,
                length,
                offset,
                false
            );
            return 0;
        },
    },
};

function asyncLoad(url, onload, onerror, noRunDep) {
    var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
    readAsync(
        url,
        function(arrayBuffer) {
            assert(
                arrayBuffer,
                'Loading data file "' + url + '" failed (no arrayBuffer).'
            );
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep);
        },
        function(event) {
            if (onerror) {
                onerror();
            } else {
                throw 'Loading data file "' + url + '" failed.';
            }
        }
    );
    if (dep) addRunDependency(dep);
}
var IDBFS = {
    dbs: {},
    indexedDB: () => {
        if (typeof indexedDB != "undefined") return indexedDB;
        var ret = null;
        if (typeof window == "object")
            ret =
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB;
        assert(ret, "IDBFS used, but indexedDB not supported");
        return ret;
    },
    DB_VERSION: 21,
    DB_STORE_NAME: "FILE_DATA",
    mount: function(mount) {
        return MEMFS.mount.apply(null, arguments);
    },
    syncfs: (mount, populate, callback) => {
        IDBFS.getLocalSet(mount, (err, local) => {
            if (err) return callback(err);
            IDBFS.getRemoteSet(mount, (err, remote) => {
                if (err) return callback(err);
                var src = populate ? remote : local;
                var dst = populate ? local : remote;
                IDBFS.reconcile(src, dst, callback);
            });
        });
    },
    quit: () => {
        Object.values(IDBFS.dbs).forEach((value) => value.close());
        IDBFS.dbs = {};
    },
    getDB: (name, callback) => {
        var db = IDBFS.dbs[name];
        if (db) {
            return callback(null, db);
        }
        var req;
        try {
            req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
            return callback(e);
        }
        if (!req) {
            return callback("Unable to connect to IndexedDB");
        }
        req.onupgradeneeded = (e) => {
            var db = e.target.result;
            var transaction = e.target.transaction;
            var fileStore;
            if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
                fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
            } else {
                fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
            }
            if (!fileStore.indexNames.contains("timestamp")) {
                fileStore.createIndex("timestamp", "timestamp", {
                    unique: false
                });
            }
        };
        req.onsuccess = () => {
            db = req.result;
            IDBFS.dbs[name] = db;
            callback(null, db);
        };
        req.onerror = (e) => {
            callback(this.error);
            e.preventDefault();
        };
    },
    getLocalSet: (mount, callback) => {
        var entries = {};

        function isRealDir(p) {
            return p !== "." && p !== "..";
        }

        function toAbsolute(root) {
            return (p) => {
                return PATH.join2(root, p);
            };
        }
        var check = FS.readdir(mount.mountpoint)
            .filter(isRealDir)
            .map(toAbsolute(mount.mountpoint));
        while (check.length) {
            var path = check.pop();
            var stat;
            try {
                stat = FS.stat(path);
            } catch (e) {
                return callback(e);
            }
            if (FS.isDir(stat.mode)) {
                check.push.apply(
                    check,
                    FS.readdir(path).filter(isRealDir).map(toAbsolute(path))
                );
            }
            entries[path] = {
                timestamp: stat.mtime
            };
        }
        return callback(null, {
            type: "local",
            entries: entries
        });
    },
    getRemoteSet: (mount, callback) => {
        var entries = {};
        IDBFS.getDB(mount.mountpoint, (err, db) => {
            if (err) return callback(err);
            try {
                var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
                transaction.onerror = (e) => {
                    callback(this.error);
                    e.preventDefault();
                };
                var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
                var index = store.index("timestamp");
                index.openKeyCursor().onsuccess = (event) => {
                    var cursor = event.target.result;
                    if (!cursor) {
                        return callback(null, {
                            type: "remote",
                            db: db,
                            entries: entries
                        });
                    }
                    entries[cursor.primaryKey] = {
                        timestamp: cursor.key
                    };
                    cursor.continue();
                };
            } catch (e) {
                return callback(e);
            }
        });
    },
    loadLocalEntry: (path, callback) => {
        var stat, node;
        try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
        } catch (e) {
            return callback(e);
        }
        if (FS.isDir(stat.mode)) {
            return callback(null, {
                timestamp: stat.mtime,
                mode: stat.mode
            });
        } else if (FS.isFile(stat.mode)) {
            node.contents = MEMFS.getFileDataAsTypedArray(node);
            return callback(null, {
                timestamp: stat.mtime,
                mode: stat.mode,
                contents: node.contents,
            });
        } else {
            return callback(new Error("node type not supported"));
        }
    },
    storeLocalEntry: (path, entry, callback) => {
        try {
            if (FS.isDir(entry["mode"])) {
                FS.mkdirTree(path, entry["mode"]);
            } else if (FS.isFile(entry["mode"])) {
                FS.writeFile(path, entry["contents"], {
                    canOwn: true
                });
            } else {
                return callback(new Error("node type not supported"));
            }
            FS.chmod(path, entry["mode"]);
            FS.utime(path, entry["timestamp"], entry["timestamp"]);
        } catch (e) {
            return callback(e);
        }
        callback(null);
    },
    removeLocalEntry: (path, callback) => {
        try {
            var stat = FS.stat(path);
            if (FS.isDir(stat.mode)) {
                FS.rmdir(path);
            } else if (FS.isFile(stat.mode)) {
                FS.unlink(path);
            }
        } catch (e) {
            return callback(e);
        }
        callback(null);
    },
    loadRemoteEntry: (store, path, callback) => {
        var req = store.get(path);
        req.onsuccess = (event) => {
            callback(null, event.target.result);
        };
        req.onerror = (e) => {
            callback(this.error);
            e.preventDefault();
        };
    },
    storeRemoteEntry: (store, path, entry, callback) => {
        try {
            var req = store.put(entry, path);
        } catch (e) {
            callback(e);
            return;
        }
        req.onsuccess = () => {
            callback(null);
        };
        req.onerror = (e) => {
            callback(this.error);
            e.preventDefault();
        };
    },
    removeRemoteEntry: (store, path, callback) => {
        var req = store.delete(path);
        req.onsuccess = () => {
            callback(null);
        };
        req.onerror = (e) => {
            callback(this.error);
            e.preventDefault();
        };
    },
    reconcile: (src, dst, callback) => {
        var total = 0;
        var create = [];
        Object.keys(src.entries).forEach(function(key) {
            var e = src.entries[key];
            var e2 = dst.entries[key];
            if (!e2 || e["timestamp"].getTime() != e2["timestamp"].getTime()) {
                create.push(key);
                total++;
            }
        });
        var remove = [];
        Object.keys(dst.entries).forEach(function(key) {
            if (!src.entries[key]) {
                remove.push(key);
                total++;
            }
        });
        if (!total) {
            return callback(null);
        }
        var errored = false;
        var db = src.type === "remote" ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite");
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);

        function done(err) {
            if (err && !errored) {
                errored = true;
                return callback(err);
            }
        }
        transaction.onerror = (e) => {
            done(this.error);
            e.preventDefault();
        };
        transaction.oncomplete = (e) => {
            if (!errored) {
                callback(null);
            }
        };
        create.sort().forEach((path) => {
            if (dst.type === "local") {
                IDBFS.loadRemoteEntry(store, path, (err, entry) => {
                    if (err) return done(err);
                    IDBFS.storeLocalEntry(path, entry, done);
                });
            } else {
                IDBFS.loadLocalEntry(path, (err, entry) => {
                    if (err) return done(err);
                    IDBFS.storeRemoteEntry(store, path, entry, done);
                });
            }
        });
        remove
            .sort()
            .reverse()
            .forEach((path) => {
                if (dst.type === "local") {
                    IDBFS.removeLocalEntry(path, done);
                } else {
                    IDBFS.removeRemoteEntry(store, path, done);
                }
            });
    },
};
var FS = {
    root: null,
    mounts: [],
    devices: {},
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: false,
    ignorePermissions: true,
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    lookupPath: (path, opts = {}) => {
        path = PATH_FS.resolve(FS.cwd(), path);
        if (!path) return {
            path: "",
            node: null
        };
        var defaults = {
            follow_mount: true,
            recurse_count: 0
        };
        opts = Object.assign(defaults, opts);
        if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32);
        }
        var parts = PATH.normalizeArray(
            path.split("/").filter((p) => !!p),
            false
        );
        var current = FS.root;
        var current_path = "/";
        for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
                break;
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
                if (!islast || (islast && opts.follow_mount)) {
                    current = current.mounted.root;
                }
            }
            if (!islast || opts.follow) {
                var count = 0;
                while (FS.isLink(current.mode)) {
                    var link = FS.readlink(current_path);
                    current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                    var lookup = FS.lookupPath(current_path, {
                        recurse_count: opts.recurse_count + 1,
                    });
                    current = lookup.node;
                    if (count++ > 40) {
                        throw new FS.ErrnoError(32);
                    }
                }
            }
        }
        return {
            path: current_path,
            node: current
        };
    },
    getPath: (node) => {
        var path;
        while (true) {
            if (FS.isRoot(node)) {
                var mount = node.mount.mountpoint;
                if (!path) return mount;
                return mount[mount.length - 1] !== "/" ?
                    mount + "/" + path :
                    mount + path;
            }
            path = path ? node.name + "/" + path : node.name;
            node = node.parent;
        }
    },
    hashName: (parentid, name) => {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
    },
    hashAddNode: (node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
    },
    hashRemoveNode: (node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next;
        } else {
            var current = FS.nameTable[hash];
            while (current) {
                if (current.name_next === node) {
                    current.name_next = node.name_next;
                    break;
                }
                current = current.name_next;
            }
        }
    },
    lookupNode: (parent, name) => {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
            throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
                return node;
            }
        }
        return FS.lookup(parent, name);
    },
    createNode: (parent, name, mode, rdev) => {
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node;
    },
    destroyNode: (node) => {
        FS.hashRemoveNode(node);
    },
    isRoot: (node) => {
        return node === node.parent;
    },
    isMountpoint: (node) => {
        return !!node.mounted;
    },
    isFile: (mode) => {
        return (mode & 61440) === 32768;
    },
    isDir: (mode) => {
        return (mode & 61440) === 16384;
    },
    isLink: (mode) => {
        return (mode & 61440) === 40960;
    },
    isChrdev: (mode) => {
        return (mode & 61440) === 8192;
    },
    isBlkdev: (mode) => {
        return (mode & 61440) === 24576;
    },
    isFIFO: (mode) => {
        return (mode & 61440) === 4096;
    },
    isSocket: (mode) => {
        return (mode & 49152) === 49152;
    },
    flagModes: {
        r: 0,
        "r+": 2,
        w: 577,
        "w+": 578,
        a: 1089,
        "a+": 1090
    },
    modeStringToFlags: (str) => {
        var flags = FS.flagModes[str];
        if (typeof flags == "undefined") {
            throw new Error("Unknown file open mode: " + str);
        }
        return flags;
    },
    flagsToPermissionString: (flag) => {
        var perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
            perms += "w";
        }
        return perms;
    },
    nodePermissions: (node, perms) => {
        if (FS.ignorePermissions) {
            return 0;
        }
        if (perms.includes("r") && !(node.mode & 292)) {
            return 2;
        } else if (perms.includes("w") && !(node.mode & 146)) {
            return 2;
        } else if (perms.includes("x") && !(node.mode & 73)) {
            return 2;
        }
        return 0;
    },
    mayLookup: (dir) => {
        var errCode = FS.nodePermissions(dir, "x");
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
    },
    mayCreate: (dir, name) => {
        try {
            var node = FS.lookupNode(dir, name);
            return 20;
        } catch (e) {}
        return FS.nodePermissions(dir, "wx");
    },
    mayDelete: (dir, name, isdir) => {
        var node;
        try {
            node = FS.lookupNode(dir, name);
        } catch (e) {
            return e.errno;
        }
        var errCode = FS.nodePermissions(dir, "wx");
        if (errCode) {
            return errCode;
        }
        if (isdir) {
            if (!FS.isDir(node.mode)) {
                return 54;
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                return 10;
            }
        } else {
            if (FS.isDir(node.mode)) {
                return 31;
            }
        }
        return 0;
    },
    mayOpen: (node, flags) => {
        if (!node) {
            return 44;
        }
        if (FS.isLink(node.mode)) {
            return 32;
        } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                return 31;
            }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    },
    MAX_OPEN_FDS: 4096,
    nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
        for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
                return fd;
            }
        }
        throw new FS.ErrnoError(33);
    },
    getStream: (fd) => FS.streams[fd],
    createStream: (stream, fd_start, fd_end) => {
        if (!FS.FSStream) {
            FS.FSStream = function() {
                this.shared = {};
            };
            FS.FSStream.prototype = {};
            Object.defineProperties(FS.FSStream.prototype, {
                object: {
                    get: function() {
                        return this.node;
                    },
                    set: function(val) {
                        this.node = val;
                    },
                },
                isRead: {
                    get: function() {
                        return (this.flags & 2097155) !== 1;
                    },
                },
                isWrite: {
                    get: function() {
                        return (this.flags & 2097155) !== 0;
                    },
                },
                isAppend: {
                    get: function() {
                        return this.flags & 1024;
                    },
                },
                flags: {
                    get: function() {
                        return this.shared.flags;
                    },
                    set: function(val) {
                        this.shared.flags = val;
                    },
                },
                position: {
                    get: function() {
                        return this.shared.position;
                    },
                    set: function(val) {
                        this.shared.position = val;
                    },
                },
            });
        }
        stream = Object.assign(new FS.FSStream(), stream);
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
    },
    closeStream: (fd) => {
        FS.streams[fd] = null;
    },
    chrdev_stream_ops: {
        open: (stream) => {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
                stream.stream_ops.open(stream);
            }
        },
        llseek: () => {
            throw new FS.ErrnoError(70);
        },
    },
    major: (dev) => dev >> 8,
    minor: (dev) => dev & 255,
    makedev: (ma, mi) => (ma << 8) | mi,
    registerDevice: (dev, ops) => {
        FS.devices[dev] = {
            stream_ops: ops
        };
    },
    getDevice: (dev) => FS.devices[dev],
    getMounts: (mount) => {
        var mounts = [];
        var check = [mount];
        while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts);
        }
        return mounts;
    },
    syncfs: (populate, callback) => {
        if (typeof populate == "function") {
            callback = populate;
            populate = false;
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
            err(
                "warning: " +
                FS.syncFSRequests +
                " FS.syncfs operations in flight at once, probably just doing extra work"
            );
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;

        function doCallback(errCode) {
            FS.syncFSRequests--;
            return callback(errCode);
        }

        function done(errCode) {
            if (errCode) {
                if (!done.errored) {
                    done.errored = true;
                    return doCallback(errCode);
                }
                return;
            }
            if (++completed >= mounts.length) {
                doCallback(null);
            }
        }
        mounts.forEach((mount) => {
            if (!mount.type.syncfs) {
                return done(null);
            }
            mount.type.syncfs(mount, populate, done);
        });
    },
    mount: (type, opts, mountpoint) => {
        var root = mountpoint === "/";
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
            throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, {
                follow_mount: false
            });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10);
            }
            if (!FS.isDir(node.mode)) {
                throw new FS.ErrnoError(54);
            }
        }
        var mount = {
            type: type,
            opts: opts,
            mountpoint: mountpoint,
            mounts: []
        };
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
            FS.root = mountRoot;
        } else if (node) {
            node.mounted = mount;
            if (node.mount) {
                node.mount.mounts.push(mount);
            }
        }
        return mountRoot;
    },
    unmount: (mountpoint) => {
        var lookup = FS.lookupPath(mountpoint, {
            follow_mount: false
        });
        if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(28);
        }
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach((hash) => {
            var current = FS.nameTable[hash];
            while (current) {
                var next = current.name_next;
                if (mounts.includes(current.mount)) {
                    FS.destroyNode(current);
                }
                current = next;
            }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1);
    },
    lookup: (parent, name) => {
        return parent.node_ops.lookup(parent, name);
    },
    mknod: (path, mode, dev) => {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === "." || name === "..") {
            throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
    },
    create: (path, mode) => {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
    },
    mkdir: (path, mode) => {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
    },
    mkdirTree: (path, mode) => {
        var dirs = path.split("/");
        var d = "";
        for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += "/" + dirs[i];
            try {
                FS.mkdir(d, mode);
            } catch (e) {
                if (e.errno != 20) throw e;
            }
        }
    },
    mkdev: (path, mode, dev) => {
        if (typeof dev == "undefined") {
            dev = mode;
            mode = 438;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
    },
    symlink: (oldpath, newpath) => {
        if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, {
            parent: true
        });
        var parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
    },
    rename: (old_path, new_path) => {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup, old_dir, new_dir;
        lookup = FS.lookupPath(old_path, {
            parent: true
        });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, {
            parent: true
        });
        new_dir = lookup.node;
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(75);
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(28);
        }
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(55);
        }
        var new_node;
        try {
            new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (old_node === new_node) {
            return;
        }
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        errCode = new_node ?
            FS.mayDelete(new_dir, new_name, isdir) :
            FS.mayCreate(new_dir, new_name);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
            throw new FS.ErrnoError(10);
        }
        if (new_dir !== old_dir) {
            errCode = FS.nodePermissions(old_dir, "w");
            if (errCode) {
                throw new FS.ErrnoError(errCode);
            }
        }
        FS.hashRemoveNode(old_node);
        try {
            old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
            throw e;
        } finally {
            FS.hashAddNode(old_node);
        }
    },
    rmdir: (path) => {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
    },
    readdir: (path) => {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
    },
    unlink: (path) => {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
    },
    readlink: (path) => {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
            throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(
            FS.getPath(link.parent),
            link.node_ops.readlink(link)
        );
    },
    stat: (path, dontFollow) => {
        var lookup = FS.lookupPath(path, {
            follow: !dontFollow
        });
        var node = lookup.node;
        if (!node) {
            throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
    },
    lstat: (path) => {
        return FS.stat(path, true);
    },
    chmod: (path, mode, dontFollow) => {
        var node;
        if (typeof path == "string") {
            var lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node;
        } else {
            node = path;
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
            mode: (mode & 4095) | (node.mode & ~4095),
            timestamp: Date.now(),
        });
    },
    lchmod: (path, mode) => {
        FS.chmod(path, mode, true);
    },
    fchmod: (fd, mode) => {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
    },
    chown: (path, uid, gid, dontFollow) => {
        var node;
        if (typeof path == "string") {
            var lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node;
        } else {
            node = path;
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
            timestamp: Date.now()
        });
    },
    lchown: (path, uid, gid) => {
        FS.chown(path, uid, gid, true);
    },
    fchown: (fd, uid, gid) => {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
    },
    truncate: (path, len) => {
        if (len < 0) {
            throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == "string") {
            var lookup = FS.lookupPath(path, {
                follow: true
            });
            node = lookup.node;
        } else {
            node = path;
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, "w");
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
            size: len,
            timestamp: Date.now()
        });
    },
    ftruncate: (fd, len) => {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
    },
    utime: (path, atime, mtime) => {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        var node = lookup.node;
        node.node_ops.setattr(node, {
            timestamp: Math.max(atime, mtime)
        });
    },
    open: (path, flags, mode) => {
        if (path === "") {
            throw new FS.ErrnoError(44);
        }
        flags = typeof flags == "string" ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode == "undefined" ? 438 : mode;
        if (flags & 64) {
            mode = (mode & 4095) | 32768;
        } else {
            mode = 0;
        }
        var node;
        if (typeof path == "object") {
            node = path;
        } else {
            path = PATH.normalize(path);
            try {
                var lookup = FS.lookupPath(path, {
                    follow: !(flags & 131072)
                });
                node = lookup.node;
            } catch (e) {}
        }
        var created = false;
        if (flags & 64) {
            if (node) {
                if (flags & 128) {
                    throw new FS.ErrnoError(20);
                }
            } else {
                node = FS.mknod(path, mode, 0);
                created = true;
            }
        }
        if (!node) {
            throw new FS.ErrnoError(44);
        }
        if (FS.isChrdev(node.mode)) {
            flags &= ~512;
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
        }
        if (!created) {
            var errCode = FS.mayOpen(node, flags);
            if (errCode) {
                throw new FS.ErrnoError(errCode);
            }
        }
        if (flags & 512 && !created) {
            FS.truncate(node, 0);
        }
        flags &= ~(128 | 512 | 131072);
        var stream = FS.createStream({
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false,
        });
        if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
                FS.readFiles[path] = 1;
            }
        }
        return stream;
    },
    close: (stream) => {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null;
        try {
            if (stream.stream_ops.close) {
                stream.stream_ops.close(stream);
            }
        } catch (e) {
            throw e;
        } finally {
            FS.closeStream(stream.fd);
        }
        stream.fd = null;
    },
    isClosed: (stream) => {
        return stream.fd === null;
    },
    llseek: (stream, offset, whence) => {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
    },
    read: (stream, buffer, offset, length, position) => {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != "undefined";
        if (!seeking) {
            position = stream.position;
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(
            stream,
            buffer,
            offset,
            length,
            position
        );
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
    },
    write: (stream, buffer, offset, length, position, canOwn) => {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
            FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != "undefined";
        if (!seeking) {
            position = stream.position;
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(
            stream,
            buffer,
            offset,
            length,
            position,
            canOwn
        );
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
    },
    allocate: (stream, offset, length) => {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
    },
    mmap: (stream, length, position, prot, flags) => {
        if (
            (prot & 2) !== 0 &&
            (flags & 2) === 0 &&
            (stream.flags & 2097155) !== 2
        ) {
            throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
    },
    msync: (stream, buffer, offset, length, mmapFlags) => {
        if (!stream || !stream.stream_ops.msync) {
            return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
    },
    munmap: (stream) => 0,
    ioctl: (stream, cmd, arg) => {
        if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
    },
    readFile: (path, opts = {}) => {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
            ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === "binary") {
            ret = buf;
        }
        FS.close(stream);
        return ret;
    },
    writeFile: (path, data, opts = {}) => {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == "string") {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
            throw new Error("Unsupported data type");
        }
        FS.close(stream);
    },
    cwd: () => FS.currentPath,
    chdir: (path) => {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        if (lookup.node === null) {
            throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, "x");
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
    },
    createDefaultDirectories: () => {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user");
    },
    createDefaultDevices: () => {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {
            read: () => 0,
            write: (stream, buffer, offset, length, pos) => length,
        });
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        var random_device = getRandomDevice();
        FS.createDevice("/dev", "random", random_device);
        FS.createDevice("/dev", "urandom", random_device);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp");
    },
    createSpecialDirectories: () => {
        FS.mkdir("/proc");
        var proc_self = FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount({
                mount: () => {
                    var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
                    node.node_ops = {
                        lookup: (parent, name) => {
                            var fd = +name;
                            var stream = FS.getStream(fd);
                            if (!stream) throw new FS.ErrnoError(8);
                            var ret = {
                                parent: null,
                                mount: {
                                    mountpoint: "fake"
                                },
                                node_ops: {
                                    readlink: () => stream.path
                                },
                            };
                            ret.parent = ret;
                            return ret;
                        },
                    };
                    return node;
                },
            }, {},
            "/proc/self/fd"
        );
    },
    createStandardStreams: () => {
        if (Module["stdin"]) {
            FS.createDevice("/dev", "stdin", Module["stdin"]);
        } else {
            FS.symlink("/dev/tty", "/dev/stdin");
        }
        if (Module["stdout"]) {
            FS.createDevice("/dev", "stdout", null, Module["stdout"]);
        } else {
            FS.symlink("/dev/tty", "/dev/stdout");
        }
        if (Module["stderr"]) {
            FS.createDevice("/dev", "stderr", null, Module["stderr"]);
        } else {
            FS.symlink("/dev/tty1", "/dev/stderr");
        }
        var stdin = FS.open("/dev/stdin", 0);
        var stdout = FS.open("/dev/stdout", 1);
        var stderr = FS.open("/dev/stderr", 1);
    },
    ensureErrnoError: () => {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function(errno) {
                this.errno = errno;
            };
            this.setErrno(errno);
            this.message = "FS error";
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [44].forEach((code) => {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = "<generic error, no stack>";
        });
    },
    staticInit: () => {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = {
            MEMFS: MEMFS,
            IDBFS: IDBFS
        };
    },
    init: (input, output, error) => {
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module["stdin"] = input || Module["stdin"];
        Module["stdout"] = output || Module["stdout"];
        Module["stderr"] = error || Module["stderr"];
        FS.createStandardStreams();
    },
    quit: () => {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
                continue;
            }
            FS.close(stream);
        }
    },
    getMode: (canRead, canWrite) => {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
    },
    findObject: (path, dontResolveLastLink) => {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
            return ret.object;
        } else {
            return null;
        }
    },
    analyzePath: (path, dontResolveLastLink) => {
        try {
            var lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            path = lookup.path;
        } catch (e) {}
        var ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null,
        };
        try {
            var lookup = FS.lookupPath(path, {
                parent: true
            });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === "/";
        } catch (e) {
            ret.error = e.errno;
        }
        return ret;
    },
    createPath: (parent, path, canRead, canWrite) => {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        var parts = path.split("/").reverse();
        while (parts.length) {
            var part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            try {
                FS.mkdir(current);
            } catch (e) {}
            parent = current;
        }
        return current;
    },
    createFile: (parent, name, properties, canRead, canWrite) => {
        var path = PATH.join2(
            typeof parent == "string" ? parent : FS.getPath(parent),
            name
        );
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
    },
    createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
        var path = name;
        if (parent) {
            parent = typeof parent == "string" ? parent : FS.getPath(parent);
            path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
            if (typeof data == "string") {
                var arr = new Array(data.length);
                for (var i = 0, len = data.length; i < len; ++i)
                    arr[i] = data.charCodeAt(i);
                data = arr;
            }
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, 577);
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode);
        }
        return node;
    },
    createDevice: (parent, name, input, output) => {
        var path = PATH.join2(
            typeof parent == "string" ? parent : FS.getPath(parent),
            name
        );
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
            open: (stream) => {
                stream.seekable = false;
            },
            close: (stream) => {
                if (output && output.buffer && output.buffer.length) {
                    output(10);
                }
            },
            read: (stream, buffer, offset, length, pos) => {
                var bytesRead = 0;
                for (var i = 0; i < length; i++) {
                    var result;
                    try {
                        result = input();
                    } catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6);
                    }
                    if (result === null || result === undefined) break;
                    bytesRead++;
                    buffer[offset + i] = result;
                }
                if (bytesRead) {
                    stream.node.timestamp = Date.now();
                }
                return bytesRead;
            },
            write: (stream, buffer, offset, length, pos) => {
                for (var i = 0; i < length; i++) {
                    try {
                        output(buffer[offset + i]);
                    } catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                }
                if (length) {
                    stream.node.timestamp = Date.now();
                }
                return i;
            },
        });
        return FS.mkdev(path, mode, dev);
    },
    forceLoadFile: (obj) => {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != "undefined") {
            throw new Error(
                "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
            );
        } else if (read_) {
            try {
                obj.contents = intArrayFromString(read_(obj.url), true);
                obj.usedBytes = obj.contents.length;
            } catch (e) {
                throw new FS.ErrnoError(29);
            }
        } else {
            throw new Error("Cannot load without read() or XMLHttpRequest.");
        }
    },
    createLazyFile: (parent, name, url, canRead, canWrite) => {
        function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = [];
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
                return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = (idx / this.chunkSize) | 0;
            return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter =
            function LazyUint8Array_setDataGetter(getter) {
                this.getter = getter;
            };
        LazyUint8Array.prototype.cacheLength =
            function LazyUint8Array_cacheLength() {
                var xhr = new XMLHttpRequest();
                xhr.open("HEAD", url, false);
                xhr.send(null);
                if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
                    throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                var datalength = Number(xhr.getResponseHeader("Content-length"));
                var header;
                var hasByteServing =
                    (header = xhr.getResponseHeader("Accept-Ranges")) &&
                    header === "bytes";
                var usesGzip =
                    (header = xhr.getResponseHeader("Content-Encoding")) &&
                    header === "gzip";
                var chunkSize = 1024 * 1024;
                if (!hasByteServing) chunkSize = datalength;
                var doXHR = (from, to) => {
                    if (from > to)
                        throw new Error(
                            "invalid range (" + from + ", " + to + ") or no bytes requested!"
                        );
                    if (to > datalength - 1)
                        throw new Error(
                            "only " + datalength + " bytes available! programmer error!"
                        );
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, false);
                    if (datalength !== chunkSize)
                        xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                    xhr.responseType = "arraybuffer";
                    if (xhr.overrideMimeType) {
                        xhr.overrideMimeType("text/plain; charset=x-user-defined");
                    }
                    xhr.send(null);
                    if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
                        throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                    if (xhr.response !== undefined) {
                        return new Uint8Array(xhr.response || []);
                    } else {
                        return intArrayFromString(xhr.responseText || "", true);
                    }
                };
                var lazyArray = this;
                lazyArray.setDataGetter((chunkNum) => {
                    var start = chunkNum * chunkSize;
                    var end = (chunkNum + 1) * chunkSize - 1;
                    end = Math.min(end, datalength - 1);
                    if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                        lazyArray.chunks[chunkNum] = doXHR(start, end);
                    }
                    if (typeof lazyArray.chunks[chunkNum] == "undefined")
                        throw new Error("doXHR failed!");
                    return lazyArray.chunks[chunkNum];
                });
                if (usesGzip || !datalength) {
                    chunkSize = datalength = 1;
                    datalength = this.getter(0).length;
                    chunkSize = datalength;
                    out(
                        "LazyFiles on gzip forces download of the whole file when length is accessed"
                    );
                }
                this._length = datalength;
                this._chunkSize = chunkSize;
                this.lengthKnown = true;
            };
        if (typeof XMLHttpRequest != "undefined") {
            if (!ENVIRONMENT_IS_WORKER)
                throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            var lazyArray = new LazyUint8Array();
            Object.defineProperties(lazyArray, {
                length: {
                    get: function() {
                        if (!this.lengthKnown) {
                            this.cacheLength();
                        }
                        return this._length;
                    },
                },
                chunkSize: {
                    get: function() {
                        if (!this.lengthKnown) {
                            this.cacheLength();
                        }
                        return this._chunkSize;
                    },
                },
            });
            var properties = {
                isDevice: false,
                contents: lazyArray
            };
        } else {
            var properties = {
                isDevice: false,
                url: url
            };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
            node.contents = properties.contents;
        } else if (properties.url) {
            node.contents = null;
            node.url = properties.url;
        }
        Object.defineProperties(node, {
            usedBytes: {
                get: function() {
                    return this.contents.length;
                },
            },
        });
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
                FS.forceLoadFile(node);
                return fn.apply(null, arguments);
            };
        });

        function writeChunks(stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= contents.length) return 0;
            var size = Math.min(contents.length - position, length);
            if (contents.slice) {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i];
                }
            } else {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents.get(position + i);
                }
            }
            return size;
        }
        stream_ops.read = (stream, buffer, offset, length, position) => {
            FS.forceLoadFile(node);
            return writeChunks(stream, buffer, offset, length, position);
        };
        stream_ops.mmap = (stream, length, position, prot, flags) => {
            FS.forceLoadFile(node);
            var ptr = mmapAlloc(length);
            if (!ptr) {
                throw new FS.ErrnoError(48);
            }
            writeChunks(stream, HEAP8, ptr, length, position);
            return {
                ptr: ptr,
                allocated: true
            };
        };
        node.stream_ops = stream_ops;
        return node;
    },
    createPreloadedFile: (
        parent,
        name,
        url,
        canRead,
        canWrite,
        onload,
        onerror,
        dontCreateFile,
        canOwn,
        preFinish
    ) => {
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency("cp " + fullname);

        function processData(byteArray) {
            function finish(byteArray) {
                if (preFinish) preFinish();
                if (!dontCreateFile) {
                    FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
                }
                if (onload) onload();
                removeRunDependency(dep);
            }
            if (
                Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
                    if (onerror) onerror();
                    removeRunDependency(dep);
                })
            ) {
                return;
            }
            finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == "string") {
            asyncLoad(url, (byteArray) => processData(byteArray), onerror);
        } else {
            processData(url);
        }
    },
    indexedDB: () => {
        return (
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB
        );
    },
    DB_NAME: () => {
        return "EM_FS_" + window.location.pathname;
    },
    DB_VERSION: 20,
    DB_STORE_NAME: "FILE_DATA",
    saveFilesToDB: (paths, onload, onerror) => {
        onload = onload || (() => {});
        onerror = onerror || (() => {});
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
            return onerror(e);
        }
        openRequest.onupgradeneeded = () => {
            out("creating db");
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = () => {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
                fail = 0,
                total = paths.length;

            function finish() {
                if (fail == 0) onload();
                else onerror();
            }
            paths.forEach((path) => {
                var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                putRequest.onsuccess = () => {
                    ok++;
                    if (ok + fail == total) finish();
                };
                putRequest.onerror = () => {
                    fail++;
                    if (ok + fail == total) finish();
                };
            });
            transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
    },
    loadFilesFromDB: (paths, onload, onerror) => {
        onload = onload || (() => {});
        onerror = onerror || (() => {});
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
            return onerror(e);
        }
        openRequest.onupgradeneeded = onerror;
        openRequest.onsuccess = () => {
            var db = openRequest.result;
            try {
                var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
            } catch (e) {
                onerror(e);
                return;
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
                fail = 0,
                total = paths.length;

            function finish() {
                if (fail == 0) onload();
                else onerror();
            }
            paths.forEach((path) => {
                var getRequest = files.get(path);
                getRequest.onsuccess = () => {
                    if (FS.analyzePath(path).exists) {
                        FS.unlink(path);
                    }
                    FS.createDataFile(
                        PATH.dirname(path),
                        PATH.basename(path),
                        getRequest.result,
                        true,
                        true,
                        true
                    );
                    ok++;
                    if (ok + fail == total) finish();
                };
                getRequest.onerror = () => {
                    fail++;
                    if (ok + fail == total) finish();
                };
            });
            transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
    },
};

function _emscripten_set_main_loop_timing(mode, value) {
    Browser.mainLoop.timingMode = mode;
    Browser.mainLoop.timingValue = value;
    if (!Browser.mainLoop.func) {
        return 1;
    }
    if (!Browser.mainLoop.running) {
        Browser.mainLoop.running = true;
    }
    if (mode == 0) {
        Browser.mainLoop.scheduler =
            function Browser_mainLoop_scheduler_setTimeout() {
                var timeUntilNextTick =
                    Math.max(
                        0,
                        Browser.mainLoop.tickStartTime + value - _emscripten_get_now()
                    ) | 0;
                setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
            };
        Browser.mainLoop.method = "timeout";
    } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
            Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = "rAF";
    } else if (mode == 2) {
        if (typeof setImmediate == "undefined") {
            var setImmediates = [];
            var emscriptenMainLoopMessageId = "setimmediate";
            var Browser_setImmediate_messageHandler = function(event) {
                if (
                    event.data === emscriptenMainLoopMessageId ||
                    event.data.target === emscriptenMainLoopMessageId
                ) {
                    event.stopPropagation();
                    setImmediates.shift()();
                }
            };
            addEventListener("message", Browser_setImmediate_messageHandler, true);
            setImmediate = function Browser_emulated_setImmediate(func) {
                setImmediates.push(func);
                if (ENVIRONMENT_IS_WORKER) {
                    if (Module["setImmediates"] === undefined)
                        Module["setImmediates"] = [];
                    Module["setImmediates"].push(func);
                    postMessage({
                        target: emscriptenMainLoopMessageId
                    });
                } else postMessage(emscriptenMainLoopMessageId, "*");
            };
        }
        Browser.mainLoop.scheduler =
            function Browser_mainLoop_scheduler_setImmediate() {
                setImmediate(Browser.mainLoop.runner);
            };
        Browser.mainLoop.method = "immediate";
    }
    return 0;
}
var _emscripten_get_now;
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = () => {
        var t = process["hrtime"]();
        return t[0] * 1e3 + t[1] / 1e6;
    };
} else _emscripten_get_now = () => performance.now();

function _exit(status) {
    exit(status);
}

function maybeExit() {}

function setMainLoop(
    browserIterationFunc,
    fps,
    simulateInfiniteLoop,
    arg,
    noSetTiming
) {
    assert(!Browser.mainLoop.func,
        "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters."
    );
    Browser.mainLoop.func = browserIterationFunc;
    Browser.mainLoop.arg = arg;
    var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;

    function checkIsRunning() {
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
            maybeExit();
            return false;
        }
        return true;
    }
    Browser.mainLoop.running = false;
    Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
            var start = Date.now();
            var blocker = Browser.mainLoop.queue.shift();
            blocker.func(blocker.arg);
            if (Browser.mainLoop.remainingBlockers) {
                var remaining = Browser.mainLoop.remainingBlockers;
                var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
                if (blocker.counted) {
                    Browser.mainLoop.remainingBlockers = next;
                } else {
                    next = next + 0.5;
                    Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
                }
            }
            out(
                'main loop blocker "' +
                blocker.name +
                '" took ' +
                (Date.now() - start) +
                " ms"
            );
            Browser.mainLoop.updateStatus();
            if (!checkIsRunning()) return;
            setTimeout(Browser.mainLoop.runner, 0);
            return;
        }
        if (!checkIsRunning()) return;
        Browser.mainLoop.currentFrameNumber =
            (Browser.mainLoop.currentFrameNumber + 1) | 0;
        if (
            Browser.mainLoop.timingMode == 1 &&
            Browser.mainLoop.timingValue > 1 &&
            Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0
        ) {
            Browser.mainLoop.scheduler();
            return;
        } else if (Browser.mainLoop.timingMode == 0) {
            Browser.mainLoop.tickStartTime = _emscripten_get_now();
        }
        Browser.mainLoop.runIter(browserIterationFunc);
        if (!checkIsRunning()) return;
        if (typeof SDL == "object" && SDL.audio && SDL.audio.queueNewAudioData)
            SDL.audio.queueNewAudioData();
        Browser.mainLoop.scheduler();
    };
    if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps);
        else _emscripten_set_main_loop_timing(1, 1);
        Browser.mainLoop.scheduler();
    }
    if (simulateInfiniteLoop) {
        throw "unwind";
    }
}

function callUserCallback(func, synchronous) {
    if (ABORT) {
        return;
    }
    if (synchronous) {
        func();
        return;
    }
    try {
        func();
    } catch (e) {
        handleException(e);
    }
}

function safeSetTimeout(func, timeout) {
    return setTimeout(function() {
        callUserCallback(func);
    }, timeout);
}
var Browser = {
    mainLoop: {
        running: false,
        scheduler: null,
        method: "",
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: function() {
            Browser.mainLoop.scheduler = null;
            Browser.mainLoop.currentlyRunningMainloop++;
        },
        resume: function() {
            Browser.mainLoop.currentlyRunningMainloop++;
            var timingMode = Browser.mainLoop.timingMode;
            var timingValue = Browser.mainLoop.timingValue;
            var func = Browser.mainLoop.func;
            Browser.mainLoop.func = null;
            setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
            _emscripten_set_main_loop_timing(timingMode, timingValue);
            Browser.mainLoop.scheduler();
        },
        updateStatus: function() {
            if (Module["setStatus"]) {
                var message = Module["statusMessage"] || "Please wait...";
                var remaining = Browser.mainLoop.remainingBlockers;
                var expected = Browser.mainLoop.expectedBlockers;
                if (remaining) {
                    if (remaining < expected) {
                        Module["setStatus"](
                            message + " (" + (expected - remaining) + "/" + expected + ")"
                        );
                    } else {
                        Module["setStatus"](message);
                    }
                } else {
                    Module["setStatus"]("");
                }
            }
        },
        runIter: function(func) {
            if (ABORT) return;
            if (Module["preMainLoop"]) {
                var preRet = Module["preMainLoop"]();
                if (preRet === false) {
                    return;
                }
            }
            callUserCallback(func);
            if (Module["postMainLoop"]) Module["postMainLoop"]();
        },
    },
    isFullscreen: false,
    pointerLock: false,
    moduleContextCreatedCallbacks: [],
    workers: [],
    init: function() {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
        if (Browser.initted) return;
        Browser.initted = true;
        try {
            new Blob();
            Browser.hasBlobConstructor = true;
        } catch (e) {
            Browser.hasBlobConstructor = false;
            out("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder =
            typeof MozBlobBuilder != "undefined" ?
            MozBlobBuilder :
            typeof WebKitBlobBuilder != "undefined" ?
            WebKitBlobBuilder :
            !Browser.hasBlobConstructor ?
            out("warning: no BlobBuilder") :
            null;
        Browser.URLObject =
            typeof window != "undefined" ?
            window.URL ?
            window.URL :
            window.webkitURL :
            undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject == "undefined") {
            out(
                "warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available."
            );
            Module.noImageDecoding = true;
        }
        var imagePlugin = {};
        imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
            return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin["handle"] = function imagePlugin_handle(
            byteArray,
            name,
            onload,
            onerror
        ) {
            var b = null;
            if (Browser.hasBlobConstructor) {
                try {
                    b = new Blob([byteArray], {
                        type: Browser.getMimetype(name)
                    });
                    if (b.size !== byteArray.length) {
                        b = new Blob([new Uint8Array(byteArray).buffer], {
                            type: Browser.getMimetype(name),
                        });
                    }
                } catch (e) {
                    warnOnce(
                        "Blob constructor present but fails: " +
                        e +
                        "; falling back to blob builder"
                    );
                }
            }
            if (!b) {
                var bb = new Browser.BlobBuilder();
                bb.append(new Uint8Array(byteArray).buffer);
                b = bb.getBlob();
            }
            var url = Browser.URLObject.createObjectURL(b);
            var img = new Image();
            img.onload = () => {
                assert(img.complete, "Image " + name + " could not be decoded");
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                preloadedImages[name] = canvas;
                Browser.URLObject.revokeObjectURL(url);
                if (onload) onload(byteArray);
            };
            img.onerror = (event) => {
                out("Image " + url + " could not be decoded");
                if (onerror) onerror();
            };
            img.src = url;
        };
        Module["preloadPlugins"].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
            return (!Module.noAudioDecoding &&
                name.substr(-4) in {
                    ".ogg": 1,
                    ".wav": 1,
                    ".mp3": 1
                }
            );
        };
        audioPlugin["handle"] = function audioPlugin_handle(
            byteArray,
            name,
            onload,
            onerror
        ) {
            var done = false;

            function finish(audio) {
                if (done) return;
                done = true;
                preloadedAudios[name] = audio;
                if (onload) onload(byteArray);
            }

            function fail() {
                if (done) return;
                done = true;
                preloadedAudios[name] = new Audio();
                if (onerror) onerror();
            }
            if (Browser.hasBlobConstructor) {
                try {
                    var b = new Blob([byteArray], {
                        type: Browser.getMimetype(name)
                    });
                } catch (e) {
                    return fail();
                }
                var url = Browser.URLObject.createObjectURL(b);
                var audio = new Audio();
                audio.addEventListener(
                    "canplaythrough",
                    function() {
                        finish(audio);
                    },
                    false
                );
                audio.onerror = function audio_onerror(event) {
                    if (done) return;
                    out(
                        "warning: browser could not fully decode audio " +
                        name +
                        ", trying slower base64 approach"
                    );

                    function encode64(data) {
                        var BASE =
                            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                        var PAD = "=";
                        var ret = "";
                        var leftchar = 0;
                        var leftbits = 0;
                        for (var i = 0; i < data.length; i++) {
                            leftchar = (leftchar << 8) | data[i];
                            leftbits += 8;
                            while (leftbits >= 6) {
                                var curr = (leftchar >> (leftbits - 6)) & 63;
                                leftbits -= 6;
                                ret += BASE[curr];
                            }
                        }
                        if (leftbits == 2) {
                            ret += BASE[(leftchar & 3) << 4];
                            ret += PAD + PAD;
                        } else if (leftbits == 4) {
                            ret += BASE[(leftchar & 15) << 2];
                            ret += PAD;
                        }
                        return ret;
                    }
                    audio.src =
                        "data:audio/x-" +
                        name.substr(-3) +
                        ";base64," +
                        encode64(byteArray);
                    finish(audio);
                };
                audio.src = url;
                safeSetTimeout(function() {
                    finish(audio);
                }, 1e4);
            } else {
                return fail();
            }
        };
        Module["preloadPlugins"].push(audioPlugin);

        function pointerLockChange() {
            Browser.pointerLock =
                document["pointerLockElement"] === Module["canvas"] ||
                document["mozPointerLockElement"] === Module["canvas"] ||
                document["webkitPointerLockElement"] === Module["canvas"] ||
                document["msPointerLockElement"] === Module["canvas"];
        }
        var canvas = Module["canvas"];
        if (canvas) {
            canvas.requestPointerLock =
                canvas["requestPointerLock"] ||
                canvas["mozRequestPointerLock"] ||
                canvas["webkitRequestPointerLock"] ||
                canvas["msRequestPointerLock"] ||
                function() {};
            canvas.exitPointerLock =
                document["exitPointerLock"] ||
                document["mozExitPointerLock"] ||
                document["webkitExitPointerLock"] ||
                document["msExitPointerLock"] ||
                function() {};
            canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
            document.addEventListener("pointerlockchange", pointerLockChange, false);
            document.addEventListener(
                "mozpointerlockchange",
                pointerLockChange,
                false
            );
            document.addEventListener(
                "webkitpointerlockchange",
                pointerLockChange,
                false
            );
            document.addEventListener(
                "mspointerlockchange",
                pointerLockChange,
                false
            );
            if (Module["elementPointerLock"]) {
                canvas.addEventListener(
                    "click",
                    function(ev) {
                        if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
                            Module["canvas"].requestPointerLock();
                            ev.preventDefault();
                        }
                    },
                    false
                );
            }
        }
    },
    handledByPreloadPlugin: function(byteArray, fullname, finish, onerror) {
        Browser.init();
        var handled = false;
        Module["preloadPlugins"].forEach(function(plugin) {
            if (handled) return;
            if (plugin["canHandle"](fullname)) {
                plugin["handle"](byteArray, fullname, finish, onerror);
                handled = true;
            }
        });
        return handled;
    },
    createContext: function(
        canvas,
        useWebGL,
        setInModule,
        webGLContextAttributes
    ) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
        var ctx;
        var contextHandle;
        if (useWebGL) {
            var contextAttributes = {
                antialias: false,
                alpha: false,
                majorVersion: typeof WebGL2RenderingContext != "undefined" ? 2 : 1,
            };
            if (webGLContextAttributes) {
                for (var attribute in webGLContextAttributes) {
                    contextAttributes[attribute] = webGLContextAttributes[attribute];
                }
            }
            if (typeof GL != "undefined") {
                contextHandle = GL.createContext(canvas, contextAttributes);
                if (contextHandle) {
                    ctx = GL.getContext(contextHandle).GLctx;
                }
            }
        } else {
            ctx = canvas.getContext("2d");
        }
        if (!ctx) return null;
        if (setInModule) {
            if (!useWebGL)
                assert(
                    typeof GLctx == "undefined",
                    "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"
                );
            Module.ctx = ctx;
            if (useWebGL) GL.makeContextCurrent(contextHandle);
            Module.useWebGL = useWebGL;
            Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
                callback();
            });
            Browser.init();
        }
        return ctx;
    },
    destroyContext: function(canvas, useWebGL, setInModule) {},
    fullscreenHandlersInstalled: false,
    lockPointer: undefined,
    resizeCanvas: undefined,
    requestFullscreen: function(lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas == "undefined")
            Browser.resizeCanvas = false;
        var canvas = Module["canvas"];

        function fullscreenChange() {
            Browser.isFullscreen = false;
            var canvasContainer = canvas.parentNode;
            if (
                (document["fullscreenElement"] ||
                    document["mozFullScreenElement"] ||
                    document["msFullscreenElement"] ||
                    document["webkitFullscreenElement"] ||
                    document["webkitCurrentFullScreenElement"]) === canvasContainer
            ) {
                canvas.exitFullscreen = Browser.exitFullscreen;
                if (Browser.lockPointer) canvas.requestPointerLock();
                Browser.isFullscreen = true;
                if (Browser.resizeCanvas) {
                    Browser.setFullscreenCanvasSize();
                } else {
                    Browser.updateCanvasDimensions(canvas);
                }
            } else {
                canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                canvasContainer.parentNode.removeChild(canvasContainer);
                if (Browser.resizeCanvas) {
                    Browser.setWindowedCanvasSize();
                } else {
                    Browser.updateCanvasDimensions(canvas);
                }
            }
            if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
            if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
        }
        if (!Browser.fullscreenHandlersInstalled) {
            Browser.fullscreenHandlersInstalled = true;
            document.addEventListener("fullscreenchange", fullscreenChange, false);
            document.addEventListener("mozfullscreenchange", fullscreenChange, false);
            document.addEventListener(
                "webkitfullscreenchange",
                fullscreenChange,
                false
            );
            document.addEventListener("MSFullscreenChange", fullscreenChange, false);
        }
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        canvasContainer.requestFullscreen =
            canvasContainer["requestFullscreen"] ||
            canvasContainer["mozRequestFullScreen"] ||
            canvasContainer["msRequestFullscreen"] ||
            (canvasContainer["webkitRequestFullscreen"] ?
                function() {
                    canvasContainer["webkitRequestFullscreen"](
                        Element["ALLOW_KEYBOARD_INPUT"]
                    );
                } :
                null) ||
            (canvasContainer["webkitRequestFullScreen"] ?
                function() {
                    canvasContainer["webkitRequestFullScreen"](
                        Element["ALLOW_KEYBOARD_INPUT"]
                    );
                } :
                null);
        canvasContainer.requestFullscreen();
    },
    exitFullscreen: function() {
        if (!Browser.isFullscreen) {
            return false;
        }
        var CFS =
            document["exitFullscreen"] ||
            document["cancelFullScreen"] ||
            document["mozCancelFullScreen"] ||
            document["msExitFullscreen"] ||
            document["webkitCancelFullScreen"] ||
            function() {};
        CFS.apply(document, []);
        return true;
    },
    nextRAF: 0,
    fakeRequestAnimationFrame: function(func) {
        var now = Date.now();
        if (Browser.nextRAF === 0) {
            Browser.nextRAF = now + 1e3 / 60;
        } else {
            while (now + 2 >= Browser.nextRAF) {
                Browser.nextRAF += 1e3 / 60;
            }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
    },
    requestAnimationFrame: function(func) {
        if (typeof requestAnimationFrame == "function") {
            requestAnimationFrame(func);
            return;
        }
        var RAF = Browser.fakeRequestAnimationFrame;
        RAF(func);
    },
    safeSetTimeout: function(func) {
        return safeSetTimeout(func);
    },
    safeRequestAnimationFrame: function(func) {
        return Browser.requestAnimationFrame(function() {
            callUserCallback(func);
        });
    },
    getMimetype: function(name) {
        return {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            bmp: "image/bmp",
            ogg: "audio/ogg",
            wav: "audio/wav",
            mp3: "audio/mpeg",
        }[name.substr(name.lastIndexOf(".") + 1)];
    },
    getUserMedia: function(func) {
        if (!window.getUserMedia) {
            window.getUserMedia =
                navigator["getUserMedia"] || navigator["mozGetUserMedia"];
        }
        window.getUserMedia(func);
    },
    getMovementX: function(event) {
        return (
            event["movementX"] ||
            event["mozMovementX"] ||
            event["webkitMovementX"] ||
            0
        );
    },
    getMovementY: function(event) {
        return (
            event["movementY"] ||
            event["mozMovementY"] ||
            event["webkitMovementY"] ||
            0
        );
    },
    getMouseWheelDelta: function(event) {
        var delta = 0;
        switch (event.type) {
            case "DOMMouseScroll":
                delta = event.detail / 3;
                break;
            case "mousewheel":
                delta = event.wheelDelta / 120;
                break;
            case "wheel":
                delta = event.deltaY;
                switch (event.deltaMode) {
                    case 0:
                        delta /= 100;
                        break;
                    case 1:
                        delta /= 3;
                        break;
                    case 2:
                        delta *= 80;
                        break;
                    default:
                        throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
                }
                break;
            default:
                throw "unrecognized mouse wheel event: " + event.type;
        }
        return delta;
    },
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseEvent: function(event) {
        if (Browser.pointerLock) {
            if (event.type != "mousemove" && "mozMovementX" in event) {
                Browser.mouseMovementX = Browser.mouseMovementY = 0;
            } else {
                Browser.mouseMovementX = Browser.getMovementX(event);
                Browser.mouseMovementY = Browser.getMovementY(event);
            }
            if (typeof SDL != "undefined") {
                Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
                Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
            } else {
                Browser.mouseX += Browser.mouseMovementX;
                Browser.mouseY += Browser.mouseMovementY;
            }
        } else {
            var rect = Module["canvas"].getBoundingClientRect();
            var cw = Module["canvas"].width;
            var ch = Module["canvas"].height;
            var scrollX =
                typeof window.scrollX != "undefined" ?
                window.scrollX :
                window.pageXOffset;
            var scrollY =
                typeof window.scrollY != "undefined" ?
                window.scrollY :
                window.pageYOffset;
            if (
                event.type === "touchstart" ||
                event.type === "touchend" ||
                event.type === "touchmove"
            ) {
                var touch = event.touch;
                if (touch === undefined) {
                    return;
                }
                var adjustedX = touch.pageX - (scrollX + rect.left);
                var adjustedY = touch.pageY - (scrollY + rect.top);
                adjustedX = adjustedX * (cw / rect.width);
                adjustedY = adjustedY * (ch / rect.height);
                var coords = {
                    x: adjustedX,
                    y: adjustedY
                };
                if (event.type === "touchstart") {
                    Browser.lastTouches[touch.identifier] = coords;
                    Browser.touches[touch.identifier] = coords;
                } else if (event.type === "touchend" || event.type === "touchmove") {
                    var last = Browser.touches[touch.identifier];
                    if (!last) last = coords;
                    Browser.lastTouches[touch.identifier] = last;
                    Browser.touches[touch.identifier] = coords;
                }
                return;
            }
            var x = event.pageX - (scrollX + rect.left);
            var y = event.pageY - (scrollY + rect.top);
            x = x * (cw / rect.width);
            y = y * (ch / rect.height);
            Browser.mouseMovementX = x - Browser.mouseX;
            Browser.mouseMovementY = y - Browser.mouseY;
            Browser.mouseX = x;
            Browser.mouseY = y;
        }
    },
    resizeListeners: [],
    updateResizeListeners: function() {
        var canvas = Module["canvas"];
        Browser.resizeListeners.forEach(function(listener) {
            listener(canvas.width, canvas.height);
        });
    },
    setCanvasSize: function(width, height, noUpdates) {
        var canvas = Module["canvas"];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
    },
    windowedWidth: 0,
    windowedHeight: 0,
    setFullscreenCanvasSize: function() {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags | 8388608;
            HEAP32[SDL.screen >> 2] = flags;
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners();
    },
    setWindowedCanvasSize: function() {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags & ~8388608;
            HEAP32[SDL.screen >> 2] = flags;
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners();
    },
    updateCanvasDimensions: function(canvas, wNative, hNative) {
        if (wNative && hNative) {
            canvas.widthNative = wNative;
            canvas.heightNative = hNative;
        } else {
            wNative = canvas.widthNative;
            hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
            if (w / h < Module["forcedAspectRatio"]) {
                w = Math.round(h * Module["forcedAspectRatio"]);
            } else {
                h = Math.round(w / Module["forcedAspectRatio"]);
            }
        }
        if (
            (document["fullscreenElement"] ||
                document["mozFullScreenElement"] ||
                document["msFullscreenElement"] ||
                document["webkitFullscreenElement"] ||
                document["webkitCurrentFullScreenElement"]) === canvas.parentNode &&
            typeof screen != "undefined"
        ) {
            var factor = Math.min(screen.width / w, screen.height / h);
            w = Math.round(w * factor);
            h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
            if (canvas.width != w) canvas.width = w;
            if (canvas.height != h) canvas.height = h;
            if (typeof canvas.style != "undefined") {
                canvas.style.removeProperty("width");
                canvas.style.removeProperty("height");
            }
        } else {
            if (canvas.width != wNative) canvas.width = wNative;
            if (canvas.height != hNative) canvas.height = hNative;
            if (typeof canvas.style != "undefined") {
                if (w != wNative || h != hNative) {
                    canvas.style.setProperty("width", w + "px", "important");
                    canvas.style.setProperty("height", h + "px", "important");
                } else {
                    canvas.style.removeProperty("width");
                    canvas.style.removeProperty("height");
                }
            }
        }
    },
};

function _SDL_GetTicks() {
    return (Date.now() - SDL.startTime) | 0;
}

function _SDL_LockSurface(surf) {
    var surfData = SDL.surfaces[surf];
    surfData.locked++;
    if (surfData.locked > 1) return 0;
    if (!surfData.buffer) {
        surfData.buffer = _malloc(surfData.width * surfData.height * 4);
        HEAPU32[(surf + 20) >> 2] = surfData.buffer;
    }
    HEAPU32[(surf + 20) >> 2] = surfData.buffer;
    if (surf == SDL.screen && Module.screenIsReadOnly && surfData.image) return 0;
    if (SDL.defaults.discardOnLock) {
        if (!surfData.image) {
            surfData.image = surfData.ctx.createImageData(
                surfData.width,
                surfData.height
            );
        }
        if (!SDL.defaults.opaqueFrontBuffer) return;
    } else {
        surfData.image = surfData.ctx.getImageData(
            0,
            0,
            surfData.width,
            surfData.height
        );
    }
    if (surf == SDL.screen && SDL.defaults.opaqueFrontBuffer) {
        var data = surfData.image.data;
        var num = data.length;
        for (var i = 0; i < num / 4; i++) {
            data[i * 4 + 3] = 255;
        }
    }
    if (SDL.defaults.copyOnLock && !SDL.defaults.discardOnLock) {
        if (surfData.isFlagSet(2097152)) {
            throw (
                "CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set" +
                new Error().stack
            );
        } else {
            HEAPU8.set(surfData.image.data, surfData.buffer);
        }
    }
    return 0;
}

function SDL_unicode() {
    return SDL.unicode;
}

function SDL_ttfContext() {
    return SDL.ttfContext;
}

function SDL_audio() {
    return SDL.audio;
}
var SDL = {
    defaults: {
        width: 320,
        height: 200,
        copyOnLock: true,
        discardOnLock: false,
        opaqueFrontBuffer: true,
    },
    version: null,
    surfaces: {},
    canvasPool: [],
    events: [],
    fonts: [null],
    audios: [null],
    rwops: [null],
    music: {
        audio: null,
        volume: 1
    },
    mixerFrequency: 22050,
    mixerFormat: 32784,
    mixerNumChannels: 2,
    mixerChunkSize: 1024,
    channelMinimumNumber: 0,
    GL: false,
    glAttributes: {
        0: 3,
        1: 3,
        2: 2,
        3: 0,
        4: 0,
        5: 1,
        6: 16,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 1,
        16: 0,
        17: 0,
        18: 0,
    },
    keyboardState: null,
    keyboardMap: {},
    canRequestFullscreen: false,
    isRequestingFullscreen: false,
    textInput: false,
    startTime: null,
    initFlags: 0,
    buttonState: 0,
    modState: 0,
    DOMButtons: [0, 0, 0],
    DOMEventToSDLEvent: {},
    TOUCH_DEFAULT_ID: 0,
    eventHandler: null,
    eventHandlerContext: null,
    eventHandlerTemp: 0,
    keyCodes: {
        16: 1249,
        17: 1248,
        18: 1250,
        20: 1081,
        33: 1099,
        34: 1102,
        35: 1101,
        36: 1098,
        37: 1104,
        38: 1106,
        39: 1103,
        40: 1105,
        44: 316,
        45: 1097,
        46: 127,
        91: 1251,
        93: 1125,
        96: 1122,
        97: 1113,
        98: 1114,
        99: 1115,
        100: 1116,
        101: 1117,
        102: 1118,
        103: 1119,
        104: 1120,
        105: 1121,
        106: 1109,
        107: 1111,
        109: 1110,
        110: 1123,
        111: 1108,
        112: 1082,
        113: 1083,
        114: 1084,
        115: 1085,
        116: 1086,
        117: 1087,
        118: 1088,
        119: 1089,
        120: 1090,
        121: 1091,
        122: 1092,
        123: 1093,
        124: 1128,
        125: 1129,
        126: 1130,
        127: 1131,
        128: 1132,
        129: 1133,
        130: 1134,
        131: 1135,
        132: 1136,
        133: 1137,
        134: 1138,
        135: 1139,
        144: 1107,
        160: 94,
        161: 33,
        162: 34,
        163: 35,
        164: 36,
        165: 37,
        166: 38,
        167: 95,
        168: 40,
        169: 41,
        170: 42,
        171: 43,
        172: 124,
        173: 45,
        174: 123,
        175: 125,
        176: 126,
        181: 127,
        182: 129,
        183: 128,
        188: 44,
        190: 46,
        191: 47,
        192: 96,
        219: 91,
        220: 92,
        221: 93,
        222: 39,
        224: 1251,
    },
    scanCodes: {
        8: 42,
        9: 43,
        13: 40,
        27: 41,
        32: 44,
        35: 204,
        39: 53,
        44: 54,
        46: 55,
        47: 56,
        48: 39,
        49: 30,
        50: 31,
        51: 32,
        52: 33,
        53: 34,
        54: 35,
        55: 36,
        56: 37,
        57: 38,
        58: 203,
        59: 51,
        61: 46,
        91: 47,
        92: 49,
        93: 48,
        96: 52,
        97: 4,
        98: 5,
        99: 6,
        100: 7,
        101: 8,
        102: 9,
        103: 10,
        104: 11,
        105: 12,
        106: 13,
        107: 14,
        108: 15,
        109: 16,
        110: 17,
        111: 18,
        112: 19,
        113: 20,
        114: 21,
        115: 22,
        116: 23,
        117: 24,
        118: 25,
        119: 26,
        120: 27,
        121: 28,
        122: 29,
        127: 76,
        305: 224,
        308: 226,
        316: 70,
    },
    loadRect: function(rect) {
        return {
            x: HEAP32[(rect + 0) >> 2],
            y: HEAP32[(rect + 4) >> 2],
            w: HEAP32[(rect + 8) >> 2],
            h: HEAP32[(rect + 12) >> 2],
        };
    },
    updateRect: function(rect, r) {
        HEAP32[rect >> 2] = r.x;
        HEAP32[(rect + 4) >> 2] = r.y;
        HEAP32[(rect + 8) >> 2] = r.w;
        HEAP32[(rect + 12) >> 2] = r.h;
    },
    intersectionOfRects: function(first, second) {
        var leftX = Math.max(first.x, second.x);
        var leftY = Math.max(first.y, second.y);
        var rightX = Math.min(first.x + first.w, second.x + second.w);
        var rightY = Math.min(first.y + first.h, second.y + second.h);
        return {
            x: leftX,
            y: leftY,
            w: Math.max(leftX, rightX) - leftX,
            h: Math.max(leftY, rightY) - leftY,
        };
    },
    checkPixelFormat: function(fmt) {},
    loadColorToCSSRGB: function(color) {
        var rgba = HEAP32[color >> 2];
        return (
            "rgb(" +
            (rgba & 255) +
            "," +
            ((rgba >> 8) & 255) +
            "," +
            ((rgba >> 16) & 255) +
            ")"
        );
    },
    loadColorToCSSRGBA: function(color) {
        var rgba = HEAP32[color >> 2];
        return (
            "rgba(" +
            (rgba & 255) +
            "," +
            ((rgba >> 8) & 255) +
            "," +
            ((rgba >> 16) & 255) +
            "," +
            ((rgba >> 24) & 255) / 255 +
            ")"
        );
    },
    translateColorToCSSRGBA: function(rgba) {
        return (
            "rgba(" +
            (rgba & 255) +
            "," +
            ((rgba >> 8) & 255) +
            "," +
            ((rgba >> 16) & 255) +
            "," +
            (rgba >>> 24) / 255 +
            ")"
        );
    },
    translateRGBAToCSSRGBA: function(r, g, b, a) {
        return (
            "rgba(" +
            (r & 255) +
            "," +
            (g & 255) +
            "," +
            (b & 255) +
            "," +
            (a & 255) / 255 +
            ")"
        );
    },
    translateRGBAToColor: function(r, g, b, a) {
        return r | (g << 8) | (b << 16) | (a << 24);
    },
    makeSurface: function(
        width,
        height,
        flags,
        usePageCanvas,
        source,
        rmask,
        gmask,
        bmask,
        amask
    ) {
        flags = flags || 0;
        var is_SDL_HWSURFACE = flags & 1;
        var is_SDL_HWPALETTE = flags & 2097152;
        var is_SDL_OPENGL = flags & 67108864;
        var surf = _malloc(60);
        var pixelFormat = _malloc(44);
        var bpp = is_SDL_HWPALETTE ? 1 : 4;
        var buffer = 0;
        if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
            buffer = _malloc(width * height * 4);
        }
        HEAP32[surf >> 2] = flags;
        HEAPU32[(surf + 4) >> 2] = pixelFormat;
        HEAP32[(surf + 8) >> 2] = width;
        HEAP32[(surf + 12) >> 2] = height;
        HEAP32[(surf + 16) >> 2] = width * bpp;
        HEAPU32[(surf + 20) >> 2] = buffer;
        HEAP32[(surf + 36) >> 2] = 0;
        HEAP32[(surf + 40) >> 2] = 0;
        HEAP32[(surf + 44) >> 2] = Module["canvas"].width;
        HEAP32[(surf + 48) >> 2] = Module["canvas"].height;
        HEAP32[(surf + 56) >> 2] = 1;
        HEAP32[pixelFormat >> 2] = -2042224636;
        HEAP32[(pixelFormat + 4) >> 2] = 0;
        HEAP8[(pixelFormat + 8) >> 0] = bpp * 8;
        HEAP8[(pixelFormat + 9) >> 0] = bpp;
        HEAP32[(pixelFormat + 12) >> 2] = rmask || 255;
        HEAP32[(pixelFormat + 16) >> 2] = gmask || 65280;
        HEAP32[(pixelFormat + 20) >> 2] = bmask || 16711680;
        HEAP32[(pixelFormat + 24) >> 2] = amask || 4278190080;
        SDL.GL = SDL.GL || is_SDL_OPENGL;
        var canvas;
        if (!usePageCanvas) {
            if (SDL.canvasPool.length > 0) {
                canvas = SDL.canvasPool.pop();
            } else {
                canvas = document.createElement("canvas");
            }
            canvas.width = width;
            canvas.height = height;
        } else {
            canvas = Module["canvas"];
        }
        var webGLContextAttributes = {
            antialias: SDL.glAttributes[13] != 0 && SDL.glAttributes[14] > 1,
            depth: SDL.glAttributes[6] > 0,
            stencil: SDL.glAttributes[7] > 0,
            alpha: SDL.glAttributes[3] > 0,
        };
        var ctx = Browser.createContext(
            canvas,
            is_SDL_OPENGL,
            usePageCanvas,
            webGLContextAttributes
        );
        SDL.surfaces[surf] = {
            width: width,
            height: height,
            canvas: canvas,
            ctx: ctx,
            surf: surf,
            buffer: buffer,
            pixelFormat: pixelFormat,
            alpha: 255,
            flags: flags,
            locked: 0,
            usePageCanvas: usePageCanvas,
            source: source,
            isFlagSet: function(flag) {
                return flags & flag;
            },
        };
        return surf;
    },
    copyIndexedColorData: function(surfData, rX, rY, rW, rH) {
        if (!surfData.colors) {
            return;
        }
        var fullWidth = Module["canvas"].width;
        var fullHeight = Module["canvas"].height;
        var startX = rX || 0;
        var startY = rY || 0;
        var endX = (rW || fullWidth - startX) + startX;
        var endY = (rH || fullHeight - startY) + startY;
        var buffer = surfData.buffer;
        if (!surfData.image.data32) {
            surfData.image.data32 = new Uint32Array(surfData.image.data.buffer);
        }
        var data32 = surfData.image.data32;
        var colors32 = surfData.colors32;
        for (var y = startY; y < endY; ++y) {
            var base = y * fullWidth;
            for (var x = startX; x < endX; ++x) {
                data32[base + x] = colors32[HEAPU8[(buffer + base + x) >> 0]];
            }
        }
    },
    freeSurface: function(surf) {
        var refcountPointer = surf + 56;
        var refcount = HEAP32[refcountPointer >> 2];
        if (refcount > 1) {
            HEAP32[refcountPointer >> 2] = refcount - 1;
            return;
        }
        var info = SDL.surfaces[surf];
        if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
        if (info.buffer) _free(info.buffer);
        _free(info.pixelFormat);
        _free(surf);
        SDL.surfaces[surf] = null;
        if (surf === SDL.screen) {
            SDL.screen = null;
        }
    },
    blitSurface: function(src, srcrect, dst, dstrect, scale) {
        var srcData = SDL.surfaces[src];
        var dstData = SDL.surfaces[dst];
        var sr, dr;
        if (srcrect) {
            sr = SDL.loadRect(srcrect);
        } else {
            sr = {
                x: 0,
                y: 0,
                w: srcData.width,
                h: srcData.height
            };
        }
        if (dstrect) {
            dr = SDL.loadRect(dstrect);
        } else {
            dr = {
                x: 0,
                y: 0,
                w: srcData.width,
                h: srcData.height
            };
        }
        if (dstData.clipRect) {
            var widthScale = !scale || sr.w === 0 ? 1 : sr.w / dr.w;
            var heightScale = !scale || sr.h === 0 ? 1 : sr.h / dr.h;
            dr = SDL.intersectionOfRects(dstData.clipRect, dr);
            sr.w = dr.w * widthScale;
            sr.h = dr.h * heightScale;
            if (dstrect) {
                SDL.updateRect(dstrect, dr);
            }
        }
        var blitw, blith;
        if (scale) {
            blitw = dr.w;
            blith = dr.h;
        } else {
            blitw = sr.w;
            blith = sr.h;
        }
        if (sr.w === 0 || sr.h === 0 || blitw === 0 || blith === 0) {
            return 0;
        }
        var oldAlpha = dstData.ctx.globalAlpha;
        dstData.ctx.globalAlpha = srcData.alpha / 255;
        dstData.ctx.drawImage(
            srcData.canvas,
            sr.x,
            sr.y,
            sr.w,
            sr.h,
            dr.x,
            dr.y,
            blitw,
            blith
        );
        dstData.ctx.globalAlpha = oldAlpha;
        if (dst != SDL.screen) {
            warnOnce("WARNING: copying canvas data to memory for compatibility");
            _SDL_LockSurface(dst);
            dstData.locked--;
        }
        return 0;
    },
    downFingers: {},
    savedKeydown: null,
    receiveEvent: function(event) {
        function unpressAllPressedKeys() {
            for (var code in SDL.keyboardMap) {
                SDL.events.push({
                    type: "keyup",
                    keyCode: SDL.keyboardMap[code]
                });
            }
        }
        switch (event.type) {
            case "touchstart":
            case "touchmove":
                {
                    event.preventDefault();
                    var touches = [];
                    if (event.type === "touchstart") {
                        for (var i = 0; i < event.touches.length; i++) {
                            var touch = event.touches[i];
                            if (SDL.downFingers[touch.identifier] != true) {
                                SDL.downFingers[touch.identifier] = true;
                                touches.push(touch);
                            }
                        }
                    } else {
                        touches = event.touches;
                    }
                    var firstTouch = touches[0];
                    if (firstTouch) {
                        if (event.type == "touchstart") {
                            SDL.DOMButtons[0] = 1;
                        }
                        var mouseEventType;
                        switch (event.type) {
                            case "touchstart":
                                mouseEventType = "mousedown";
                                break;
                            case "touchmove":
                                mouseEventType = "mousemove";
                                break;
                        }
                        var mouseEvent = {
                            type: mouseEventType,
                            button: 0,
                            pageX: firstTouch.clientX,
                            pageY: firstTouch.clientY,
                        };
                        SDL.events.push(mouseEvent);
                    }
                    for (var i = 0; i < touches.length; i++) {
                        var touch = touches[i];
                        SDL.events.push({
                            type: event.type,
                            touch: touch
                        });
                    }
                    break;
                }
            case "touchend":
                {
                    event.preventDefault();
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        var touch = event.changedTouches[i];
                        if (SDL.downFingers[touch.identifier] === true) {
                            delete SDL.downFingers[touch.identifier];
                        }
                    }
                    var mouseEvent = {
                        type: "mouseup",
                        button: 0,
                        pageX: event.changedTouches[0].clientX,
                        pageY: event.changedTouches[0].clientY,
                    };
                    SDL.DOMButtons[0] = 0;
                    SDL.events.push(mouseEvent);
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        var touch = event.changedTouches[i];
                        SDL.events.push({
                            type: "touchend",
                            touch: touch
                        });
                    }
                    break;
                }
            case "DOMMouseScroll":
            case "mousewheel":
            case "wheel":
                var delta = -Browser.getMouseWheelDelta(event);
                delta =
                    delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
                var button = delta > 0 ? 3 : 4;
                SDL.events.push({
                    type: "mousedown",
                    button: button,
                    pageX: event.pageX,
                    pageY: event.pageY,
                });
                SDL.events.push({
                    type: "mouseup",
                    button: button,
                    pageX: event.pageX,
                    pageY: event.pageY,
                });
                SDL.events.push({
                    type: "wheel",
                    deltaX: 0,
                    deltaY: delta
                });
                event.preventDefault();
                break;
            case "mousemove":
                if (SDL.DOMButtons[0] === 1) {
                    SDL.events.push({
                        type: "touchmove",
                        touch: {
                            identifier: 0,
                            deviceID: -1,
                            pageX: event.pageX,
                            pageY: event.pageY,
                        },
                    });
                }
                if (Browser.pointerLock) {
                    if ("mozMovementX" in event) {
                        event["movementX"] = event["mozMovementX"];
                        event["movementY"] = event["mozMovementY"];
                    }
                    if (event["movementX"] == 0 && event["movementY"] == 0) {
                        event.preventDefault();
                        return;
                    }
                }
            case "keydown":
            case "keyup":
            case "keypress":
            case "mousedown":
            case "mouseup":
                if (
                    event.type !== "keydown" ||
                    (!SDL_unicode() && !SDL.textInput) ||
                    event.keyCode === 8 ||
                    event.keyCode === 9
                ) {
                    event.preventDefault();
                }
                if (event.type == "mousedown") {
                    SDL.DOMButtons[event.button] = 1;
                    SDL.events.push({
                        type: "touchstart",
                        touch: {
                            identifier: 0,
                            deviceID: -1,
                            pageX: event.pageX,
                            pageY: event.pageY,
                        },
                    });
                } else if (event.type == "mouseup") {
                    if (!SDL.DOMButtons[event.button]) {
                        return;
                    }
                    SDL.events.push({
                        type: "touchend",
                        touch: {
                            identifier: 0,
                            deviceID: -1,
                            pageX: event.pageX,
                            pageY: event.pageY,
                        },
                    });
                    SDL.DOMButtons[event.button] = 0;
                }
                if (event.type === "keydown" || event.type === "mousedown") {
                    SDL.canRequestFullscreen = true;
                } else if (event.type === "keyup" || event.type === "mouseup") {
                    if (SDL.isRequestingFullscreen) {
                        Module["requestFullscreen"](true, true);
                        SDL.isRequestingFullscreen = false;
                    }
                    SDL.canRequestFullscreen = false;
                }
                if (event.type === "keypress" && SDL.savedKeydown) {
                    SDL.savedKeydown.keypressCharCode = event.charCode;
                    SDL.savedKeydown = null;
                } else if (event.type === "keydown") {
                    SDL.savedKeydown = event;
                }
                if (event.type !== "keypress" || SDL.textInput) {
                    SDL.events.push(event);
                }
                break;
            case "mouseout":
                for (var i = 0; i < 3; i++) {
                    if (SDL.DOMButtons[i]) {
                        SDL.events.push({
                            type: "mouseup",
                            button: i,
                            pageX: event.pageX,
                            pageY: event.pageY,
                        });
                        SDL.DOMButtons[i] = 0;
                    }
                }
                event.preventDefault();
                break;
            case "focus":
                SDL.events.push(event);
                event.preventDefault();
                break;
            case "blur":
                SDL.events.push(event);
                unpressAllPressedKeys();
                event.preventDefault();
                break;
            case "visibilitychange":
                SDL.events.push({
                    type: "visibilitychange",
                    visible: !document.hidden,
                });
                unpressAllPressedKeys();
                event.preventDefault();
                break;
            case "unload":
                if (Browser.mainLoop.runner) {
                    SDL.events.push(event);
                    Browser.mainLoop.runner();
                }
                return;
            case "resize":
                SDL.events.push(event);
                if (event.preventDefault) {
                    event.preventDefault();
                }
                break;
        }
        if (SDL.events.length >= 1e4) {
            err("SDL event queue full, dropping events");
            SDL.events = SDL.events.slice(0, 1e4);
        }
        SDL.flushEventsToHandler();
        return;
    },
    lookupKeyCodeForEvent: function(event) {
        var code = event.keyCode;
        if (code >= 65 && code <= 90) {
            code += 32;
        } else {
            code = SDL.keyCodes[event.keyCode] || event.keyCode;
            if (
                event.location === 2 &&
                code >= (224 | (1 << 10)) &&
                code <= (227 | (1 << 10))
            ) {
                code += 4;
            }
        }
        return code;
    },
    handleEvent: function(event) {
        if (event.handled) return;
        event.handled = true;
        switch (event.type) {
            case "touchstart":
            case "touchend":
            case "touchmove":
                {
                    Browser.calculateMouseEvent(event);
                    break;
                }
            case "keydown":
            case "keyup":
                {
                    var down = event.type === "keydown";
                    var code = SDL.lookupKeyCodeForEvent(event);
                    HEAP8[(SDL.keyboardState + code) >> 0] = down;
                    SDL.modState =
                    (HEAP8[(SDL.keyboardState + 1248) >> 0] ? 64 : 0) |
                    (HEAP8[(SDL.keyboardState + 1249) >> 0] ? 1 : 0) |
                    (HEAP8[(SDL.keyboardState + 1250) >> 0] ? 256 : 0) |
                    (HEAP8[(SDL.keyboardState + 1252) >> 0] ? 128 : 0) |
                    (HEAP8[(SDL.keyboardState + 1253) >> 0] ? 2 : 0) |
                    (HEAP8[(SDL.keyboardState + 1254) >> 0] ? 512 : 0);
                    if (down) {
                        SDL.keyboardMap[code] = event.keyCode;
                    } else {
                        delete SDL.keyboardMap[code];
                    }
                    break;
                }
            case "mousedown":
            case "mouseup":
                if (event.type == "mousedown") {
                    SDL.buttonState |= 1 << event.button;
                } else if (event.type == "mouseup") {
                    SDL.buttonState &= ~(1 << event.button);
                }
            case "mousemove":
                {
                    Browser.calculateMouseEvent(event);
                    break;
                }
        }
    },
    flushEventsToHandler: function() {
        if (!SDL.eventHandler) return;
        while (SDL.pollEvent(SDL.eventHandlerTemp)) {
            getWasmTableEntry(SDL.eventHandler)(
                SDL.eventHandlerContext,
                SDL.eventHandlerTemp
            );
        }
    },
    pollEvent: function(ptr) {
        if (SDL.initFlags & 512 && SDL.joystickEventState) {
            SDL.queryJoysticks();
        }
        if (ptr) {
            while (SDL.events.length > 0) {
                if (SDL.makeCEvent(SDL.events.shift(), ptr) !== false) return 1;
            }
            return 0;
        } else {
            return SDL.events.length > 0;
        }
    },
    makeCEvent: function(event, ptr) {
        if (typeof event == "number") {
            _memcpy(ptr, event, 28);
            _free(event);
            return;
        }
        SDL.handleEvent(event);
        switch (event.type) {
            case "keydown":
            case "keyup":
                {
                    var down = event.type === "keydown";
                    var key = SDL.lookupKeyCodeForEvent(event);
                    var scan;
                    if (key >= 1024) {
                        scan = key - 1024;
                    } else {
                        scan = SDL.scanCodes[key] || key;
                    }
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP8[(ptr + 8) >> 0] = down ? 1 : 0;
                    HEAP8[(ptr + 9) >> 0] = 0;
                    HEAP32[(ptr + 12) >> 2] = scan;
                    HEAP32[(ptr + 16) >> 2] = key;
                    HEAP16[(ptr + 20) >> 1] = SDL.modState;
                    HEAP32[(ptr + 24) >> 2] = event.keypressCharCode || key;
                    break;
                }
            case "keypress":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    var cStr = intArrayFromString(String.fromCharCode(event.charCode));
                    for (var i = 0; i < cStr.length; ++i) {
                        HEAP8[(ptr + (8 + i)) >> 0] = cStr[i];
                    }
                    break;
                }
            case "mousedown":
            case "mouseup":
            case "mousemove":
                {
                    if (event.type != "mousemove") {
                        var down = event.type === "mousedown";
                        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                        HEAP32[(ptr + 4) >> 2] = 0;
                        HEAP32[(ptr + 8) >> 2] = 0;
                        HEAP32[(ptr + 12) >> 2] = 0;
                        HEAP8[(ptr + 16) >> 0] = event.button + 1;
                        HEAP8[(ptr + 17) >> 0] = down ? 1 : 0;
                        HEAP32[(ptr + 20) >> 2] = Browser.mouseX;
                        HEAP32[(ptr + 24) >> 2] = Browser.mouseY;
                    } else {
                        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                        HEAP32[(ptr + 4) >> 2] = 0;
                        HEAP32[(ptr + 8) >> 2] = 0;
                        HEAP32[(ptr + 12) >> 2] = 0;
                        HEAP32[(ptr + 16) >> 2] = SDL.buttonState;
                        HEAP32[(ptr + 20) >> 2] = Browser.mouseX;
                        HEAP32[(ptr + 24) >> 2] = Browser.mouseY;
                        HEAP32[(ptr + 28) >> 2] = Browser.mouseMovementX;
                        HEAP32[(ptr + 32) >> 2] = Browser.mouseMovementY;
                    }
                    break;
                }
            case "wheel":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[(ptr + 16) >> 2] = event.deltaX;
                    HEAP32[(ptr + 20) >> 2] = event.deltaY;
                    break;
                }
            case "touchstart":
            case "touchend":
            case "touchmove":
                {
                    var touch = event.touch;
                    if (!Browser.touches[touch.identifier]) break;
                    var w = Module["canvas"].width;
                    var h = Module["canvas"].height;
                    var x = Browser.touches[touch.identifier].x / w;
                    var y = Browser.touches[touch.identifier].y / h;
                    var lx = Browser.lastTouches[touch.identifier].x / w;
                    var ly = Browser.lastTouches[touch.identifier].y / h;
                    var dx = x - lx;
                    var dy = y - ly;
                    if (touch["deviceID"] === undefined)
                        touch.deviceID = SDL.TOUCH_DEFAULT_ID;
                    if (dx === 0 && dy === 0 && event.type === "touchmove") return false;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[(ptr + 4) >> 2] = _SDL_GetTicks();
                    (tempI64 = [
                        touch.deviceID >>> 0,
                        ((tempDouble = touch.deviceID), +Math.abs(tempDouble) >= 1 ?
                            tempDouble > 0 ?
                            (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) |
                                0) >>>
                            0 :
                            ~~+Math.ceil(
                                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                            ) >>> 0 :
                            0),
                    ]),
                    (HEAP32[(ptr + 8) >> 2] = tempI64[0]),
                    (HEAP32[(ptr + 12) >> 2] = tempI64[1]);
                    (tempI64 = [
                        touch.identifier >>> 0,
                        ((tempDouble = touch.identifier), +Math.abs(tempDouble) >= 1 ?
                            tempDouble > 0 ?
                            (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) |
                                0) >>>
                            0 :
                            ~~+Math.ceil(
                                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                            ) >>> 0 :
                            0),
                    ]),
                    (HEAP32[(ptr + 16) >> 2] = tempI64[0]),
                    (HEAP32[(ptr + 20) >> 2] = tempI64[1]);
                    HEAPF32[(ptr + 24) >> 2] = x;
                    HEAPF32[(ptr + 28) >> 2] = y;
                    HEAPF32[(ptr + 32) >> 2] = dx;
                    HEAPF32[(ptr + 36) >> 2] = dy;
                    if (touch.force !== undefined) {
                        HEAPF32[(ptr + 40) >> 2] = touch.force;
                    } else {
                        HEAPF32[(ptr + 40) >> 2] = event.type == "touchend" ? 0 : 1;
                    }
                    break;
                }
            case "unload":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    break;
                }
            case "resize":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[(ptr + 4) >> 2] = event.w;
                    HEAP32[(ptr + 8) >> 2] = event.h;
                    break;
                }
            case "joystick_button_up":
            case "joystick_button_down":
                {
                    var state = event.type === "joystick_button_up" ? 0 : 1;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP8[(ptr + 4) >> 0] = event.index;
                    HEAP8[(ptr + 5) >> 0] = event.button;
                    HEAP8[(ptr + 6) >> 0] = state;
                    break;
                }
            case "joystick_axis_motion":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP8[(ptr + 4) >> 0] = event.index;
                    HEAP8[(ptr + 5) >> 0] = event.axis;
                    HEAP32[(ptr + 8) >> 2] = SDL.joystickAxisValueConversion(event.value);
                    break;
                }
            case "focus":
                {
                    var SDL_WINDOWEVENT_FOCUS_GAINED = 12;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[(ptr + 4) >> 2] = 0;
                    HEAP8[(ptr + 8) >> 0] = SDL_WINDOWEVENT_FOCUS_GAINED;
                    break;
                }
            case "blur":
                {
                    var SDL_WINDOWEVENT_FOCUS_LOST = 13;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[(ptr + 4) >> 2] = 0;
                    HEAP8[(ptr + 8) >> 0] = SDL_WINDOWEVENT_FOCUS_LOST;
                    break;
                }
            case "visibilitychange":
                {
                    var SDL_WINDOWEVENT_SHOWN = 1;
                    var SDL_WINDOWEVENT_HIDDEN = 2;
                    var visibilityEventID = event.visible ?
                        SDL_WINDOWEVENT_SHOWN :
                        SDL_WINDOWEVENT_HIDDEN;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[(ptr + 4) >> 2] = 0;
                    HEAP8[(ptr + 8) >> 0] = visibilityEventID;
                    break;
                }
            default:
                throw "Unhandled SDL event: " + event.type;
        }
    },
    makeFontString: function(height, fontName) {
        if (fontName.charAt(0) != "'" && fontName.charAt(0) != '"') {
            fontName = '"' + fontName + '"';
        }
        return height + "px " + fontName + ", serif";
    },
    estimateTextWidth: function(fontData, text) {
        var h = fontData.size;
        var fontString = SDL.makeFontString(h, fontData.name);
        var tempCtx = SDL_ttfContext();
        tempCtx.font = fontString;
        var ret = tempCtx.measureText(text).width | 0;
        return ret;
    },
    allocateChannels: function(num) {
        if (SDL.numChannels && SDL.numChannels >= num && num != 0) return;
        SDL.numChannels = num;
        SDL.channels = [];
        for (var i = 0; i < num; i++) {
            SDL.channels[i] = {
                audio: null,
                volume: 1
            };
        }
    },
    setGetVolume: function(info, volume) {
        if (!info) return 0;
        var ret = info.volume * 128;
        if (volume != -1) {
            info.volume = Math.min(Math.max(volume, 0), 128) / 128;
            if (info.audio) {
                try {
                    info.audio.volume = info.volume;
                    if (info.audio.webAudioGainNode)
                        info.audio.webAudioGainNode["gain"]["value"] = info.volume;
                } catch (e) {
                    err("setGetVolume failed to set audio volume: " + e);
                }
            }
        }
        return ret;
    },
    setPannerPosition: function(info, x, y, z) {
        if (!info) return;
        if (info.audio) {
            if (info.audio.webAudioPannerNode) {
                info.audio.webAudioPannerNode["setPosition"](x, y, z);
            }
        }
    },
    playWebAudio: function(audio) {
        if (!audio) return;
        if (audio.webAudioNode) return;
        if (!SDL.webAudioAvailable()) return;
        try {
            var webAudio = audio.resource.webAudio;
            audio.paused = false;
            if (!webAudio.decodedBuffer) {
                if (webAudio.onDecodeComplete === undefined)
                    abort("Cannot play back audio object that was not loaded");
                webAudio.onDecodeComplete.push(function() {
                    if (!audio.paused) SDL.playWebAudio(audio);
                });
                return;
            }
            audio.webAudioNode = SDL.audioContext["createBufferSource"]();
            audio.webAudioNode["buffer"] = webAudio.decodedBuffer;
            audio.webAudioNode["loop"] = audio.loop;
            audio.webAudioNode["onended"] = function() {
                audio["onended"]();
            };
            audio.webAudioPannerNode = SDL.audioContext["createPanner"]();
            audio.webAudioPannerNode["setPosition"](0, 0, -0.5);
            audio.webAudioPannerNode["panningModel"] = "equalpower";
            audio.webAudioGainNode = SDL.audioContext["createGain"]();
            audio.webAudioGainNode["gain"]["value"] = audio.volume;
            audio.webAudioNode["connect"](audio.webAudioPannerNode);
            audio.webAudioPannerNode["connect"](audio.webAudioGainNode);
            audio.webAudioGainNode["connect"](SDL.audioContext["destination"]);
            audio.webAudioNode["start"](0, audio.currentPosition);
            audio.startTime = SDL.audioContext["currentTime"] - audio.currentPosition;
        } catch (e) {
            err("playWebAudio failed: " + e);
        }
    },
    pauseWebAudio: function(audio) {
        if (!audio) return;
        if (audio.webAudioNode) {
            try {
                audio.currentPosition =
                    (SDL.audioContext["currentTime"] - audio.startTime) %
                    audio.resource.webAudio.decodedBuffer.duration;
                audio.webAudioNode["onended"] = undefined;
                audio.webAudioNode.stop(0);
                audio.webAudioNode = undefined;
            } catch (e) {
                err("pauseWebAudio failed: " + e);
            }
        }
        audio.paused = true;
    },
    openAudioContext: function() {
        if (!SDL.audioContext) {
            if (typeof AudioContext != "undefined")
                SDL.audioContext = new AudioContext();
            else if (typeof webkitAudioContext != "undefined")
                SDL.audioContext = new webkitAudioContext();
        }
    },
    webAudioAvailable: function() {
        return !!SDL.audioContext;
    },
    fillWebAudioBufferFromHeap: function(
        heapPtr,
        sizeSamplesPerChannel,
        dstAudioBuffer
    ) {
        var audio = SDL_audio();
        var numChannels = audio.channels;
        for (var c = 0; c < numChannels; ++c) {
            var channelData = dstAudioBuffer["getChannelData"](c);
            if (channelData.length != sizeSamplesPerChannel) {
                throw (
                    "Web Audio output buffer length mismatch! Destination size: " +
                    channelData.length +
                    " samples vs expected " +
                    sizeSamplesPerChannel +
                    " samples!"
                );
            }
            if (audio.format == 32784) {
                for (var j = 0; j < sizeSamplesPerChannel; ++j) {
                    channelData[j] =
                        HEAP16[(heapPtr + (j * numChannels + c) * 2) >> 1] / 32768;
                }
            } else if (audio.format == 8) {
                for (var j = 0; j < sizeSamplesPerChannel; ++j) {
                    var v = HEAP8[(heapPtr + (j * numChannels + c)) >> 0];
                    channelData[j] = (v >= 0 ? v - 128 : v + 128) / 128;
                }
            } else if (audio.format == 33056) {
                for (var j = 0; j < sizeSamplesPerChannel; ++j) {
                    channelData[j] = HEAPF32[(heapPtr + (j * numChannels + c) * 4) >> 2];
                }
            } else {
                throw "Invalid SDL audio format " + audio.format + "!";
            }
        }
    },
    debugSurface: function(surfData) {
        out(
            "dumping surface " + [surfData.surf, surfData.source, surfData.width, surfData.height]
        );
        var image = surfData.ctx.getImageData(
            0,
            0,
            surfData.width,
            surfData.height
        );
        var data = image.data;
        var num = Math.min(surfData.width, surfData.height);
        for (var i = 0; i < num; i++) {
            out(
                "   diagonal " +
                i +
                ":" + [
                    data[i * surfData.width * 4 + i * 4 + 0],
                    data[i * surfData.width * 4 + i * 4 + 1],
                    data[i * surfData.width * 4 + i * 4 + 2],
                    data[i * surfData.width * 4 + i * 4 + 3],
                ]
            );
        }
    },
    joystickEventState: 1,
    lastJoystickState: {},
    joystickNamePool: {},
    recordJoystickState: function(joystick, state) {
        var buttons = new Array(state.buttons.length);
        for (var i = 0; i < state.buttons.length; i++) {
            buttons[i] = SDL.getJoystickButtonState(state.buttons[i]);
        }
        SDL.lastJoystickState[joystick] = {
            buttons: buttons,
            axes: state.axes.slice(0),
            timestamp: state.timestamp,
            index: state.index,
            id: state.id,
        };
    },
    getJoystickButtonState: function(button) {
        if (typeof button == "object") {
            return button["pressed"];
        } else {
            return button > 0;
        }
    },
    queryJoysticks: function() {
        for (var joystick in SDL.lastJoystickState) {
            var state = SDL.getGamepad(joystick - 1);
            var prevState = SDL.lastJoystickState[joystick];
            if (typeof state == "undefined") return;
            if (state === null) return;
            if (
                typeof state.timestamp != "number" ||
                state.timestamp != prevState.timestamp ||
                !state.timestamp
            ) {
                var i;
                for (i = 0; i < state.buttons.length; i++) {
                    var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
                    if (buttonState !== prevState.buttons[i]) {
                        SDL.events.push({
                            type: buttonState ? "joystick_button_down" : "joystick_button_up",
                            joystick: joystick,
                            index: joystick - 1,
                            button: i,
                        });
                    }
                }
                for (i = 0; i < state.axes.length; i++) {
                    if (state.axes[i] !== prevState.axes[i]) {
                        SDL.events.push({
                            type: "joystick_axis_motion",
                            joystick: joystick,
                            index: joystick - 1,
                            axis: i,
                            value: state.axes[i],
                        });
                    }
                }
                SDL.recordJoystickState(joystick, state);
            }
        }
    },
    joystickAxisValueConversion: function(value) {
        value = Math.min(1, Math.max(value, -1));
        return Math.ceil((value + 1) * 32767.5 - 32768);
    },
    getGamepads: function() {
        var fcn =
            navigator.getGamepads ||
            navigator.webkitGamepads ||
            navigator.mozGamepads ||
            navigator.gamepads ||
            navigator.webkitGetGamepads;
        if (fcn !== undefined) {
            return fcn.apply(navigator);
        } else {
            return [];
        }
    },
    getGamepad: function(deviceIndex) {
        var gamepads = SDL.getGamepads();
        if (gamepads.length > deviceIndex && deviceIndex >= 0) {
            return gamepads[deviceIndex];
        }
        return null;
    },
};

function _SDL_GetNumAudioDrivers() {
    return 1;
}

function _SDL_Init(initFlags) {
    SDL.startTime = Date.now();
    SDL.initFlags = initFlags;
    if (!Module["doNotCaptureKeyboard"]) {
        var keyboardListeningElement =
            Module["keyboardListeningElement"] || document;
        keyboardListeningElement.addEventListener("keydown", SDL.receiveEvent);
        keyboardListeningElement.addEventListener("keyup", SDL.receiveEvent);
        keyboardListeningElement.addEventListener("keypress", SDL.receiveEvent);
        window.addEventListener("focus", SDL.receiveEvent);
        window.addEventListener("blur", SDL.receiveEvent);
        document.addEventListener("visibilitychange", SDL.receiveEvent);
    }
    window.addEventListener("unload", SDL.receiveEvent);
    SDL.keyboardState = _malloc(65536);
    zeroMemory(SDL.keyboardState, 65536);
    SDL.DOMEventToSDLEvent["keydown"] = 768;
    SDL.DOMEventToSDLEvent["keyup"] = 769;
    SDL.DOMEventToSDLEvent["keypress"] = 771;
    SDL.DOMEventToSDLEvent["mousedown"] = 1025;
    SDL.DOMEventToSDLEvent["mouseup"] = 1026;
    SDL.DOMEventToSDLEvent["mousemove"] = 1024;
    SDL.DOMEventToSDLEvent["wheel"] = 1027;
    SDL.DOMEventToSDLEvent["touchstart"] = 1792;
    SDL.DOMEventToSDLEvent["touchend"] = 1793;
    SDL.DOMEventToSDLEvent["touchmove"] = 1794;
    SDL.DOMEventToSDLEvent["unload"] = 256;
    SDL.DOMEventToSDLEvent["resize"] = 28673;
    SDL.DOMEventToSDLEvent["visibilitychange"] = 512;
    SDL.DOMEventToSDLEvent["focus"] = 512;
    SDL.DOMEventToSDLEvent["blur"] = 512;
    SDL.DOMEventToSDLEvent["joystick_axis_motion"] = 1536;
    SDL.DOMEventToSDLEvent["joystick_button_down"] = 1539;
    SDL.DOMEventToSDLEvent["joystick_button_up"] = 1540;
    return 0;
}

function listenOnce(object, event, func) {
    object.addEventListener(event, func, {
        once: true
    });
}

function autoResumeAudioContext(ctx, elements) {
    if (!elements) {
        elements = [document, document.getElementById("canvas")];
    }
    ["keydown", "mousedown", "touchstart"].forEach(function(event) {
        elements.forEach(function(element) {
            if (element) {
                listenOnce(element, event, function() {
                    if (ctx.state === "suspended") ctx.resume();
                });
            }
        });
    });
}

function _SDL_OpenAudio(desired, obtained) {
    try {
        SDL.audio = {
            freq: HEAPU32[desired >> 2],
            format: HEAPU16[(desired + 4) >> 1],
            channels: HEAPU8[(desired + 6) >> 0],
            samples: HEAPU16[(desired + 8) >> 1],
            callback: HEAPU32[(desired + 16) >> 2],
            userdata: HEAPU32[(desired + 20) >> 2],
            paused: true,
            timer: null,
        };
        if (SDL.audio.format == 8) {
            SDL.audio.silence = 128;
        } else if (SDL.audio.format == 32784) {
            SDL.audio.silence = 0;
        } else if (SDL.audio.format == 33056) {
            SDL.audio.silence = 0;
        } else {
            throw "Invalid SDL audio format " + SDL.audio.format + "!";
        }
        if (SDL.audio.freq <= 0) {
            throw "Unsupported sound frequency " + SDL.audio.freq + "!";
        } else if (SDL.audio.freq <= 22050) {
            SDL.audio.freq = 22050;
        } else if (SDL.audio.freq <= 32e3) {
            SDL.audio.freq = 32e3;
        } else if (SDL.audio.freq <= 44100) {
            SDL.audio.freq = 44100;
        } else if (SDL.audio.freq <= 48e3) {
            SDL.audio.freq = 48e3;
        } else if (SDL.audio.freq <= 96e3) {
            SDL.audio.freq = 96e3;
        } else {
            throw "Unsupported sound frequency " + SDL.audio.freq + "!";
        }
        if (SDL.audio.channels == 0) {
            SDL.audio.channels = 1;
        } else if (SDL.audio.channels < 0 || SDL.audio.channels > 32) {
            throw (
                "Unsupported number of audio channels for SDL audio: " +
                SDL.audio.channels +
                "!"
            );
        } else if (SDL.audio.channels != 1 && SDL.audio.channels != 2) {
            out(
                "Warning: Using untested number of audio channels " + SDL.audio.channels
            );
        }
        if (SDL.audio.samples < 128 || SDL.audio.samples > 524288) {
            throw "Unsupported audio callback buffer size " + SDL.audio.samples + "!";
        } else if ((SDL.audio.samples & (SDL.audio.samples - 1)) != 0) {
            throw (
                "Audio callback buffer size " +
                SDL.audio.samples +
                " must be a power-of-two!"
            );
        }
        var totalSamples = SDL.audio.samples * SDL.audio.channels;
        if (SDL.audio.format == 8) {
            SDL.audio.bytesPerSample = 1;
        } else if (SDL.audio.format == 32784) {
            SDL.audio.bytesPerSample = 2;
        } else if (SDL.audio.format == 33056) {
            SDL.audio.bytesPerSample = 4;
        } else {
            throw "Invalid SDL audio format " + SDL.audio.format + "!";
        }
        SDL.audio.bufferSize = totalSamples * SDL.audio.bytesPerSample;
        SDL.audio.bufferDurationSecs =
            SDL.audio.bufferSize /
            SDL.audio.bytesPerSample /
            SDL.audio.channels /
            SDL.audio.freq;
        SDL.audio.bufferingDelay = 50 / 1e3;
        SDL.audio.buffer = _malloc(SDL.audio.bufferSize);
        SDL.audio.numSimultaneouslyQueuedBuffers =
            Module["SDL_numSimultaneouslyQueuedBuffers"] || 5;
        SDL.audio.queueNewAudioData = function SDL_queueNewAudioData() {
            if (!SDL.audio) return;
            for (var i = 0; i < SDL.audio.numSimultaneouslyQueuedBuffers; ++i) {
                var secsUntilNextPlayStart =
                    SDL.audio.nextPlayTime - SDL.audioContext["currentTime"];
                if (
                    secsUntilNextPlayStart >=
                    SDL.audio.bufferingDelay +
                    SDL.audio.bufferDurationSecs *
                    SDL.audio.numSimultaneouslyQueuedBuffers
                )
                    return;
                getWasmTableEntry(SDL.audio.callback)(
                    SDL.audio.userdata,
                    SDL.audio.buffer,
                    SDL.audio.bufferSize
                );
                SDL.audio.pushAudio(SDL.audio.buffer, SDL.audio.bufferSize);
            }
        };
        SDL.audio.caller = function SDL_audioCaller() {
            if (!SDL.audio) return;
            --SDL.audio.numAudioTimersPending;
            SDL.audio.queueNewAudioData();
            var secsUntilNextPlayStart =
                SDL.audio.nextPlayTime - SDL.audioContext["currentTime"];
            var preemptBufferFeedSecs = SDL.audio.bufferDurationSecs / 2;
            if (
                SDL.audio.numAudioTimersPending <
                SDL.audio.numSimultaneouslyQueuedBuffers
            ) {
                ++SDL.audio.numAudioTimersPending;
                SDL.audio.timer = safeSetTimeout(
                    SDL.audio.caller,
                    Math.max(0, 1e3 * (secsUntilNextPlayStart - preemptBufferFeedSecs))
                );
                if (
                    SDL.audio.numAudioTimersPending <
                    SDL.audio.numSimultaneouslyQueuedBuffers
                ) {
                    ++SDL.audio.numAudioTimersPending;
                    safeSetTimeout(SDL.audio.caller, 1);
                }
            }
        };
        SDL.audio.audioOutput = new Audio();
        SDL.openAudioContext();
        if (!SDL.audioContext) throw "Web Audio API is not available!";
        autoResumeAudioContext(SDL.audioContext);
        SDL.audio.nextPlayTime = 0;
        SDL.audio.pushAudio = function(ptr, sizeBytes) {
            try {
                if (SDL.audio.paused) return;
                var sizeSamples = sizeBytes / SDL.audio.bytesPerSample;
                var sizeSamplesPerChannel = sizeSamples / SDL.audio.channels;
                if (sizeSamplesPerChannel != SDL.audio.samples) {
                    throw "Received mismatching audio buffer size!";
                }
                var source = SDL.audioContext["createBufferSource"]();
                var soundBuffer = SDL.audioContext["createBuffer"](
                    SDL.audio.channels,
                    sizeSamplesPerChannel,
                    SDL.audio.freq
                );
                source["connect"](SDL.audioContext["destination"]);
                SDL.fillWebAudioBufferFromHeap(ptr, sizeSamplesPerChannel, soundBuffer);
                source["buffer"] = soundBuffer;
                var curtime = SDL.audioContext["currentTime"];
                var playtime = Math.max(
                    curtime + SDL.audio.bufferingDelay,
                    SDL.audio.nextPlayTime
                );
                if (typeof source["start"] != "undefined") {
                    source["start"](playtime);
                } else if (typeof source["noteOn"] != "undefined") {
                    source["noteOn"](playtime);
                }
                SDL.audio.nextPlayTime = playtime + SDL.audio.bufferDurationSecs;
            } catch (e) {
                out("Web Audio API error playing back audio: " + e.toString());
            }
        };
        if (obtained) {
            HEAP32[obtained >> 2] = SDL.audio.freq;
            HEAP16[(obtained + 4) >> 1] = SDL.audio.format;
            HEAP8[(obtained + 6) >> 0] = SDL.audio.channels;
            HEAP8[(obtained + 7) >> 0] = SDL.audio.silence;
            HEAP16[(obtained + 8) >> 1] = SDL.audio.samples;
            HEAPU32[(obtained + 16) >> 2] = SDL.audio.callback;
            HEAPU32[(obtained + 20) >> 2] = SDL.audio.userdata;
        }
        SDL.allocateChannels(32);
    } catch (e) {
        out(
            'Initializing SDL audio threw an exception: "' +
            e.toString() +
            '"! Continuing without audio.'
        );
        SDL.audio = null;
        SDL.allocateChannels(0);
        if (obtained) {
            HEAP32[obtained >> 2] = 0;
            HEAP16[(obtained + 4) >> 1] = 0;
            HEAP8[(obtained + 6) >> 0] = 0;
            HEAP8[(obtained + 7) >> 0] = 0;
            HEAP16[(obtained + 8) >> 1] = 0;
            HEAPU32[(obtained + 16) >> 2] = 0;
            HEAPU32[(obtained + 20) >> 2] = 0;
        }
    }
    if (!SDL.audio) {
        return -1;
    }
    return 0;
}

function _SDL_PauseAudio(pauseOn) {
    if (!SDL.audio) {
        return;
    }
    if (pauseOn) {
        if (SDL.audio.timer !== undefined) {
            clearTimeout(SDL.audio.timer);
            SDL.audio.numAudioTimersPending = 0;
            SDL.audio.timer = undefined;
        }
    } else if (!SDL.audio.timer) {
        SDL.audio.numAudioTimersPending = 1;
        SDL.audio.timer = safeSetTimeout(SDL.audio.caller, 1);
    }
    SDL.audio.paused = pauseOn;
}

function _SDL_AudioQuit() {
    for (var i = 0; i < SDL.numChannels; ++i) {
        var chan = SDL.channels[i];
        if (chan.audio) {
            chan.audio.pause();
            chan.audio = undefined;
        }
    }
    var audio = SDL.music.audio;
    if (audio) audio.pause();
    SDL.music.audio = undefined;
}

function _SDL_Quit() {
    _SDL_AudioQuit();
    out("SDL_Quit called (and ignored)");
}

function ___assert_fail(condition, filename, line, func) {
    abort(
        "Assertion failed: " +
        UTF8ToString(condition) +
        ", at: " + [
            filename ? UTF8ToString(filename) : "unknown filename",
            line,
            func ? UTF8ToString(func) : "unknown function",
        ]
    );
}
var SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    calculateAt: function(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
            return path;
        }
        var dir;
        if (dirfd === -100) {
            dir = FS.cwd();
        } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) throw new FS.ErrnoError(8);
            dir = dirstream.path;
        }
        if (path.length == 0) {
            if (!allowEmpty) {
                throw new FS.ErrnoError(44);
            }
            return dir;
        }
        return PATH.join2(dir, path);
    },
    doStat: function(func, path, buf) {
        try {
            var stat = func(path);
        } catch (e) {
            if (
                e &&
                e.node &&
                PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))
            ) {
                return -54;
            }
            throw e;
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[(buf + 4) >> 2] = 0;
        HEAP32[(buf + 8) >> 2] = stat.ino;
        HEAP32[(buf + 12) >> 2] = stat.mode;
        HEAP32[(buf + 16) >> 2] = stat.nlink;
        HEAP32[(buf + 20) >> 2] = stat.uid;
        HEAP32[(buf + 24) >> 2] = stat.gid;
        HEAP32[(buf + 28) >> 2] = stat.rdev;
        HEAP32[(buf + 32) >> 2] = 0;
        (tempI64 = [
            stat.size >>> 0,
            ((tempDouble = stat.size), +Math.abs(tempDouble) >= 1 ?
                tempDouble > 0 ?
                (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>>
                0 :
                ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>>
                0 :
                0),
        ]),
        (HEAP32[(buf + 40) >> 2] = tempI64[0]),
        (HEAP32[(buf + 44) >> 2] = tempI64[1]);
        HEAP32[(buf + 48) >> 2] = 4096;
        HEAP32[(buf + 52) >> 2] = stat.blocks;
        HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0;
        HEAP32[(buf + 60) >> 2] = 0;
        HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
        HEAP32[(buf + 68) >> 2] = 0;
        HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
        HEAP32[(buf + 76) >> 2] = 0;
        (tempI64 = [
            stat.ino >>> 0,
            ((tempDouble = stat.ino), +Math.abs(tempDouble) >= 1 ?
                tempDouble > 0 ?
                (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>>
                0 :
                ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>>
                0 :
                0),
        ]),
        (HEAP32[(buf + 80) >> 2] = tempI64[0]),
        (HEAP32[(buf + 84) >> 2] = tempI64[1]);
        return 0;
    },
    doMsync: function(addr, stream, len, flags, offset) {
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
    },
    varargs: undefined,
    get: function() {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
        return ret;
    },
    getStr: function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
    },
    getStreamFromFD: function(fd) {
        var stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        return stream;
    },
};

function ___syscall_faccessat(dirfd, path, amode, flags) {
    try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (amode & ~7) {
            return -28;
        }
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        var node = lookup.node;
        if (!node) {
            return -44;
        }
        var perms = "";
        if (amode & 4) perms += "r";
        if (amode & 2) perms += "w";
        if (amode & 1) perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
            return -2;
        }
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function setErrNo(value) {
    HEAP32[___errno_location() >> 2] = value;
    return value;
}

function ___syscall_fcntl64(fd, cmd, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
            case 0:
                {
                    var arg = SYSCALLS.get();
                    if (arg < 0) {
                        return -28;
                    }
                    var newStream;
                    newStream = FS.createStream(stream, arg);
                    return newStream.fd;
                }
            case 1:
            case 2:
                return 0;
            case 3:
                return stream.flags;
            case 4:
                {
                    var arg = SYSCALLS.get();
                    stream.flags |= arg;
                    return 0;
                }
            case 5:
                {
                    var arg = SYSCALLS.get();
                    var offset = 0;
                    HEAP16[(arg + offset) >> 1] = 2;
                    return 0;
                }
            case 6:
            case 7:
                return 0;
            case 16:
            case 8:
                return -28;
            case 9:
                setErrNo(28);
                return -1;
            default:
                {
                    return -28;
                }
        }
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function ___syscall_getdents64(fd, dirp, count) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (!stream.getdents) {
            stream.getdents = FS.readdir(stream.path);
        }
        var struct_size = 280;
        var pos = 0;
        var off = FS.llseek(stream, 0, 1);
        var idx = Math.floor(off / struct_size);
        while (idx < stream.getdents.length && pos + struct_size <= count) {
            var id;
            var type;
            var name = stream.getdents[idx];
            if (name === ".") {
                id = stream.node.id;
                type = 4;
            } else if (name === "..") {
                var lookup = FS.lookupPath(stream.path, {
                    parent: true
                });
                id = lookup.node.id;
                type = 4;
            } else {
                var child = FS.lookupNode(stream.node, name);
                id = child.id;
                type = FS.isChrdev(child.mode) ?
                    2 :
                    FS.isDir(child.mode) ?
                    4 :
                    FS.isLink(child.mode) ?
                    10 :
                    8;
            }
            (tempI64 = [
                id >>> 0,
                ((tempDouble = id), +Math.abs(tempDouble) >= 1 ?
                    tempDouble > 0 ?
                    (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) |
                        0) >>>
                    0 :
                    ~~+Math.ceil(
                        (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                    ) >>> 0 :
                    0),
            ]),
            (HEAP32[(dirp + pos) >> 2] = tempI64[0]),
            (HEAP32[(dirp + pos + 4) >> 2] = tempI64[1]);
            (tempI64 = [
                ((idx + 1) * struct_size) >>> 0,
                ((tempDouble = (idx + 1) * struct_size), +Math.abs(tempDouble) >= 1 ?
                    tempDouble > 0 ?
                    (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) |
                        0) >>>
                    0 :
                    ~~+Math.ceil(
                        (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                    ) >>> 0 :
                    0),
            ]),
            (HEAP32[(dirp + pos + 8) >> 2] = tempI64[0]),
            (HEAP32[(dirp + pos + 12) >> 2] = tempI64[1]);
            HEAP16[(dirp + pos + 16) >> 1] = 280;
            HEAP8[(dirp + pos + 18) >> 0] = type;
            stringToUTF8(name, dirp + pos + 19, 256);
            pos += struct_size;
            idx += 1;
        }
        FS.llseek(stream, idx * struct_size, 0);
        return pos;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function ___syscall_ioctl(fd, op, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
            case 21509:
            case 21505:
                {
                    if (!stream.tty) return -59;
                    return 0;
                }
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508:
                {
                    if (!stream.tty) return -59;
                    return 0;
                }
            case 21519:
                {
                    if (!stream.tty) return -59;
                    var argp = SYSCALLS.get();
                    HEAP32[argp >> 2] = 0;
                    return 0;
                }
            case 21520:
                {
                    if (!stream.tty) return -59;
                    return -28;
                }
            case 21531:
                {
                    var argp = SYSCALLS.get();
                    return FS.ioctl(stream, op, argp);
                }
            case 21523:
                {
                    if (!stream.tty) return -59;
                    return 0;
                }
            case 21524:
                {
                    if (!stream.tty) return -59;
                    return 0;
                }
            default:
                abort("bad ioctl syscall " + op);
        }
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function ___syscall_mkdirat(dirfd, path, mode) {
    try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        path = PATH.normalize(path);
        if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function ___syscall_openat(dirfd, path, flags, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        var mode = varargs ? SYSCALLS.get() : 0;
        return FS.open(path, flags, mode).fd;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
    try {
        oldpath = SYSCALLS.getStr(oldpath);
        newpath = SYSCALLS.getStr(newpath);
        oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
        newpath = SYSCALLS.calculateAt(newdirfd, newpath);
        FS.rename(oldpath, newpath);
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function ___syscall_rmdir(path) {
    try {
        path = SYSCALLS.getStr(path);
        FS.rmdir(path);
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function ___syscall_stat64(path, buf) {
    try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doStat(FS.stat, path, buf);
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function ___syscall_unlinkat(dirfd, path, flags) {
    try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (flags === 0) {
            FS.unlink(path);
        } else if (flags === 512) {
            FS.rmdir(path);
        } else {
            abort("Invalid flags passed to unlinkat");
        }
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
    }
}

function __emscripten_date_now() {
    return Date.now();
}

function __localtime_js(time, tmPtr) {
    var date = new Date(HEAP32[time >> 2] * 1e3);
    HEAP32[tmPtr >> 2] = date.getSeconds();
    HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
    HEAP32[(tmPtr + 8) >> 2] = date.getHours();
    HEAP32[(tmPtr + 12) >> 2] = date.getDate();
    HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
    HEAP32[(tmPtr + 20) >> 2] = date.getFullYear() - 1900;
    HEAP32[(tmPtr + 24) >> 2] = date.getDay();
    var start = new Date(date.getFullYear(), 0, 1);
    var yday = ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0;
    HEAP32[(tmPtr + 28) >> 2] = yday;
    HEAP32[(tmPtr + 36) >> 2] = -(date.getTimezoneOffset() * 60);
    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dst =
        (summerOffset != winterOffset &&
            date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
    HEAP32[(tmPtr + 32) >> 2] = dst;
}

function __mktime_js(tmPtr) {
    var date = new Date(
        HEAP32[(tmPtr + 20) >> 2] + 1900,
        HEAP32[(tmPtr + 16) >> 2],
        HEAP32[(tmPtr + 12) >> 2],
        HEAP32[(tmPtr + 8) >> 2],
        HEAP32[(tmPtr + 4) >> 2],
        HEAP32[tmPtr >> 2],
        0
    );
    var dst = HEAP32[(tmPtr + 32) >> 2];
    var guessedOffset = date.getTimezoneOffset();
    var start = new Date(date.getFullYear(), 0, 1);
    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dstOffset = Math.min(winterOffset, summerOffset);
    if (dst < 0) {
        HEAP32[(tmPtr + 32) >> 2] = Number(
            summerOffset != winterOffset && dstOffset == guessedOffset
        );
    } else if (dst > 0 != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
    }
    HEAP32[(tmPtr + 24) >> 2] = date.getDay();
    var yday = ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0;
    HEAP32[(tmPtr + 28) >> 2] = yday;
    HEAP32[tmPtr >> 2] = date.getSeconds();
    HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
    HEAP32[(tmPtr + 8) >> 2] = date.getHours();
    HEAP32[(tmPtr + 12) >> 2] = date.getDate();
    HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
    return (date.getTime() / 1e3) | 0;
}

function _tzset_impl(timezone, daylight, tzname) {
    var currentYear = new Date().getFullYear();
    var winter = new Date(currentYear, 0, 1);
    var summer = new Date(currentYear, 6, 1);
    var winterOffset = winter.getTimezoneOffset();
    var summerOffset = summer.getTimezoneOffset();
    var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
    HEAP32[timezone >> 2] = stdTimezoneOffset * 60;
    HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);

    function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT";
    }
    var winterName = extractZone(winter);
    var summerName = extractZone(summer);
    var winterNamePtr = allocateUTF8(winterName);
    var summerNamePtr = allocateUTF8(summerName);
    if (summerOffset < winterOffset) {
        HEAPU32[tzname >> 2] = winterNamePtr;
        HEAPU32[(tzname + 4) >> 2] = summerNamePtr;
    } else {
        HEAPU32[tzname >> 2] = summerNamePtr;
        HEAPU32[(tzname + 4) >> 2] = winterNamePtr;
    }
}

function __tzset_js(timezone, daylight, tzname) {
    if (__tzset_js.called) return;
    __tzset_js.called = true;
    _tzset_impl(timezone, daylight, tzname);
}

function _abort() {
    abort("");
}
var readAsmConstArgsArray = [];

function readAsmConstArgs(sigPtr, buf) {
    readAsmConstArgsArray.length = 0;
    var ch;
    buf >>= 2;
    while ((ch = HEAPU8[sigPtr++])) {
        buf += (ch != 105) & buf;
        readAsmConstArgsArray.push(ch == 105 ? HEAP32[buf] : HEAPF64[buf++ >> 1]);
        ++buf;
    }
    return readAsmConstArgsArray;
}

function _emscripten_asm_const_int(code, sigPtr, argbuf) {
    var args = readAsmConstArgs(sigPtr, argbuf);
    return ASM_CONSTS[code].apply(null, args);
}

function _emscripten_cancel_main_loop() {
    Browser.mainLoop.pause();
    Browser.mainLoop.func = null;
}

function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.copyWithin(dest, src, src + num);
}
var JSEvents = {
    inEventHandler: 0,
    removeAllEventListeners: function() {
        for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
            JSEvents._removeHandler(i);
        }
        JSEvents.eventHandlers = [];
        JSEvents.deferredCalls = [];
    },
    registerRemoveEventListeners: function() {
        if (!JSEvents.removeEventListenersRegistered) {
            __ATEXIT__.push(JSEvents.removeAllEventListeners);
            JSEvents.removeEventListenersRegistered = true;
        }
    },
    deferredCalls: [],
    deferCall: function(targetFunction, precedence, argsList) {
        function arraysHaveEqualContent(arrA, arrB) {
            if (arrA.length != arrB.length) return false;
            for (var i in arrA) {
                if (arrA[i] != arrB[i]) return false;
            }
            return true;
        }
        for (var i in JSEvents.deferredCalls) {
            var call = JSEvents.deferredCalls[i];
            if (
                call.targetFunction == targetFunction &&
                arraysHaveEqualContent(call.argsList, argsList)
            ) {
                return;
            }
        }
        JSEvents.deferredCalls.push({
            targetFunction: targetFunction,
            precedence: precedence,
            argsList: argsList,
        });
        JSEvents.deferredCalls.sort(function(x, y) {
            return x.precedence < y.precedence;
        });
    },
    removeDeferredCalls: function(targetFunction) {
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
            if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
                JSEvents.deferredCalls.splice(i, 1);
                --i;
            }
        }
    },
    canPerformEventHandlerRequests: function() {
        return (
            JSEvents.inEventHandler &&
            JSEvents.currentEventHandler.allowsDeferredCalls
        );
    },
    runDeferredCalls: function() {
        if (!JSEvents.canPerformEventHandlerRequests()) {
            return;
        }
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
            var call = JSEvents.deferredCalls[i];
            JSEvents.deferredCalls.splice(i, 1);
            --i;
            call.targetFunction.apply(null, call.argsList);
        }
    },
    eventHandlers: [],
    removeAllHandlersOnTarget: function(target, eventTypeString) {
        for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
            if (
                JSEvents.eventHandlers[i].target == target &&
                (!eventTypeString ||
                    eventTypeString == JSEvents.eventHandlers[i].eventTypeString)
            ) {
                JSEvents._removeHandler(i--);
            }
        }
    },
    _removeHandler: function(i) {
        var h = JSEvents.eventHandlers[i];
        h.target.removeEventListener(
            h.eventTypeString,
            h.eventListenerFunc,
            h.useCapture
        );
        JSEvents.eventHandlers.splice(i, 1);
    },
    registerOrRemoveHandler: function(eventHandler) {
        var jsEventHandler = function jsEventHandler(event) {
            ++JSEvents.inEventHandler;
            JSEvents.currentEventHandler = eventHandler;
            JSEvents.runDeferredCalls();
            eventHandler.handlerFunc(event);
            JSEvents.runDeferredCalls();
            --JSEvents.inEventHandler;
        };
        if (eventHandler.callbackfunc) {
            eventHandler.eventListenerFunc = jsEventHandler;
            eventHandler.target.addEventListener(
                eventHandler.eventTypeString,
                jsEventHandler,
                eventHandler.useCapture
            );
            JSEvents.eventHandlers.push(eventHandler);
            JSEvents.registerRemoveEventListeners();
        } else {
            for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                if (
                    JSEvents.eventHandlers[i].target == eventHandler.target &&
                    JSEvents.eventHandlers[i].eventTypeString ==
                    eventHandler.eventTypeString
                ) {
                    JSEvents._removeHandler(i--);
                }
            }
        }
    },
    getNodeNameForTarget: function(target) {
        if (!target) return "";
        if (target == window) return "#window";
        if (target == screen) return "#screen";
        return target && target.nodeName ? target.nodeName : "";
    },
    fullscreenEnabled: function() {
        return document.fullscreenEnabled || document.webkitFullscreenEnabled;
    },
};

function setLetterbox(element, topBottom, leftRight) {
    element.style.paddingLeft = element.style.paddingRight = leftRight + "px";
    element.style.paddingTop = element.style.paddingBottom = topBottom + "px";
}

function maybeCStringToJsString(cString) {
    return cString > 2 ? UTF8ToString(cString) : cString;
}
var specialHTMLTargets = [
    0,
    typeof document != "undefined" ? document : 0,
    typeof window != "undefined" ? window : 0,
];

function findEventTarget(target) {
    target = maybeCStringToJsString(target);
    var domElement =
        specialHTMLTargets[target] ||
        (typeof document != "undefined" ?
            document.querySelector(target) :
            undefined);
    return domElement;
}

function findCanvasEventTarget(target) {
    return findEventTarget(target);
}

function _emscripten_set_canvas_element_size(target, width, height) {
    var canvas = findCanvasEventTarget(target);
    if (!canvas) return -4;
    canvas.width = width;
    canvas.height = height;
    return 0;
}

function _emscripten_get_canvas_element_size(target, width, height) {
    var canvas = findCanvasEventTarget(target);
    if (!canvas) return -4;
    HEAP32[width >> 2] = canvas.width;
    HEAP32[height >> 2] = canvas.height;
}

function getCanvasElementSize(target) {
    return withStackSave(function() {
        var w = stackAlloc(8);
        var h = w + 4;
        var targetInt = stackAlloc(target.id.length + 1);
        stringToUTF8(target.id, targetInt, target.id.length + 1);
        var ret = _emscripten_get_canvas_element_size(targetInt, w, h);
        var size = [HEAP32[w >> 2], HEAP32[h >> 2]];
        return size;
    });
}

function setCanvasElementSize(target, width, height) {
    if (!target.controlTransferredOffscreen) {
        target.width = width;
        target.height = height;
    } else {
        withStackSave(function() {
            var targetInt = stackAlloc(target.id.length + 1);
            stringToUTF8(target.id, targetInt, target.id.length + 1);
            _emscripten_set_canvas_element_size(targetInt, width, height);
        });
    }
}

function registerRestoreOldStyle(canvas) {
    var canvasSize = getCanvasElementSize(canvas);
    var oldWidth = canvasSize[0];
    var oldHeight = canvasSize[1];
    var oldCssWidth = canvas.style.width;
    var oldCssHeight = canvas.style.height;
    var oldBackgroundColor = canvas.style.backgroundColor;
    var oldDocumentBackgroundColor = document.body.style.backgroundColor;
    var oldPaddingLeft = canvas.style.paddingLeft;
    var oldPaddingRight = canvas.style.paddingRight;
    var oldPaddingTop = canvas.style.paddingTop;
    var oldPaddingBottom = canvas.style.paddingBottom;
    var oldMarginLeft = canvas.style.marginLeft;
    var oldMarginRight = canvas.style.marginRight;
    var oldMarginTop = canvas.style.marginTop;
    var oldMarginBottom = canvas.style.marginBottom;
    var oldDocumentBodyMargin = document.body.style.margin;
    var oldDocumentOverflow = document.documentElement.style.overflow;
    var oldDocumentScroll = document.body.scroll;
    var oldImageRendering = canvas.style.imageRendering;

    function restoreOldStyle() {
        var fullscreenElement =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;
        if (!fullscreenElement) {
            document.removeEventListener("fullscreenchange", restoreOldStyle);
            document.removeEventListener("webkitfullscreenchange", restoreOldStyle);
            setCanvasElementSize(canvas, oldWidth, oldHeight);
            canvas.style.width = oldCssWidth;
            canvas.style.height = oldCssHeight;
            canvas.style.backgroundColor = oldBackgroundColor;
            if (!oldDocumentBackgroundColor)
                document.body.style.backgroundColor = "white";
            document.body.style.backgroundColor = oldDocumentBackgroundColor;
            canvas.style.paddingLeft = oldPaddingLeft;
            canvas.style.paddingRight = oldPaddingRight;
            canvas.style.paddingTop = oldPaddingTop;
            canvas.style.paddingBottom = oldPaddingBottom;
            canvas.style.marginLeft = oldMarginLeft;
            canvas.style.marginRight = oldMarginRight;
            canvas.style.marginTop = oldMarginTop;
            canvas.style.marginBottom = oldMarginBottom;
            document.body.style.margin = oldDocumentBodyMargin;
            document.documentElement.style.overflow = oldDocumentOverflow;
            document.body.scroll = oldDocumentScroll;
            canvas.style.imageRendering = oldImageRendering;
            if (canvas.GLctxObject)
                canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
            if (currentFullscreenStrategy.canvasResizedCallback) {
                getWasmTableEntry(currentFullscreenStrategy.canvasResizedCallback)(
                    37,
                    0,
                    currentFullscreenStrategy.canvasResizedCallbackUserData
                );
            }
        }
    }
    document.addEventListener("fullscreenchange", restoreOldStyle);
    document.addEventListener("webkitfullscreenchange", restoreOldStyle);
    return restoreOldStyle;
}

function getBoundingClientRect(e) {
    return specialHTMLTargets.indexOf(e) < 0 ?
        e.getBoundingClientRect() :
        {
            left: 0,
            top: 0
        };
}

function JSEvents_resizeCanvasForFullscreen(target, strategy) {
    var restoreOldStyle = registerRestoreOldStyle(target);
    var cssWidth = strategy.softFullscreen ? innerWidth : screen.width;
    var cssHeight = strategy.softFullscreen ? innerHeight : screen.height;
    var rect = getBoundingClientRect(target);
    var windowedCssWidth = rect.width;
    var windowedCssHeight = rect.height;
    var canvasSize = getCanvasElementSize(target);
    var windowedRttWidth = canvasSize[0];
    var windowedRttHeight = canvasSize[1];
    if (strategy.scaleMode == 3) {
        setLetterbox(
            target,
            (cssHeight - windowedCssHeight) / 2,
            (cssWidth - windowedCssWidth) / 2
        );
        cssWidth = windowedCssWidth;
        cssHeight = windowedCssHeight;
    } else if (strategy.scaleMode == 2) {
        if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
            var desiredCssHeight = (windowedRttHeight * cssWidth) / windowedRttWidth;
            setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
            cssHeight = desiredCssHeight;
        } else {
            var desiredCssWidth = (windowedRttWidth * cssHeight) / windowedRttHeight;
            setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
            cssWidth = desiredCssWidth;
        }
    }
    if (!target.style.backgroundColor) target.style.backgroundColor = "black";
    if (!document.body.style.backgroundColor)
        document.body.style.backgroundColor = "black";
    target.style.width = cssWidth + "px";
    target.style.height = cssHeight + "px";
    if (strategy.filteringMode == 1) {
        target.style.imageRendering = "optimizeSpeed";
        target.style.imageRendering = "-moz-crisp-edges";
        target.style.imageRendering = "-o-crisp-edges";
        target.style.imageRendering = "-webkit-optimize-contrast";
        target.style.imageRendering = "optimize-contrast";
        target.style.imageRendering = "crisp-edges";
        target.style.imageRendering = "pixelated";
    }
    var dpiScale = strategy.canvasResolutionScaleMode == 2 ? devicePixelRatio : 1;
    if (strategy.canvasResolutionScaleMode != 0) {
        var newWidth = (cssWidth * dpiScale) | 0;
        var newHeight = (cssHeight * dpiScale) | 0;
        setCanvasElementSize(target, newWidth, newHeight);
        if (target.GLctxObject)
            target.GLctxObject.GLctx.viewport(0, 0, newWidth, newHeight);
    }
    return restoreOldStyle;
}

function JSEvents_requestFullscreen(target, strategy) {
    if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
        JSEvents_resizeCanvasForFullscreen(target, strategy);
    }
    if (target.requestFullscreen) {
        target.requestFullscreen();
    } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else {
        return JSEvents.fullscreenEnabled() ? -3 : -1;
    }
    currentFullscreenStrategy = strategy;
    if (strategy.canvasResizedCallback) {
        getWasmTableEntry(strategy.canvasResizedCallback)(
            37,
            0,
            strategy.canvasResizedCallbackUserData
        );
    }
    return 0;
}

function doRequestFullscreen(target, strategy) {
    if (!JSEvents.fullscreenEnabled()) return -1;
    target = findEventTarget(target);
    if (!target) return -4;
    if (!target.requestFullscreen && !target.webkitRequestFullscreen) {
        return -3;
    }
    var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
    if (!canPerformRequests) {
        if (strategy.deferUntilInEventHandler) {
            JSEvents.deferCall(JSEvents_requestFullscreen, 1, [target, strategy]);
            return 1;
        } else {
            return -2;
        }
    }
    return JSEvents_requestFullscreen(target, strategy);
}
var currentFullscreenStrategy = {};

function _emscripten_request_fullscreen_strategy(
    target,
    deferUntilInEventHandler,
    fullscreenStrategy
) {
    var strategy = {
        scaleMode: HEAP32[fullscreenStrategy >> 2],
        canvasResolutionScaleMode: HEAP32[(fullscreenStrategy + 4) >> 2],
        filteringMode: HEAP32[(fullscreenStrategy + 8) >> 2],
        deferUntilInEventHandler: deferUntilInEventHandler,
        canvasResizedCallback: HEAP32[(fullscreenStrategy + 12) >> 2],
        canvasResizedCallbackUserData: HEAP32[(fullscreenStrategy + 16) >> 2],
    };
    return doRequestFullscreen(target, strategy);
}

function getHeapMax() {
    return 2147483648;
}

function emscripten_realloc_buffer(size) {
    try {
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1;
    } catch (e) {}
}

function _emscripten_resize_heap(requestedSize) {
    var oldSize = HEAPU8.length;
    requestedSize = requestedSize >>> 0;
    var maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
        return false;
    }
    let alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(
            maxHeapSize,
            alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
        );
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
            return true;
        }
    }
    return false;
}

function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
    var browserIterationFunc = getWasmTableEntry(func);
    setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop);
}

function fillMouseEventData(eventStruct, e, target) {
    HEAPF64[eventStruct >> 3] = e.timeStamp;
    var idx = eventStruct >> 2;
    HEAP32[idx + 2] = e.screenX;
    HEAP32[idx + 3] = e.screenY;
    HEAP32[idx + 4] = e.clientX;
    HEAP32[idx + 5] = e.clientY;
    HEAP32[idx + 6] = e.ctrlKey;
    HEAP32[idx + 7] = e.shiftKey;
    HEAP32[idx + 8] = e.altKey;
    HEAP32[idx + 9] = e.metaKey;
    HEAP16[idx * 2 + 20] = e.button;
    HEAP16[idx * 2 + 21] = e.buttons;
    HEAP32[idx + 11] = e["movementX"];
    HEAP32[idx + 12] = e["movementY"];
    var rect = getBoundingClientRect(target);
    HEAP32[idx + 13] = e.clientX - rect.left;
    HEAP32[idx + 14] = e.clientY - rect.top;
}

function registerMouseEventCallback(
    target,
    userData,
    useCapture,
    callbackfunc,
    eventTypeId,
    eventTypeString,
    targetThread
) {
    if (!JSEvents.mouseEvent) JSEvents.mouseEvent = _malloc(72);
    target = findEventTarget(target);
    var mouseEventHandlerFunc = function(ev) {
        var e = ev || event;
        fillMouseEventData(JSEvents.mouseEvent, e, target);
        if (
            getWasmTableEntry(callbackfunc)(
                eventTypeId,
                JSEvents.mouseEvent,
                userData
            )
        )
            e.preventDefault();
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: eventTypeString != "mousemove" &&
            eventTypeString != "mouseenter" &&
            eventTypeString != "mouseleave",
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: mouseEventHandlerFunc,
        useCapture: useCapture,
    };
    JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_mousedown_callback_on_thread(
    target,
    userData,
    useCapture,
    callbackfunc,
    targetThread
) {
    registerMouseEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        5,
        "mousedown",
        targetThread
    );
    return 0;
}

function _emscripten_set_mousemove_callback_on_thread(
    target,
    userData,
    useCapture,
    callbackfunc,
    targetThread
) {
    registerMouseEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        8,
        "mousemove",
        targetThread
    );
    return 0;
}

function _emscripten_set_mouseup_callback_on_thread(
    target,
    userData,
    useCapture,
    callbackfunc,
    targetThread
) {
    registerMouseEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        6,
        "mouseup",
        targetThread
    );
    return 0;
}

function registerTouchEventCallback(
    target,
    userData,
    useCapture,
    callbackfunc,
    eventTypeId,
    eventTypeString,
    targetThread
) {
    if (!JSEvents.touchEvent) JSEvents.touchEvent = _malloc(1696);
    target = findEventTarget(target);
    var touchEventHandlerFunc = function(e) {
        var t,
            touches = {},
            et = e.touches;
        for (var i = 0; i < et.length; ++i) {
            t = et[i];
            t.isChanged = t.onTarget = 0;
            touches[t.identifier] = t;
        }
        for (var i = 0; i < e.changedTouches.length; ++i) {
            t = e.changedTouches[i];
            t.isChanged = 1;
            touches[t.identifier] = t;
        }
        for (var i = 0; i < e.targetTouches.length; ++i) {
            touches[e.targetTouches[i].identifier].onTarget = 1;
        }
        var touchEvent = JSEvents.touchEvent;
        HEAPF64[touchEvent >> 3] = e.timeStamp;
        var idx = touchEvent >> 2;
        HEAP32[idx + 3] = e.ctrlKey;
        HEAP32[idx + 4] = e.shiftKey;
        HEAP32[idx + 5] = e.altKey;
        HEAP32[idx + 6] = e.metaKey;
        idx += 7;
        var targetRect = getBoundingClientRect(target);
        var numTouches = 0;
        for (var i in touches) {
            t = touches[i];
            HEAP32[idx + 0] = t.identifier;
            HEAP32[idx + 1] = t.screenX;
            HEAP32[idx + 2] = t.screenY;
            HEAP32[idx + 3] = t.clientX;
            HEAP32[idx + 4] = t.clientY;
            HEAP32[idx + 5] = t.pageX;
            HEAP32[idx + 6] = t.pageY;
            HEAP32[idx + 7] = t.isChanged;
            HEAP32[idx + 8] = t.onTarget;
            HEAP32[idx + 9] = t.clientX - targetRect.left;
            HEAP32[idx + 10] = t.clientY - targetRect.top;
            idx += 13;
            if (++numTouches > 31) {
                break;
            }
        }
        HEAP32[(touchEvent + 8) >> 2] = numTouches;
        if (getWasmTableEntry(callbackfunc)(eventTypeId, touchEvent, userData))
            e.preventDefault();
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: eventTypeString == "touchstart" || eventTypeString == "touchend",
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: touchEventHandlerFunc,
        useCapture: useCapture,
    };
    JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_touchcancel_callback_on_thread(
    target,
    userData,
    useCapture,
    callbackfunc,
    targetThread
) {
    registerTouchEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        25,
        "touchcancel",
        targetThread
    );
    return 0;
}

function _emscripten_set_touchend_callback_on_thread(
    target,
    userData,
    useCapture,
    callbackfunc,
    targetThread
) {
    registerTouchEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        23,
        "touchend",
        targetThread
    );
    return 0;
}

function _emscripten_set_touchmove_callback_on_thread(
    target,
    userData,
    useCapture,
    callbackfunc,
    targetThread
) {
    registerTouchEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        24,
        "touchmove",
        targetThread
    );
    return 0;
}

function _emscripten_set_touchstart_callback_on_thread(
    target,
    userData,
    useCapture,
    callbackfunc,
    targetThread
) {
    registerTouchEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        22,
        "touchstart",
        targetThread
    );
    return 0;
}

function _fd_close(fd) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return e.errno;
    }
}

function doReadv(stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[(iov + 4) >> 2];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break;
    }
    return ret;
}

function _fd_read(fd, iov, iovcnt, pnum) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doReadv(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return e.errno;
    }
}

function convertI32PairToI53Checked(lo, hi) {
    return (hi + 2097152) >>> 0 < 4194305 - !!lo ?
        (lo >>> 0) + hi * 4294967296 :
        NaN;
}

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    try {
        var offset = convertI32PairToI53Checked(offset_low, offset_high);
        if (isNaN(offset)) return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.llseek(stream, offset, whence);
        (tempI64 = [
            stream.position >>> 0,
            ((tempDouble = stream.position), +Math.abs(tempDouble) >= 1 ?
                tempDouble > 0 ?
                (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>>
                0 :
                ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>>
                0 :
                0),
        ]),
        (HEAP32[newOffset >> 2] = tempI64[0]),
        (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return e.errno;
    }
}

function doWritev(stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[(iov + 4) >> 2];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
    }
    return ret;
}

function _fd_write(fd, iov, iovcnt, pnum) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doWritev(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return e.errno;
    }
}

function __webgl_enable_ANGLE_instanced_arrays(ctx) {
    var ext = ctx.getExtension("ANGLE_instanced_arrays");
    if (ext) {
        ctx["vertexAttribDivisor"] = function(index, divisor) {
            ext["vertexAttribDivisorANGLE"](index, divisor);
        };
        ctx["drawArraysInstanced"] = function(mode, first, count, primcount) {
            ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
        };
        ctx["drawElementsInstanced"] = function(
            mode,
            count,
            type,
            indices,
            primcount
        ) {
            ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
        };
        return 1;
    }
}

function __webgl_enable_OES_vertex_array_object(ctx) {
    var ext = ctx.getExtension("OES_vertex_array_object");
    if (ext) {
        ctx["createVertexArray"] = function() {
            return ext["createVertexArrayOES"]();
        };
        ctx["deleteVertexArray"] = function(vao) {
            ext["deleteVertexArrayOES"](vao);
        };
        ctx["bindVertexArray"] = function(vao) {
            ext["bindVertexArrayOES"](vao);
        };
        ctx["isVertexArray"] = function(vao) {
            return ext["isVertexArrayOES"](vao);
        };
        return 1;
    }
}

function __webgl_enable_WEBGL_draw_buffers(ctx) {
    var ext = ctx.getExtension("WEBGL_draw_buffers");
    if (ext) {
        ctx["drawBuffers"] = function(n, bufs) {
            ext["drawBuffersWEBGL"](n, bufs);
        };
        return 1;
    }
}

function __webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(ctx) {
    return !!(ctx.dibvbi = ctx.getExtension(
        "WEBGL_draw_instanced_base_vertex_base_instance"
    ));
}

function __webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(
    ctx
) {
    return !!(ctx.mdibvbi = ctx.getExtension(
        "WEBGL_multi_draw_instanced_base_vertex_base_instance"
    ));
}

function __webgl_enable_WEBGL_multi_draw(ctx) {
    return !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
}
var GL = {
    counter: 1,
    buffers: [],
    programs: [],
    framebuffers: [],
    renderbuffers: [],
    textures: [],
    shaders: [],
    vaos: [],
    contexts: [],
    offscreenCanvases: {},
    queries: [],
    samplers: [],
    transformFeedbacks: [],
    syncs: [],
    stringCache: {},
    stringiCache: {},
    unpackAlignment: 4,
    recordError: function recordError(errorCode) {
        if (!GL.lastError) {
            GL.lastError = errorCode;
        }
    },
    getNewId: function(table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
            table[i] = null;
        }
        return ret;
    },
    getSource: function(shader, count, string, length) {
        var source = "";
        for (var i = 0; i < count; ++i) {
            var len = length ? HEAP32[(length + i * 4) >> 2] : -1;
            source += UTF8ToString(
                HEAP32[(string + i * 4) >> 2],
                len < 0 ? undefined : len
            );
        }
        return source;
    },
    createContext: function(canvas, webGLContextAttributes) {
        if (!canvas.getContextSafariWebGL2Fixed) {
            canvas.getContextSafariWebGL2Fixed = canvas.getContext;

            function fixedGetContext(ver, attrs) {
                var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
                return (ver == "webgl") == gl instanceof WebGLRenderingContext ?
                    gl :
                    null;
            }
            canvas.getContext = fixedGetContext;
        }
        var ctx =
            webGLContextAttributes.majorVersion > 1 ?
            canvas.getContext("webgl2", webGLContextAttributes) :
            canvas.getContext("webgl", webGLContextAttributes);
        if (!ctx) return 0;
        var handle = GL.registerContext(ctx, webGLContextAttributes);
        return handle;
    },
    registerContext: function(ctx, webGLContextAttributes) {
        var handle = GL.getNewId(GL.contexts);
        var context = {
            handle: handle,
            attributes: webGLContextAttributes,
            version: webGLContextAttributes.majorVersion,
            GLctx: ctx,
        };
        if (ctx.canvas) ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (
            typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" ||
            webGLContextAttributes.enableExtensionsByDefault
        ) {
            GL.initExtensions(context);
        }
        return handle;
    },
    makeContextCurrent: function(contextHandle) {
        GL.currentContext = GL.contexts[contextHandle];
        Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
        return !(contextHandle && !GLctx);
    },
    getContext: function(contextHandle) {
        return GL.contexts[contextHandle];
    },
    deleteContext: function(contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle])
            GL.currentContext = null;
        if (typeof JSEvents == "object")
            JSEvents.removeAllHandlersOnTarget(
                GL.contexts[contextHandle].GLctx.canvas
            );
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas)
            GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
        GL.contexts[contextHandle] = null;
    },
    initExtensions: function(context) {
        if (!context) context = GL.currentContext;
        if (context.initExtensionsDone) return;
        context.initExtensionsDone = true;
        var GLctx = context.GLctx;
        __webgl_enable_ANGLE_instanced_arrays(GLctx);
        __webgl_enable_OES_vertex_array_object(GLctx);
        __webgl_enable_WEBGL_draw_buffers(GLctx);
        __webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
        __webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
        if (context.version >= 2) {
            GLctx.disjointTimerQueryExt = GLctx.getExtension(
                "EXT_disjoint_timer_query_webgl2"
            );
        }
        if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
            GLctx.disjointTimerQueryExt = GLctx.getExtension(
                "EXT_disjoint_timer_query"
            );
        }
        __webgl_enable_WEBGL_multi_draw(GLctx);
        var exts = GLctx.getSupportedExtensions() || [];
        exts.forEach(function(ext) {
            if (!ext.includes("lose_context") && !ext.includes("debug")) {
                GLctx.getExtension(ext);
            }
        });
    },
};

function _glActiveTexture(x0) {
    GLctx["activeTexture"](x0);
}

function _glAttachShader(program, shader) {
    GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}

function _glBindBuffer(target, buffer) {
    if (target == 35051) {
        GLctx.currentPixelPackBufferBinding = buffer;
    } else if (target == 35052) {
        GLctx.currentPixelUnpackBufferBinding = buffer;
    }
    GLctx.bindBuffer(target, GL.buffers[buffer]);
}

function _glBindFramebuffer(target, framebuffer) {
    GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
}

function _glBindRenderbuffer(target, renderbuffer) {
    GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
}

function _glBindTexture(target, texture) {
    GLctx.bindTexture(target, GL.textures[texture]);
}

function _glBlendFunc(x0, x1) {
    GLctx["blendFunc"](x0, x1);
}

function _glBufferData(target, size, data, usage) {
    if (GL.currentContext.version >= 2) {
        if (data && size) {
            GLctx.bufferData(target, HEAPU8, usage, data, size);
        } else {
            GLctx.bufferData(target, size, usage);
        }
    } else {
        GLctx.bufferData(
            target,
            data ? HEAPU8.subarray(data, data + size) : size,
            usage
        );
    }
}

function _glCheckFramebufferStatus(x0) {
    return GLctx["checkFramebufferStatus"](x0);
}

function _glClear(x0) {
    GLctx["clear"](x0);
}

function _glClearColor(x0, x1, x2, x3) {
    GLctx["clearColor"](x0, x1, x2, x3);
}

function _glCompileShader(shader) {
    GLctx.compileShader(GL.shaders[shader]);
}

function _glCreateProgram() {
    var id = GL.getNewId(GL.programs);
    var program = GLctx.createProgram();
    program.name = id;
    program.maxUniformLength =
        program.maxAttributeLength =
        program.maxUniformBlockNameLength =
        0;
    program.uniformIdCounter = 1;
    GL.programs[id] = program;
    return id;
}

function _glCreateShader(shaderType) {
    var id = GL.getNewId(GL.shaders);
    GL.shaders[id] = GLctx.createShader(shaderType);
    return id;
}

function _glDeleteBuffers(n, buffers) {
    for (var i = 0; i < n; i++) {
        var id = HEAP32[(buffers + i * 4) >> 2];
        var buffer = GL.buffers[id];
        if (!buffer) continue;
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null;
        if (id == GLctx.currentPixelPackBufferBinding)
            GLctx.currentPixelPackBufferBinding = 0;
        if (id == GLctx.currentPixelUnpackBufferBinding)
            GLctx.currentPixelUnpackBufferBinding = 0;
    }
}

function _glDeleteFramebuffers(n, framebuffers) {
    for (var i = 0; i < n; ++i) {
        var id = HEAP32[(framebuffers + i * 4) >> 2];
        var framebuffer = GL.framebuffers[id];
        if (!framebuffer) continue;
        GLctx.deleteFramebuffer(framebuffer);
        framebuffer.name = 0;
        GL.framebuffers[id] = null;
    }
}

function _glDeleteRenderbuffers(n, renderbuffers) {
    for (var i = 0; i < n; i++) {
        var id = HEAP32[(renderbuffers + i * 4) >> 2];
        var renderbuffer = GL.renderbuffers[id];
        if (!renderbuffer) continue;
        GLctx.deleteRenderbuffer(renderbuffer);
        renderbuffer.name = 0;
        GL.renderbuffers[id] = null;
    }
}

function _glDeleteTextures(n, textures) {
    for (var i = 0; i < n; i++) {
        var id = HEAP32[(textures + i * 4) >> 2];
        var texture = GL.textures[id];
        if (!texture) continue;
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
    }
}

function _glDepthFunc(x0) {
    GLctx["depthFunc"](x0);
}

function _glDepthMask(flag) {
    GLctx.depthMask(!!flag);
}

function _glDisable(x0) {
    GLctx["disable"](x0);
}

function _glDisableVertexAttribArray(index) {
    GLctx.disableVertexAttribArray(index);
}

function _glDrawArrays(mode, first, count) {
    GLctx.drawArrays(mode, first, count);
}

function _glEnable(x0) {
    GLctx["enable"](x0);
}

function _glEnableVertexAttribArray(index) {
    GLctx.enableVertexAttribArray(index);
}

function _glFramebufferRenderbuffer(
    target,
    attachment,
    renderbuffertarget,
    renderbuffer
) {
    GLctx.framebufferRenderbuffer(
        target,
        attachment,
        renderbuffertarget,
        GL.renderbuffers[renderbuffer]
    );
}

function _glFramebufferTexture2D(
    target,
    attachment,
    textarget,
    texture,
    level
) {
    GLctx.framebufferTexture2D(
        target,
        attachment,
        textarget,
        GL.textures[texture],
        level
    );
}

function __glGenObject(n, buffers, createFunction, objectTable) {
    for (var i = 0; i < n; i++) {
        var buffer = GLctx[createFunction]();
        var id = buffer && GL.getNewId(objectTable);
        if (buffer) {
            buffer.name = id;
            objectTable[id] = buffer;
        } else {
            GL.recordError(1282);
        }
        HEAP32[(buffers + i * 4) >> 2] = id;
    }
}

function _glGenBuffers(n, buffers) {
    __glGenObject(n, buffers, "createBuffer", GL.buffers);
}

function _glGenFramebuffers(n, ids) {
    __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
}

function _glGenRenderbuffers(n, renderbuffers) {
    __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
}

function _glGenTextures(n, textures) {
    __glGenObject(n, textures, "createTexture", GL.textures);
}

function _glGetAttribLocation(program, name) {
    return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
}

function writeI53ToI64(ptr, num) {
    HEAPU32[ptr >> 2] = num;
    HEAPU32[(ptr + 4) >> 2] = (num - HEAPU32[ptr >> 2]) / 4294967296;
}

function emscriptenWebGLGet(name_, p, type) {
    if (!p) {
        GL.recordError(1281);
        return;
    }
    var ret = undefined;
    switch (name_) {
        case 36346:
            ret = 1;
            break;
        case 36344:
            if (type != 0 && type != 1) {
                GL.recordError(1280);
            }
            return;
        case 34814:
        case 36345:
            ret = 0;
            break;
        case 34466:
            var formats = GLctx.getParameter(34467);
            ret = formats ? formats.length : 0;
            break;
        case 33309:
            if (GL.currentContext.version < 2) {
                GL.recordError(1282);
                return;
            }
            var exts = GLctx.getSupportedExtensions() || [];
            ret = 2 * exts.length;
            break;
        case 33307:
        case 33308:
            if (GL.currentContext.version < 2) {
                GL.recordError(1280);
                return;
            }
            ret = name_ == 33307 ? 3 : 0;
            break;
    }
    if (ret === undefined) {
        var result = GLctx.getParameter(name_);
        switch (typeof result) {
            case "number":
                ret = result;
                break;
            case "boolean":
                ret = result ? 1 : 0;
                break;
            case "string":
                GL.recordError(1280);
                return;
            case "object":
                if (result === null) {
                    switch (name_) {
                        case 34964:
                        case 35725:
                        case 34965:
                        case 36006:
                        case 36007:
                        case 32873:
                        case 34229:
                        case 36662:
                        case 36663:
                        case 35053:
                        case 35055:
                        case 36010:
                        case 35097:
                        case 35869:
                        case 32874:
                        case 36389:
                        case 35983:
                        case 35368:
                        case 34068:
                            {
                                ret = 0;
                                break;
                            }
                        default:
                            {
                                GL.recordError(1280);
                                return;
                            }
                    }
                } else if (
                    result instanceof Float32Array ||
                    result instanceof Uint32Array ||
                    result instanceof Int32Array ||
                    result instanceof Array
                ) {
                    for (var i = 0; i < result.length; ++i) {
                        switch (type) {
                            case 0:
                                HEAP32[(p + i * 4) >> 2] = result[i];
                                break;
                            case 2:
                                HEAPF32[(p + i * 4) >> 2] = result[i];
                                break;
                            case 4:
                                HEAP8[(p + i) >> 0] = result[i] ? 1 : 0;
                                break;
                        }
                    }
                    return;
                } else {
                    try {
                        ret = result.name | 0;
                    } catch (e) {
                        GL.recordError(1280);
                        err(
                            "GL_INVALID_ENUM in glGet" +
                            type +
                            "v: Unknown object returned from WebGL getParameter(" +
                            name_ +
                            ")! (error: " +
                            e +
                            ")"
                        );
                        return;
                    }
                }
                break;
            default:
                GL.recordError(1280);
                err(
                    "GL_INVALID_ENUM in glGet" +
                    type +
                    "v: Native code calling glGet" +
                    type +
                    "v(" +
                    name_ +
                    ") and it returns " +
                    result +
                    " of type " +
                    typeof result +
                    "!"
                );
                return;
        }
    }
    switch (type) {
        case 1:
            writeI53ToI64(p, ret);
            break;
        case 0:
            HEAP32[p >> 2] = ret;
            break;
        case 2:
            HEAPF32[p >> 2] = ret;
            break;
        case 4:
            HEAP8[p >> 0] = ret ? 1 : 0;
            break;
    }
}

function _glGetIntegerv(name_, p) {
    emscriptenWebGLGet(name_, p, 0);
}

function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
    var log = GLctx.getProgramInfoLog(GL.programs[program]);
    if (log === null) log = "(unknown error)";
    var numBytesWrittenExclNull =
        maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
    if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

function _glGetProgramiv(program, pname, p) {
    if (!p) {
        GL.recordError(1281);
        return;
    }
    if (program >= GL.counter) {
        GL.recordError(1281);
        return;
    }
    program = GL.programs[program];
    if (pname == 35716) {
        var log = GLctx.getProgramInfoLog(program);
        if (log === null) log = "(unknown error)";
        HEAP32[p >> 2] = log.length + 1;
    } else if (pname == 35719) {
        if (!program.maxUniformLength) {
            for (var i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
                program.maxUniformLength = Math.max(
                    program.maxUniformLength,
                    GLctx.getActiveUniform(program, i).name.length + 1
                );
            }
        }
        HEAP32[p >> 2] = program.maxUniformLength;
    } else if (pname == 35722) {
        if (!program.maxAttributeLength) {
            for (var i = 0; i < GLctx.getProgramParameter(program, 35721); ++i) {
                program.maxAttributeLength = Math.max(
                    program.maxAttributeLength,
                    GLctx.getActiveAttrib(program, i).name.length + 1
                );
            }
        }
        HEAP32[p >> 2] = program.maxAttributeLength;
    } else if (pname == 35381) {
        if (!program.maxUniformBlockNameLength) {
            for (var i = 0; i < GLctx.getProgramParameter(program, 35382); ++i) {
                program.maxUniformBlockNameLength = Math.max(
                    program.maxUniformBlockNameLength,
                    GLctx.getActiveUniformBlockName(program, i).length + 1
                );
            }
        }
        HEAP32[p >> 2] = program.maxUniformBlockNameLength;
    } else {
        HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname);
    }
}

function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
    var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
    if (log === null) log = "(unknown error)";
    var numBytesWrittenExclNull =
        maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
    if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

function _glGetShaderiv(shader, pname, p) {
    if (!p) {
        GL.recordError(1281);
        return;
    }
    if (pname == 35716) {
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null) log = "(unknown error)";
        var logLength = log ? log.length + 1 : 0;
        HEAP32[p >> 2] = logLength;
    } else if (pname == 35720) {
        var source = GLctx.getShaderSource(GL.shaders[shader]);
        var sourceLength = source ? source.length + 1 : 0;
        HEAP32[p >> 2] = sourceLength;
    } else {
        HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
    }
}

function jstoi_q(str) {
    return parseInt(str);
}

function webglGetLeftBracePos(name) {
    return name.slice(-1) == "]" && name.lastIndexOf("[");
}

function webglPrepareUniformLocationsBeforeFirstUse(program) {
    var uniformLocsById = program.uniformLocsById,
        uniformSizeAndIdsByName = program.uniformSizeAndIdsByName,
        i,
        j;
    if (!uniformLocsById) {
        program.uniformLocsById = uniformLocsById = {};
        program.uniformArrayNamesById = {};
        for (i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
            var u = GLctx.getActiveUniform(program, i);
            var nm = u.name;
            var sz = u.size;
            var lb = webglGetLeftBracePos(nm);
            var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
            var id = program.uniformIdCounter;
            program.uniformIdCounter += sz;
            uniformSizeAndIdsByName[arrayName] = [sz, id];
            for (j = 0; j < sz; ++j) {
                uniformLocsById[id] = j;
                program.uniformArrayNamesById[id++] = arrayName;
            }
        }
    }
}

function _glGetUniformLocation(program, name) {
    name = UTF8ToString(name);
    if ((program = GL.programs[program])) {
        webglPrepareUniformLocationsBeforeFirstUse(program);
        var uniformLocsById = program.uniformLocsById;
        var arrayIndex = 0;
        var uniformBaseName = name;
        var leftBrace = webglGetLeftBracePos(name);
        if (leftBrace > 0) {
            arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
            uniformBaseName = name.slice(0, leftBrace);
        }
        var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
        if (sizeAndId && arrayIndex < sizeAndId[0]) {
            arrayIndex += sizeAndId[1];
            if (
                (uniformLocsById[arrayIndex] =
                    uniformLocsById[arrayIndex] ||
                    GLctx.getUniformLocation(program, name))
            ) {
                return arrayIndex;
            }
        }
    } else {
        GL.recordError(1281);
    }
    return -1;
}

function _glLinkProgram(program) {
    program = GL.programs[program];
    GLctx.linkProgram(program);
    program.uniformLocsById = 0;
    program.uniformSizeAndIdsByName = {};
}

function computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
    function roundedToNextMultipleOf(x, y) {
        return (x + y - 1) & -y;
    }
    var plainRowSize = width * sizePerPixel;
    var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
    return height * alignedRowSize;
}

function __colorChannelsInGlTextureFormat(format) {
    var colorChannels = {
        5: 3,
        6: 4,
        8: 2,
        29502: 3,
        29504: 4,
        26917: 2,
        26918: 2,
        29846: 3,
        29847: 4,
    };
    return colorChannels[format - 6402] || 1;
}

function heapObjectForWebGLType(type) {
    type -= 5120;
    if (type == 0) return HEAP8;
    if (type == 1) return HEAPU8;
    if (type == 2) return HEAP16;
    if (type == 4) return HEAP32;
    if (type == 6) return HEAPF32;
    if (
        type == 5 ||
        type == 28922 ||
        type == 28520 ||
        type == 30779 ||
        type == 30782
    )
        return HEAPU32;
    return HEAPU16;
}

function heapAccessShiftForWebGLHeap(heap) {
    return 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
}

function emscriptenWebGLGetTexPixelData(
    type,
    format,
    width,
    height,
    pixels,
    internalFormat
) {
    var heap = heapObjectForWebGLType(type);
    var shift = heapAccessShiftForWebGLHeap(heap);
    var byteSize = 1 << shift;
    var sizePerPixel = __colorChannelsInGlTextureFormat(format) * byteSize;
    var bytes = computeUnpackAlignedImageSize(
        width,
        height,
        sizePerPixel,
        GL.unpackAlignment
    );
    return heap.subarray(pixels >> shift, (pixels + bytes) >> shift);
}

function _glReadPixels(x, y, width, height, format, type, pixels) {
    if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelPackBufferBinding) {
            GLctx.readPixels(x, y, width, height, format, type, pixels);
        } else {
            var heap = heapObjectForWebGLType(type);
            GLctx.readPixels(
                x,
                y,
                width,
                height,
                format,
                type,
                heap,
                pixels >> heapAccessShiftForWebGLHeap(heap)
            );
        }
        return;
    }
    var pixelData = emscriptenWebGLGetTexPixelData(
        type,
        format,
        width,
        height,
        pixels,
        format
    );
    if (!pixelData) {
        GL.recordError(1280);
        return;
    }
    GLctx.readPixels(x, y, width, height, format, type, pixelData);
}

function _glRenderbufferStorage(x0, x1, x2, x3) {
    GLctx["renderbufferStorage"](x0, x1, x2, x3);
}

function _glShaderSource(shader, count, string, length) {
    var source = GL.getSource(shader, count, string, length);
    GLctx.shaderSource(GL.shaders[shader], source);
}

function _glTexImage2D(
    target,
    level,
    internalFormat,
    width,
    height,
    border,
    format,
    type,
    pixels
) {
    if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelUnpackBufferBinding) {
            GLctx.texImage2D(
                target,
                level,
                internalFormat,
                width,
                height,
                border,
                format,
                type,
                pixels
            );
        } else if (pixels) {
            var heap = heapObjectForWebGLType(type);
            GLctx.texImage2D(
                target,
                level,
                internalFormat,
                width,
                height,
                border,
                format,
                type,
                heap,
                pixels >> heapAccessShiftForWebGLHeap(heap)
            );
        } else {
            GLctx.texImage2D(
                target,
                level,
                internalFormat,
                width,
                height,
                border,
                format,
                type,
                null
            );
        }
        return;
    }
    GLctx.texImage2D(
        target,
        level,
        internalFormat,
        width,
        height,
        border,
        format,
        type,
        pixels ?
        emscriptenWebGLGetTexPixelData(
            type,
            format,
            width,
            height,
            pixels,
            internalFormat
        ) :
        null
    );
}

function _glTexParameterf(x0, x1, x2) {
    GLctx["texParameterf"](x0, x1, x2);
}

function _glTexParameteri(x0, x1, x2) {
    GLctx["texParameteri"](x0, x1, x2);
}

function _glTexSubImage2D(
    target,
    level,
    xoffset,
    yoffset,
    width,
    height,
    format,
    type,
    pixels
) {
    if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelUnpackBufferBinding) {
            GLctx.texSubImage2D(
                target,
                level,
                xoffset,
                yoffset,
                width,
                height,
                format,
                type,
                pixels
            );
        } else if (pixels) {
            var heap = heapObjectForWebGLType(type);
            GLctx.texSubImage2D(
                target,
                level,
                xoffset,
                yoffset,
                width,
                height,
                format,
                type,
                heap,
                pixels >> heapAccessShiftForWebGLHeap(heap)
            );
        } else {
            GLctx.texSubImage2D(
                target,
                level,
                xoffset,
                yoffset,
                width,
                height,
                format,
                type,
                null
            );
        }
        return;
    }
    var pixelData = null;
    if (pixels)
        pixelData = emscriptenWebGLGetTexPixelData(
            type,
            format,
            width,
            height,
            pixels,
            0
        );
    GLctx.texSubImage2D(
        target,
        level,
        xoffset,
        yoffset,
        width,
        height,
        format,
        type,
        pixelData
    );
}

function webglGetUniformLocation(location) {
    var p = GLctx.currentProgram;
    if (p) {
        var webglLoc = p.uniformLocsById[location];
        if (typeof webglLoc == "number") {
            p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(
                p,
                p.uniformArrayNamesById[location] +
                (webglLoc > 0 ? "[" + webglLoc + "]" : "")
            );
        }
        return webglLoc;
    } else {
        GL.recordError(1282);
    }
}

function _glUniform1f(location, v0) {
    GLctx.uniform1f(webglGetUniformLocation(location), v0);
}

function _glUniform1i(location, v0) {
    GLctx.uniform1i(webglGetUniformLocation(location), v0);
}

function _glUniform2f(location, v0, v1) {
    GLctx.uniform2f(webglGetUniformLocation(location), v0, v1);
}
var miniTempWebGLFloatBuffers = [];

function _glUniform3fv(location, count, value) {
    if (GL.currentContext.version >= 2) {
        count &&
            GLctx.uniform3fv(
                webglGetUniformLocation(location),
                HEAPF32,
                value >> 2,
                count * 3
            );
        return;
    }
    if (count <= 96) {
        var view = miniTempWebGLFloatBuffers[3 * count - 1];
        for (var i = 0; i < 3 * count; i += 3) {
            view[i] = HEAPF32[(value + 4 * i) >> 2];
            view[i + 1] = HEAPF32[(value + (4 * i + 4)) >> 2];
            view[i + 2] = HEAPF32[(value + (4 * i + 8)) >> 2];
        }
    } else {
        var view = HEAPF32.subarray(value >> 2, (value + count * 12) >> 2);
    }
    GLctx.uniform3fv(webglGetUniformLocation(location), view);
}

function _glUniformMatrix4fv(location, count, transpose, value) {
    if (GL.currentContext.version >= 2) {
        count &&
            GLctx.uniformMatrix4fv(
                webglGetUniformLocation(location), !!transpose,
                HEAPF32,
                value >> 2,
                count * 16
            );
        return;
    }
    if (count <= 18) {
        var view = miniTempWebGLFloatBuffers[16 * count - 1];
        var heap = HEAPF32;
        value >>= 2;
        for (var i = 0; i < 16 * count; i += 16) {
            var dst = value + i;
            view[i] = heap[dst];
            view[i + 1] = heap[dst + 1];
            view[i + 2] = heap[dst + 2];
            view[i + 3] = heap[dst + 3];
            view[i + 4] = heap[dst + 4];
            view[i + 5] = heap[dst + 5];
            view[i + 6] = heap[dst + 6];
            view[i + 7] = heap[dst + 7];
            view[i + 8] = heap[dst + 8];
            view[i + 9] = heap[dst + 9];
            view[i + 10] = heap[dst + 10];
            view[i + 11] = heap[dst + 11];
            view[i + 12] = heap[dst + 12];
            view[i + 13] = heap[dst + 13];
            view[i + 14] = heap[dst + 14];
            view[i + 15] = heap[dst + 15];
        }
    } else {
        var view = HEAPF32.subarray(value >> 2, (value + count * 64) >> 2);
    }
    GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view);
}

function _glUseProgram(program) {
    program = GL.programs[program];
    GLctx.useProgram(program);
    GLctx.currentProgram = program;
}

function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
    GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}

function _glViewport(x0, x1, x2, x3) {
    GLctx["viewport"](x0, x1, x2, x3);
}

function GLFW_Window(id, width, height, title, monitor, share) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.fullscreen = false;
    this.storedX = 0;
    this.storedY = 0;
    this.width = width;
    this.height = height;
    this.storedWidth = width;
    this.storedHeight = height;
    this.title = title;
    this.monitor = monitor;
    this.share = share;
    this.attributes = GLFW.hints;
    this.inputModes = {
        208897: 212993,
        208898: 0,
        208899: 0
    };
    this.buttons = 0;
    this.keys = new Array();
    this.domKeys = new Array();
    this.shouldClose = 0;
    this.title = null;
    this.windowPosFunc = null;
    this.windowSizeFunc = null;
    this.windowCloseFunc = null;
    this.windowRefreshFunc = null;
    this.windowFocusFunc = null;
    this.windowIconifyFunc = null;
    this.framebufferSizeFunc = null;
    this.mouseButtonFunc = null;
    this.cursorPosFunc = null;
    this.cursorEnterFunc = null;
    this.scrollFunc = null;
    this.dropFunc = null;
    this.keyFunc = null;
    this.charFunc = null;
    this.userptr = null;
}
var GLFW = {
    WindowFromId: function(id) {
        if (id <= 0 || !GLFW.windows) return null;
        return GLFW.windows[id - 1];
    },
    joystickFunc: null,
    errorFunc: null,
    monitorFunc: null,
    active: null,
    windows: null,
    monitors: null,
    monitorString: null,
    versionString: null,
    initialTime: null,
    extensions: null,
    hints: null,
    defaultHints: {
        131073: 0,
        131074: 0,
        131075: 1,
        131076: 1,
        131077: 1,
        135169: 8,
        135170: 8,
        135171: 8,
        135172: 8,
        135173: 24,
        135174: 8,
        135175: 0,
        135176: 0,
        135177: 0,
        135178: 0,
        135179: 0,
        135180: 0,
        135181: 0,
        135182: 0,
        135183: 0,
        139265: 196609,
        139266: 1,
        139267: 0,
        139268: 0,
        139269: 0,
        139270: 0,
        139271: 0,
        139272: 0,
    },
    DOMToGLFWKeyCode: function(keycode) {
        switch (keycode) {
            case 32:
                return 32;
            case 222:
                return 39;
            case 188:
                return 44;
            case 173:
                return 45;
            case 189:
                return 45;
            case 190:
                return 46;
            case 191:
                return 47;
            case 48:
                return 48;
            case 49:
                return 49;
            case 50:
                return 50;
            case 51:
                return 51;
            case 52:
                return 52;
            case 53:
                return 53;
            case 54:
                return 54;
            case 55:
                return 55;
            case 56:
                return 56;
            case 57:
                return 57;
            case 59:
                return 59;
            case 61:
                return 61;
            case 187:
                return 61;
            case 65:
                return 65;
            case 66:
                return 66;
            case 67:
                return 67;
            case 68:
                return 68;
            case 69:
                return 69;
            case 70:
                return 70;
            case 71:
                return 71;
            case 72:
                return 72;
            case 73:
                return 73;
            case 74:
                return 74;
            case 75:
                return 75;
            case 76:
                return 76;
            case 77:
                return 77;
            case 78:
                return 78;
            case 79:
                return 79;
            case 80:
                return 80;
            case 81:
                return 81;
            case 82:
                return 82;
            case 83:
                return 83;
            case 84:
                return 84;
            case 85:
                return 85;
            case 86:
                return 86;
            case 87:
                return 87;
            case 88:
                return 88;
            case 89:
                return 89;
            case 90:
                return 90;
            case 219:
                return 91;
            case 220:
                return 92;
            case 221:
                return 93;
            case 192:
                return 96;
            case 27:
                return 256;
            case 13:
                return 257;
            case 9:
                return 258;
            case 8:
                return 259;
            case 45:
                return 260;
            case 46:
                return 261;
            case 39:
                return 262;
            case 37:
                return 263;
            case 40:
                return 264;
            case 38:
                return 265;
            case 33:
                return 266;
            case 34:
                return 267;
            case 36:
                return 268;
            case 35:
                return 269;
            case 20:
                return 280;
            case 145:
                return 281;
            case 144:
                return 282;
            case 44:
                return 283;
            case 19:
                return 284;
            case 112:
                return 290;
            case 113:
                return 291;
            case 114:
                return 292;
            case 115:
                return 293;
            case 116:
                return 294;
            case 117:
                return 295;
            case 118:
                return 296;
            case 119:
                return 297;
            case 120:
                return 298;
            case 121:
                return 299;
            case 122:
                return 300;
            case 123:
                return 301;
            case 124:
                return 302;
            case 125:
                return 303;
            case 126:
                return 304;
            case 127:
                return 305;
            case 128:
                return 306;
            case 129:
                return 307;
            case 130:
                return 308;
            case 131:
                return 309;
            case 132:
                return 310;
            case 133:
                return 311;
            case 134:
                return 312;
            case 135:
                return 313;
            case 136:
                return 314;
            case 96:
                return 320;
            case 97:
                return 321;
            case 98:
                return 322;
            case 99:
                return 323;
            case 100:
                return 324;
            case 101:
                return 325;
            case 102:
                return 326;
            case 103:
                return 327;
            case 104:
                return 328;
            case 105:
                return 329;
            case 110:
                return 330;
            case 111:
                return 331;
            case 106:
                return 332;
            case 109:
                return 333;
            case 107:
                return 334;
            case 16:
                return 340;
            case 17:
                return 341;
            case 18:
                return 342;
            case 91:
                return 343;
            case 93:
                return 348;
            default:
                return -1;
        }
    },
    getModBits: function(win) {
        var mod = 0;
        if (win.keys[340]) mod |= 1;
        if (win.keys[341]) mod |= 2;
        if (win.keys[342]) mod |= 4;
        if (win.keys[343]) mod |= 8;
        return mod;
    },
    onKeyPress: function(event) {
        if (!GLFW.active || !GLFW.active.charFunc) return;
        if (event.ctrlKey || event.metaKey) return;
        var charCode = event.charCode;
        if (charCode == 0 || (charCode >= 0 && charCode <= 31)) return;
        getWasmTableEntry(GLFW.active.charFunc)(GLFW.active.id, charCode);
    },
    onKeyChanged: function(keyCode, status) {
        if (!GLFW.active) return;
        var key = GLFW.DOMToGLFWKeyCode(keyCode);
        if (key == -1) return;
        var repeat = status && GLFW.active.keys[key];
        GLFW.active.keys[key] = status;
        GLFW.active.domKeys[keyCode] = status;
        if (!GLFW.active.keyFunc) return;
        if (repeat) status = 2;
        getWasmTableEntry(GLFW.active.keyFunc)(
            GLFW.active.id,
            key,
            keyCode,
            status,
            GLFW.getModBits(GLFW.active)
        );
    },
    onGamepadConnected: function(event) {
        GLFW.refreshJoysticks();
    },
    onGamepadDisconnected: function(event) {
        GLFW.refreshJoysticks();
    },
    onKeydown: function(event) {
        GLFW.onKeyChanged(event.keyCode, 1);
        if (event.keyCode === 8 || event.keyCode === 9) {
            event.preventDefault();
        }
    },
    onKeyup: function(event) {
        GLFW.onKeyChanged(event.keyCode, 0);
    },
    onBlur: function(event) {
        if (!GLFW.active) return;
        for (var i = 0; i < GLFW.active.domKeys.length; ++i) {
            if (GLFW.active.domKeys[i]) {
                GLFW.onKeyChanged(i, 0);
            }
        }
    },
    onMousemove: function(event) {
        if (!GLFW.active) return;
        Browser.calculateMouseEvent(event);
        if (event.target != Module["canvas"] || !GLFW.active.cursorPosFunc) return;
        getWasmTableEntry(GLFW.active.cursorPosFunc)(
            GLFW.active.id,
            Browser.mouseX,
            Browser.mouseY
        );
    },
    DOMToGLFWMouseButton: function(event) {
        var eventButton = event["button"];
        if (eventButton > 0) {
            if (eventButton == 1) {
                eventButton = 2;
            } else {
                eventButton = 1;
            }
        }
        return eventButton;
    },
    onMouseenter: function(event) {
        if (!GLFW.active) return;
        if (event.target != Module["canvas"] || !GLFW.active.cursorEnterFunc)
            return;
        getWasmTableEntry(GLFW.active.cursorEnterFunc)(GLFW.active.id, 1);
    },
    onMouseleave: function(event) {
        if (!GLFW.active) return;
        if (event.target != Module["canvas"] || !GLFW.active.cursorEnterFunc)
            return;
        getWasmTableEntry(GLFW.active.cursorEnterFunc)(GLFW.active.id, 0);
    },
    onMouseButtonChanged: function(event, status) {
        if (!GLFW.active) return;
        Browser.calculateMouseEvent(event);
        if (event.target != Module["canvas"]) return;
        var eventButton = GLFW.DOMToGLFWMouseButton(event);
        if (status == 1) {
            GLFW.active.buttons |= 1 << eventButton;
            try {
                event.target.setCapture();
            } catch (e) {}
        } else {
            GLFW.active.buttons &= ~(1 << eventButton);
        }
        if (!GLFW.active.mouseButtonFunc) return;
        getWasmTableEntry(GLFW.active.mouseButtonFunc)(
            GLFW.active.id,
            eventButton,
            status,
            GLFW.getModBits(GLFW.active)
        );
    },
    onMouseButtonDown: function(event) {
        if (!GLFW.active) return;
        GLFW.onMouseButtonChanged(event, 1);
    },
    onMouseButtonUp: function(event) {
        if (!GLFW.active) return;
        GLFW.onMouseButtonChanged(event, 0);
    },
    onMouseWheel: function(event) {
        var delta = -Browser.getMouseWheelDelta(event);
        delta =
            delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
        GLFW.wheelPos += delta;
        if (!GLFW.active ||
            !GLFW.active.scrollFunc ||
            event.target != Module["canvas"]
        )
            return;
        var sx = 0;
        var sy = delta;
        if (event.type == "mousewheel") {
            sx = event.wheelDeltaX;
        } else {
            sx = event.deltaX;
        }
        getWasmTableEntry(GLFW.active.scrollFunc)(GLFW.active.id, sx, sy);
        event.preventDefault();
    },
    onCanvasResize: function(width, height) {
        if (!GLFW.active) return;
        var resizeNeeded = true;
        if (
            document["fullscreen"] ||
            document["fullScreen"] ||
            document["mozFullScreen"] ||
            document["webkitIsFullScreen"]
        ) {
            GLFW.active.storedX = GLFW.active.x;
            GLFW.active.storedY = GLFW.active.y;
            GLFW.active.storedWidth = GLFW.active.width;
            GLFW.active.storedHeight = GLFW.active.height;
            GLFW.active.x = GLFW.active.y = 0;
            GLFW.active.width = screen.width;
            GLFW.active.height = screen.height;
            GLFW.active.fullscreen = true;
        } else if (GLFW.active.fullscreen == true) {
            GLFW.active.x = GLFW.active.storedX;
            GLFW.active.y = GLFW.active.storedY;
            GLFW.active.width = GLFW.active.storedWidth;
            GLFW.active.height = GLFW.active.storedHeight;
            GLFW.active.fullscreen = false;
        } else if (GLFW.active.width != width || GLFW.active.height != height) {
            GLFW.active.width = width;
            GLFW.active.height = height;
        } else {
            resizeNeeded = false;
        }
        if (resizeNeeded) {
            Browser.setCanvasSize(GLFW.active.width, GLFW.active.height, true);
            GLFW.onWindowSizeChanged();
            GLFW.onFramebufferSizeChanged();
        }
    },
    onWindowSizeChanged: function() {
        if (!GLFW.active) return;
        if (!GLFW.active.windowSizeFunc) return;
        callUserCallback(function() {
            getWasmTableEntry(GLFW.active.windowSizeFunc)(
                GLFW.active.id,
                GLFW.active.width,
                GLFW.active.height
            );
        });
    },
    onFramebufferSizeChanged: function() {
        if (!GLFW.active) return;
        if (!GLFW.active.framebufferSizeFunc) return;
        callUserCallback(function() {
            getWasmTableEntry(GLFW.active.framebufferSizeFunc)(
                GLFW.active.id,
                GLFW.active.width,
                GLFW.active.height
            );
        });
    },
    getTime: function() {
        return _emscripten_get_now() / 1e3;
    },
    setWindowTitle: function(winid, title) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.title = UTF8ToString(title);
        if (GLFW.active.id == win.id) {
            document.title = win.title;
        }
    },
    setJoystickCallback: function(cbfun) {
        GLFW.joystickFunc = cbfun;
        GLFW.refreshJoysticks();
    },
    joys: {},
    lastGamepadState: [],
    lastGamepadStateFrame: null,
    refreshJoysticks: function() {
        if (
            Browser.mainLoop.currentFrameNumber !== GLFW.lastGamepadStateFrame ||
            !Browser.mainLoop.currentFrameNumber
        ) {
            GLFW.lastGamepadState = navigator.getGamepads ?
                navigator.getGamepads() :
                navigator.webkitGetGamepads ?
                navigator.webkitGetGamepads :
                [];
            GLFW.lastGamepadStateFrame = Browser.mainLoop.currentFrameNumber;
            for (var joy = 0; joy < GLFW.lastGamepadState.length; ++joy) {
                var gamepad = GLFW.lastGamepadState[joy];
                if (gamepad) {
                    if (!GLFW.joys[joy]) {
                        out("glfw joystick connected:", joy);
                        GLFW.joys[joy] = {
                            id: allocateUTF8(gamepad.id),
                            buttonsCount: gamepad.buttons.length,
                            axesCount: gamepad.axes.length,
                            buttons: _malloc(gamepad.buttons.length),
                            axes: _malloc(gamepad.axes.length * 4),
                        };
                        if (GLFW.joystickFunc) {
                            getWasmTableEntry(GLFW.joystickFunc)(joy, 262145);
                        }
                    }
                    var data = GLFW.joys[joy];
                    for (var i = 0; i < gamepad.buttons.length; ++i) {
                        HEAP8[(data.buttons + i) >> 0] = gamepad.buttons[i].pressed;
                    }
                    for (var i = 0; i < gamepad.axes.length; ++i) {
                        HEAPF32[(data.axes + i * 4) >> 2] = gamepad.axes[i];
                    }
                } else {
                    if (GLFW.joys[joy]) {
                        out("glfw joystick disconnected", joy);
                        if (GLFW.joystickFunc) {
                            getWasmTableEntry(GLFW.joystickFunc)(joy, 262146);
                        }
                        _free(GLFW.joys[joy].id);
                        _free(GLFW.joys[joy].buttons);
                        _free(GLFW.joys[joy].axes);
                        delete GLFW.joys[joy];
                    }
                }
            }
        }
    },
    setKeyCallback: function(winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.keyFunc;
        win.keyFunc = cbfun;
        return prevcbfun;
    },
    setCharCallback: function(winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.charFunc;
        win.charFunc = cbfun;
        return prevcbfun;
    },
    setMouseButtonCallback: function(winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.mouseButtonFunc;
        win.mouseButtonFunc = cbfun;
        return prevcbfun;
    },
    setCursorPosCallback: function(winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.cursorPosFunc;
        win.cursorPosFunc = cbfun;
        return prevcbfun;
    },
    setScrollCallback: function(winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.scrollFunc;
        win.scrollFunc = cbfun;
        return prevcbfun;
    },
    setDropCallback: function(winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.dropFunc;
        win.dropFunc = cbfun;
        return prevcbfun;
    },
    onDrop: function(event) {
        if (!GLFW.active || !GLFW.active.dropFunc) return;
        if (!event.dataTransfer ||
            !event.dataTransfer.files ||
            event.dataTransfer.files.length == 0
        )
            return;
        event.preventDefault();
        var filenames = _malloc(event.dataTransfer.files.length * 4);
        var filenamesArray = [];
        var count = event.dataTransfer.files.length;
        var written = 0;
        var drop_dir = ".glfw_dropped_files";
        FS.createPath("/", drop_dir);

        function save(file) {
            var path = "/" + drop_dir + "/" + file.name.replace(/\//g, "_");
            var reader = new FileReader();
            reader.onloadend = (e) => {
                if (reader.readyState != 2) {
                    ++written;
                    out(
                        "failed to read dropped file: " + file.name + ": " + reader.error
                    );
                    return;
                }
                var data = e.target.result;
                FS.writeFile(path, new Uint8Array(data));
                if (++written === count) {
                    getWasmTableEntry(GLFW.active.dropFunc)(
                        GLFW.active.id,
                        count,
                        filenames
                    );
                    for (var i = 0; i < filenamesArray.length; ++i) {
                        _free(filenamesArray[i]);
                    }
                    _free(filenames);
                }
            };
            reader.readAsArrayBuffer(file);
            var filename = allocateUTF8(path);
            filenamesArray.push(filename);
            HEAPU32[(filenames + i * 4) >> 2] = filename;
        }
        for (var i = 0; i < count; ++i) {
            save(event.dataTransfer.files[i]);
        }
        return false;
    },
    onDragover: function(event) {
        if (!GLFW.active || !GLFW.active.dropFunc) return;
        event.preventDefault();
        return false;
    },
    setWindowSizeCallback: function(winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.windowSizeFunc;
        win.windowSizeFunc = cbfun;
        return prevcbfun;
    },
    setWindowCloseCallback: function(winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.windowCloseFunc;
        win.windowCloseFunc = cbfun;
        return prevcbfun;
    },
    setWindowRefreshCallback: function(winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.windowRefreshFunc;
        win.windowRefreshFunc = cbfun;
        return prevcbfun;
    },
    onClickRequestPointerLock: function(e) {
        if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
            Module["canvas"].requestPointerLock();
            e.preventDefault();
        }
    },
    setInputMode: function(winid, mode, value) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        switch (mode) {
            case 208897:
                {
                    switch (value) {
                        case 212993:
                            {
                                win.inputModes[mode] = value;
                                Module["canvas"].removeEventListener(
                                    "click",
                                    GLFW.onClickRequestPointerLock,
                                    true
                                );
                                Module["canvas"].exitPointerLock();
                                break;
                            }
                        case 212994:
                            {
                                out(
                                    "glfwSetInputMode called with GLFW_CURSOR_HIDDEN value not implemented."
                                );
                                break;
                            }
                        case 212995:
                            {
                                win.inputModes[mode] = value;
                                Module["canvas"].addEventListener(
                                    "click",
                                    GLFW.onClickRequestPointerLock,
                                    true
                                );
                                Module["canvas"].requestPointerLock();
                                break;
                            }
                        default:
                            {
                                out(
                                    "glfwSetInputMode called with unknown value parameter value: " +
                                    value +
                                    "."
                                );
                                break;
                            }
                    }
                    break;
                }
            case 208898:
                {
                    out(
                        "glfwSetInputMode called with GLFW_STICKY_KEYS mode not implemented."
                    );
                    break;
                }
            case 208899:
                {
                    out(
                        "glfwSetInputMode called with GLFW_STICKY_MOUSE_BUTTONS mode not implemented."
                    );
                    break;
                }
            default:
                {
                    out(
                        "glfwSetInputMode called with unknown mode parameter value: " +
                        mode +
                        "."
                    );
                    break;
                }
        }
    },
    getKey: function(winid, key) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return 0;
        return win.keys[key];
    },
    getMouseButton: function(winid, button) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return 0;
        return (win.buttons & (1 << button)) > 0;
    },
    getCursorPos: function(winid, x, y) {
        HEAPF64[x >> 3] = Browser.mouseX;
        HEAPF64[y >> 3] = Browser.mouseY;
    },
    getMousePos: function(winid, x, y) {
        HEAP32[x >> 2] = Browser.mouseX;
        HEAP32[y >> 2] = Browser.mouseY;
    },
    setCursorPos: function(winid, x, y) {},
    getWindowPos: function(winid, x, y) {
        var wx = 0;
        var wy = 0;
        var win = GLFW.WindowFromId(winid);
        if (win) {
            wx = win.x;
            wy = win.y;
        }
        if (x) {
            HEAP32[x >> 2] = wx;
        }
        if (y) {
            HEAP32[y >> 2] = wy;
        }
    },
    setWindowPos: function(winid, x, y) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.x = x;
        win.y = y;
    },
    getWindowSize: function(winid, width, height) {
        var ww = 0;
        var wh = 0;
        var win = GLFW.WindowFromId(winid);
        if (win) {
            ww = win.width;
            wh = win.height;
        }
        if (width) {
            HEAP32[width >> 2] = ww;
        }
        if (height) {
            HEAP32[height >> 2] = wh;
        }
    },
    setWindowSize: function(winid, width, height) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        if (GLFW.active.id == win.id) {
            if (width == screen.width && height == screen.height) {
                Browser.requestFullscreen();
            } else {
                Browser.exitFullscreen();
                Browser.setCanvasSize(width, height);
                win.width = width;
                win.height = height;
            }
        }
        if (!win.windowSizeFunc) return;
        getWasmTableEntry(win.windowSizeFunc)(win.id, width, height);
    },
    createWindow: function(width, height, title, monitor, share) {
        var i, id;
        for (i = 0; i < GLFW.windows.length && GLFW.windows[i] !== null; i++) {}
        if (i > 0)
            throw "glfwCreateWindow only supports one window at time currently";
        id = i + 1;
        if (width <= 0 || height <= 0) return 0;
        if (monitor) {
            Browser.requestFullscreen();
        } else {
            Browser.setCanvasSize(width, height);
        }
        for (i = 0; i < GLFW.windows.length && GLFW.windows[i] == null; i++) {}
        var useWebGL = GLFW.hints[139265] > 0;
        if (i == GLFW.windows.length) {
            if (useWebGL) {
                var contextAttributes = {
                    antialias: GLFW.hints[135181] > 1,
                    depth: GLFW.hints[135173] > 0,
                    stencil: GLFW.hints[135174] > 0,
                    alpha: GLFW.hints[135172] > 0,
                };
                Module.ctx = Browser.createContext(
                    Module["canvas"],
                    true,
                    true,
                    contextAttributes
                );
            } else {
                Browser.init();
            }
        }
        if (!Module.ctx && useWebGL) return 0;
        var win = new GLFW_Window(id, width, height, title, monitor, share);
        if (id - 1 == GLFW.windows.length) {
            GLFW.windows.push(win);
        } else {
            GLFW.windows[id - 1] = win;
        }
        GLFW.active = win;
        return win.id;
    },
    destroyWindow: function(winid) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        if (win.windowCloseFunc) getWasmTableEntry(win.windowCloseFunc)(win.id);
        GLFW.windows[win.id - 1] = null;
        if (GLFW.active.id == win.id) GLFW.active = null;
        for (var i = 0; i < GLFW.windows.length; i++)
            if (GLFW.windows[i] !== null) return;
        Module.ctx = Browser.destroyContext(Module["canvas"], true, true);
    },
    swapBuffers: function(winid) {},
    GLFW2ParamToGLFW3Param: function(param) {
        var table = {
            196609: 0,
            196610: 0,
            196611: 0,
            196612: 0,
            196613: 0,
            196614: 0,
            131073: 0,
            131074: 0,
            131075: 0,
            131076: 0,
            131077: 135169,
            131078: 135170,
            131079: 135171,
            131080: 135172,
            131081: 135173,
            131082: 135174,
            131083: 135183,
            131084: 135175,
            131085: 135176,
            131086: 135177,
            131087: 135178,
            131088: 135179,
            131089: 135180,
            131090: 0,
            131091: 135181,
            131092: 139266,
            131093: 139267,
            131094: 139270,
            131095: 139271,
            131096: 139272,
        };
        return table[param];
    },
};

function _glfwCreateWindow(width, height, title, monitor, share) {
    return GLFW.createWindow(width, height, title, monitor, share);
}

function _glfwGetPrimaryMonitor() {
    return 1;
}

function _glfwGetVideoMode(monitor) {
    return 0;
}

function _glfwInit() {
    if (GLFW.windows) return 1;
    GLFW.initialTime = GLFW.getTime();
    GLFW.hints = GLFW.defaultHints;
    GLFW.windows = new Array();
    GLFW.active = null;
    window.addEventListener("gamepadconnected", GLFW.onGamepadConnected, true);
    window.addEventListener(
        "gamepaddisconnected",
        GLFW.onGamepadDisconnected,
        true
    );
    window.addEventListener("keydown", GLFW.onKeydown, true);
    window.addEventListener("keypress", GLFW.onKeyPress, true);
    window.addEventListener("keyup", GLFW.onKeyup, true);
    window.addEventListener("blur", GLFW.onBlur, true);
    Module["canvas"].addEventListener("touchmove", GLFW.onMousemove, true);
    Module["canvas"].addEventListener("touchstart", GLFW.onMouseButtonDown, true);
    Module["canvas"].addEventListener("touchcancel", GLFW.onMouseButtonUp, true);
    Module["canvas"].addEventListener("touchend", GLFW.onMouseButtonUp, true);
    Module["canvas"].addEventListener("mousemove", GLFW.onMousemove, true);
    Module["canvas"].addEventListener("mousedown", GLFW.onMouseButtonDown, true);
    Module["canvas"].addEventListener("mouseup", GLFW.onMouseButtonUp, true);
    Module["canvas"].addEventListener("wheel", GLFW.onMouseWheel, true);
    Module["canvas"].addEventListener("mousewheel", GLFW.onMouseWheel, true);
    Module["canvas"].addEventListener("mouseenter", GLFW.onMouseenter, true);
    Module["canvas"].addEventListener("mouseleave", GLFW.onMouseleave, true);
    Module["canvas"].addEventListener("drop", GLFW.onDrop, true);
    Module["canvas"].addEventListener("dragover", GLFW.onDragover, true);
    Browser.resizeListeners.push(function(width, height) {
        GLFW.onCanvasResize(width, height);
    });
    return 1;
}

function _glfwMakeContextCurrent(winid) {}

function _glfwPollEvents() {}

function _glfwSetClipboardString(win, string) {}

function _glfwSetDropCallback(winid, cbfun) {
    return GLFW.setDropCallback(winid, cbfun);
}

function _glfwSetErrorCallback(cbfun) {
    var prevcbfun = GLFW.errorFunc;
    GLFW.errorFunc = cbfun;
    return prevcbfun;
}

function _glfwSetKeyCallback(winid, cbfun) {
    return GLFW.setKeyCallback(winid, cbfun);
}

function _glfwSetScrollCallback(winid, cbfun) {
    return GLFW.setScrollCallback(winid, cbfun);
}

function _glfwSetWindowSizeCallback(winid, cbfun) {
    return GLFW.setWindowSizeCallback(winid, cbfun);
}

function _glfwSwapBuffers(winid) {
    GLFW.swapBuffers(winid);
}

function _glfwSwapInterval(interval) {
    interval = Math.abs(interval);
    if (interval == 0) _emscripten_set_main_loop_timing(0, 0);
    else _emscripten_set_main_loop_timing(1, interval);
}

function _glfwTerminate() {
    window.removeEventListener("gamepadconnected", GLFW.onGamepadConnected, true);
    window.removeEventListener(
        "gamepaddisconnected",
        GLFW.onGamepadDisconnected,
        true
    );
    window.removeEventListener("keydown", GLFW.onKeydown, true);
    window.removeEventListener("keypress", GLFW.onKeyPress, true);
    window.removeEventListener("keyup", GLFW.onKeyup, true);
    window.removeEventListener("blur", GLFW.onBlur, true);
    Module["canvas"].removeEventListener("touchmove", GLFW.onMousemove, true);
    Module["canvas"].removeEventListener(
        "touchstart",
        GLFW.onMouseButtonDown,
        true
    );
    Module["canvas"].removeEventListener(
        "touchcancel",
        GLFW.onMouseButtonUp,
        true
    );
    Module["canvas"].removeEventListener("touchend", GLFW.onMouseButtonUp, true);
    Module["canvas"].removeEventListener("mousemove", GLFW.onMousemove, true);
    Module["canvas"].removeEventListener(
        "mousedown",
        GLFW.onMouseButtonDown,
        true
    );
    Module["canvas"].removeEventListener("mouseup", GLFW.onMouseButtonUp, true);
    Module["canvas"].removeEventListener("wheel", GLFW.onMouseWheel, true);
    Module["canvas"].removeEventListener("mousewheel", GLFW.onMouseWheel, true);
    Module["canvas"].removeEventListener("mouseenter", GLFW.onMouseenter, true);
    Module["canvas"].removeEventListener("mouseleave", GLFW.onMouseleave, true);
    Module["canvas"].removeEventListener("drop", GLFW.onDrop, true);
    Module["canvas"].removeEventListener("dragover", GLFW.onDragover, true);
    Module["canvas"].width = Module["canvas"].height = 1;
    GLFW.windows = null;
    GLFW.active = null;
}

function _glfwWindowHint(target, hint) {
    GLFW.hints[target] = hint;
}
var FSNode = function(parent, name, mode, rdev) {
    if (!parent) {
        parent = this;
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
};
var readMode = 292 | 73;
var writeMode = 146;
Object.defineProperties(FSNode.prototype, {
    read: {
        get: function() {
            return (this.mode & readMode) === readMode;
        },
        set: function(val) {
            val ? (this.mode |= readMode) : (this.mode &= ~readMode);
        },
    },
    write: {
        get: function() {
            return (this.mode & writeMode) === writeMode;
        },
        set: function(val) {
            val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
        },
    },
    isFolder: {
        get: function() {
            return FS.isDir(this.mode);
        },
    },
    isDevice: {
        get: function() {
            return FS.isChrdev(this.mode);
        },
    },
});
FS.FSNode = FSNode;
FS.staticInit();
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_unlink"] = FS.unlink;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createDevice"] = FS.createDevice;
Module["requestFullscreen"] = function Module_requestFullscreen(
    lockPointer,
    resizeCanvas
) {
    Browser.requestFullscreen(lockPointer, resizeCanvas);
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
    Browser.requestAnimationFrame(func);
};
Module["setCanvasSize"] = function Module_setCanvasSize(
    width,
    height,
    noUpdates
) {
    Browser.setCanvasSize(width, height, noUpdates);
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
    Browser.mainLoop.pause();
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
    Browser.mainLoop.resume();
};
Module["getUserMedia"] = function Module_getUserMedia() {
    Browser.getUserMedia();
};
Module["createContext"] = function Module_createContext(
    canvas,
    useWebGL,
    setInModule,
    webGLContextAttributes
) {
    return Browser.createContext(
        canvas,
        useWebGL,
        setInModule,
        webGLContextAttributes
    );
};
var preloadedImages = {};
var preloadedAudios = {};
var GLctx;
var miniTempWebGLFloatBuffersStorage = new Float32Array(288);
for (var i = 0; i < 288; ++i) {
    miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(
        0,
        i + 1
    );
}

function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
}
var asmLibraryArg = {
    Ra: _SDL_GetNumAudioDrivers,
    Sa: _SDL_Init,
    Qa: _SDL_OpenAudio,
    Q: _SDL_PauseAudio,
    Pa: _SDL_Quit,
    a: ___assert_fail,
    da: ___syscall_faccessat,
    aa: ___syscall_fcntl64,
    cb: ___syscall_getdents64,
    fb: ___syscall_ioctl,
    db: ___syscall_mkdirat,
    ba: ___syscall_openat,
    $a: ___syscall_renameat,
    ab: ___syscall_rmdir,
    _a: ___syscall_stat64,
    bb: ___syscall_unlinkat,
    gb: __emscripten_date_now,
    hb: __localtime_js,
    ib: __mktime_js,
    jb: __tzset_js,
    _: _abort,
    d: _emscripten_asm_const_int,
    ta: _emscripten_cancel_main_loop,
    ca: _emscripten_memcpy_big,
    La: _emscripten_request_fullscreen_strategy,
    Za: _emscripten_resize_heap,
    sa: _emscripten_set_main_loop,
    Ja: _emscripten_set_mousedown_callback_on_thread,
    Ka: _emscripten_set_mousemove_callback_on_thread,
    Ia: _emscripten_set_mouseup_callback_on_thread,
    Ea: _emscripten_set_touchcancel_callback_on_thread,
    Ga: _emscripten_set_touchend_callback_on_thread,
    Fa: _emscripten_set_touchmove_callback_on_thread,
    Ha: _emscripten_set_touchstart_callback_on_thread,
    X: _exit,
    G: _fd_close,
    eb: _fd_read,
    Ya: _fd_seek,
    $: _fd_write,
    Y: get_device_pixel_ratio,
    K: get_hostname,
    Ta: get_url_level_index,
    x: _glActiveTexture,
    V: _glAttachShader,
    n: _glBindBuffer,
    r: _glBindFramebuffer,
    p: _glBindRenderbuffer,
    e: _glBindTexture,
    ea: _glBlendFunc,
    B: _glBufferData,
    ga: _glCheckFramebufferStatus,
    t: _glClear,
    D: _glClearColor,
    na: _glCompileShader,
    la: _glCreateProgram,
    pa: _glCreateShader,
    M: _glDeleteBuffers,
    L: _glDeleteFramebuffers,
    C: _glDeleteRenderbuffers,
    O: _glDeleteTextures,
    fa: _glDepthFunc,
    l: _glDepthMask,
    c: _glDisable,
    h: _glDisableVertexAttribArray,
    q: _glDrawArrays,
    b: _glEnable,
    m: _glEnableVertexAttribArray,
    y: _glFramebufferRenderbuffer,
    ha: _glFramebufferTexture2D,
    N: _glGenBuffers,
    J: _glGenFramebuffers,
    v: _glGenRenderbuffers,
    F: _glGenTextures,
    i: _glGetAttribLocation,
    s: _glGetIntegerv,
    ja: _glGetProgramInfoLog,
    U: _glGetProgramiv,
    ma: _glGetShaderInfoLog,
    W: _glGetShaderiv,
    k: _glGetUniformLocation,
    ka: _glLinkProgram,
    R: _glReadPixels,
    z: _glRenderbufferStorage,
    oa: _glShaderSource,
    E: _glTexImage2D,
    j: _glTexParameterf,
    H: _glTexParameteri,
    ia: _glTexSubImage2D,
    T: _glUniform1f,
    I: _glUniform1i,
    A: _glUniform2f,
    u: _glUniform3fv,
    g: _glUniformMatrix4fv,
    w: _glUseProgram,
    f: _glVertexAttribPointer,
    o: _glViewport,
    za: _glfwCreateWindow,
    Ba: _glfwGetPrimaryMonitor,
    Aa: _glfwGetVideoMode,
    Ca: _glfwInit,
    ya: _glfwMakeContextCurrent,
    Na: _glfwPollEvents,
    Ma: _glfwSetClipboardString,
    va: _glfwSetDropCallback,
    Da: _glfwSetErrorCallback,
    xa: _glfwSetKeyCallback,
    wa: _glfwSetScrollCallback,
    ua: _glfwSetWindowSizeCallback,
    Oa: _glfwSwapBuffers,
    ra: _glfwSwapInterval,
    qa: _glfwTerminate,
    P: _glfwWindowHint,
    Wa: is_daily_reward_possible,
    Va: is_latest_browser_tab,
    S: poki_gameplay_start,
    Xa: poki_gameplay_stop,
    Z: poki_level_start,
    Ua: set_latest_browser_tab,
};
var asm = createWasm();
var ___wasm_call_ctors = (Module["___wasm_call_ctors"] = function() {
    return (___wasm_call_ctors = Module["___wasm_call_ctors"] =
        Module["asm"]["lb"]).apply(null, arguments);
});
var _ad_on_inited = (Module["_ad_on_inited"] = function() {
    return (_ad_on_inited = Module["_ad_on_inited"] = Module["asm"]["mb"]).apply(
        null,
        arguments
    );
});
var _ad_interstitial_on_loaded = (Module["_ad_interstitial_on_loaded"] =
    function() {
        return (_ad_interstitial_on_loaded = Module["_ad_interstitial_on_loaded"] =
            Module["asm"]["nb"]).apply(null, arguments);
    });
var _ad_interstitial_on_showed = (Module["_ad_interstitial_on_showed"] =
    function() {
        return (_ad_interstitial_on_showed = Module["_ad_interstitial_on_showed"] =
            Module["asm"]["ob"]).apply(null, arguments);
    });
var _ad_rewarded_on_loaded = (Module["_ad_rewarded_on_loaded"] = function() {
    return (_ad_rewarded_on_loaded = Module["_ad_rewarded_on_loaded"] =
        Module["asm"]["pb"]).apply(null, arguments);
});
var _ad_rewarded_on_reward = (Module["_ad_rewarded_on_reward"] = function() {
    return (_ad_rewarded_on_reward = Module["_ad_rewarded_on_reward"] =
        Module["asm"]["qb"]).apply(null, arguments);
});
var _ad_rewarded_on_showed = (Module["_ad_rewarded_on_showed"] = function() {
    return (_ad_rewarded_on_showed = Module["_ad_rewarded_on_showed"] =
        Module["asm"]["rb"]).apply(null, arguments);
});
var _app_error = (Module["_app_error"] = function() {
    return (_app_error = Module["_app_error"] = Module["asm"]["sb"]).apply(
        null,
        arguments
    );
});
var _free = (Module["_free"] = function() {
    return (_free = Module["_free"] = Module["asm"]["tb"]).apply(null, arguments);
});
var _hint_file_exists = (Module["_hint_file_exists"] = function() {
    return (_hint_file_exists = Module["_hint_file_exists"] =
        Module["asm"]["ub"]).apply(null, arguments);
});
var _malloc = (Module["_malloc"] = function() {
    return (_malloc = Module["_malloc"] = Module["asm"]["vb"]).apply(
        null,
        arguments
    );
});
var _menu_query_games_add_result = (Module["_menu_query_games_add_result"] =
    function() {
        return (_menu_query_games_add_result = Module[
                "_menu_query_games_add_result"
            ] =
            Module["asm"]["wb"]).apply(null, arguments);
    });
var _menu_query_games_finished = (Module["_menu_query_games_finished"] =
    function() {
        return (_menu_query_games_finished = Module["_menu_query_games_finished"] =
            Module["asm"]["xb"]).apply(null, arguments);
    });
var _menu_read_game_finished = (Module["_menu_read_game_finished"] =
    function() {
        return (_menu_read_game_finished = Module["_menu_read_game_finished"] =
            Module["asm"]["yb"]).apply(null, arguments);
    });
var _menu_read_counts_finished = (Module["_menu_read_counts_finished"] =
    function() {
        return (_menu_read_counts_finished = Module["_menu_read_counts_finished"] =
            Module["asm"]["zb"]).apply(null, arguments);
    });
var _menu_read_ledger_finished = (Module["_menu_read_ledger_finished"] =
    function() {
        return (_menu_read_ledger_finished = Module["_menu_read_ledger_finished"] =
            Module["asm"]["Ab"]).apply(null, arguments);
    });
var _menu_write_ledger_finished = (Module["_menu_write_ledger_finished"] =
    function() {
        return (_menu_write_ledger_finished = Module[
                "_menu_write_ledger_finished"
            ] =
            Module["asm"]["Bb"]).apply(null, arguments);
    });
var _menu_read_gems_finished = (Module["_menu_read_gems_finished"] =
    function() {
        return (_menu_read_gems_finished = Module["_menu_read_gems_finished"] =
            Module["asm"]["Cb"]).apply(null, arguments);
    });
var _memcpy = (Module["_memcpy"] = function() {
    return (_memcpy = Module["_memcpy"] = Module["asm"]["Db"]).apply(
        null,
        arguments
    );
});
var _state_menu_deeplink_stop = (Module["_state_menu_deeplink_stop"] =
    function() {
        return (_state_menu_deeplink_stop = Module["_state_menu_deeplink_stop"] =
            Module["asm"]["Eb"]).apply(null, arguments);
    });
var _menu_file_upload_finished = (Module["_menu_file_upload_finished"] =
    function() {
        return (_menu_file_upload_finished = Module["_menu_file_upload_finished"] =
            Module["asm"]["Fb"]).apply(null, arguments);
    });
var _share_file_finished = (Module["_share_file_finished"] = function() {
    return (_share_file_finished = Module["_share_file_finished"] =
        Module["asm"]["Gb"]).apply(null, arguments);
});
var _iap_cancelled = (Module["_iap_cancelled"] = function() {
    return (_iap_cancelled = Module["_iap_cancelled"] =
        Module["asm"]["Hb"]).apply(null, arguments);
});
var _state_menu_payout_add = (Module["_state_menu_payout_add"] = function() {
    return (_state_menu_payout_add = Module["_state_menu_payout_add"] =
        Module["asm"]["Ib"]).apply(null, arguments);
});
var _state_menu_payout_stop = (Module["_state_menu_payout_stop"] = function() {
    return (_state_menu_payout_stop = Module["_state_menu_payout_stop"] =
        Module["asm"]["Jb"]).apply(null, arguments);
});
var _menu_on_password_reset_email_sent = (Module[
    "_menu_on_password_reset_email_sent"
] = function() {
    return (_menu_on_password_reset_email_sent = Module[
            "_menu_on_password_reset_email_sent"
        ] =
        Module["asm"]["Kb"]).apply(null, arguments);
});
var _menu_sync_upload_finished = (Module["_menu_sync_upload_finished"] =
    function() {
        return (_menu_sync_upload_finished = Module["_menu_sync_upload_finished"] =
            Module["asm"]["Lb"]).apply(null, arguments);
    });
var _menu_sync_download_finished = (Module["_menu_sync_download_finished"] =
    function() {
        return (_menu_sync_download_finished = Module[
                "_menu_sync_download_finished"
            ] =
            Module["asm"]["Mb"]).apply(null, arguments);
    });
var _game_download_finished = (Module["_game_download_finished"] = function() {
    return (_game_download_finished = Module["_game_download_finished"] =
        Module["asm"]["Ob"]).apply(null, arguments);
});
var _app_fetch_url_done = (Module["_app_fetch_url_done"] = function() {
    return (_app_fetch_url_done = Module["_app_fetch_url_done"] =
        Module["asm"]["Pb"]).apply(null, arguments);
});
var _app_webview_message = (Module["_app_webview_message"] = function() {
    return (_app_webview_message = Module["_app_webview_message"] =
        Module["asm"]["Qb"]).apply(null, arguments);
});
var _app_pause = (Module["_app_pause"] = function() {
    return (_app_pause = Module["_app_pause"] = Module["asm"]["Rb"]).apply(
        null,
        arguments
    );
});
var _app_resume = (Module["_app_resume"] = function() {
    return (_app_resume = Module["_app_resume"] = Module["asm"]["Sb"]).apply(
        null,
        arguments
    );
});
var _app_on_signin = (Module["_app_on_signin"] = function() {
    return (_app_on_signin = Module["_app_on_signin"] =
        Module["asm"]["Tb"]).apply(null, arguments);
});
var _app_on_signout = (Module["_app_on_signout"] = function() {
    return (_app_on_signout = Module["_app_on_signout"] =
        Module["asm"]["Ub"]).apply(null, arguments);
});
var _notification_show_inapp = (Module["_notification_show_inapp"] =
    function() {
        return (_notification_show_inapp = Module["_notification_show_inapp"] =
            Module["asm"]["Vb"]).apply(null, arguments);
    });
var _app_init = (Module["_app_init"] = function() {
    return (_app_init = Module["_app_init"] = Module["asm"]["Wb"]).apply(
        null,
        arguments
    );
});
var _set_is_mobile = (Module["_set_is_mobile"] = function() {
    return (_set_is_mobile = Module["_set_is_mobile"] =
        Module["asm"]["Xb"]).apply(null, arguments);
});
var _get_app_version = (Module["_get_app_version"] = function() {
    return (_get_app_version = Module["_get_app_version"] =
        Module["asm"]["Yb"]).apply(null, arguments);
});
var _use_test_api_server = (Module["_use_test_api_server"] = function() {
    return (_use_test_api_server = Module["_use_test_api_server"] =
        Module["asm"]["Zb"]).apply(null, arguments);
});
var _level_select_menu_start_level = (Module["_level_select_menu_start_level"] =
    function() {
        return (_level_select_menu_start_level = Module[
                "_level_select_menu_start_level"
            ] =
            Module["asm"]["_b"]).apply(null, arguments);
    });
var _set_game_focus = (Module["_set_game_focus"] = function() {
    return (_set_game_focus = Module["_set_game_focus"] =
        Module["asm"]["$b"]).apply(null, arguments);
});
var _set_ad_freq = (Module["_set_ad_freq"] = function() {
    return (_set_ad_freq = Module["_set_ad_freq"] = Module["asm"]["ac"]).apply(
        null,
        arguments
    );
});
var _set_ad_duration_offline = (Module["_set_ad_duration_offline"] =
    function() {
        return (_set_ad_duration_offline = Module["_set_ad_duration_offline"] =
            Module["asm"]["bc"]).apply(null, arguments);
    });
var _set_abtest_in_game_get = (Module["_set_abtest_in_game_get"] = function() {
    return (_set_abtest_in_game_get = Module["_set_abtest_in_game_get"] =
        Module["asm"]["cc"]).apply(null, arguments);
});
var _set_user_premium_ends = (Module["_set_user_premium_ends"] = function() {
    return (_set_user_premium_ends = Module["_set_user_premium_ends"] =
        Module["asm"]["dc"]).apply(null, arguments);
});
var _get_user_premium_ends = (Module["_get_user_premium_ends"] = function() {
    return (_get_user_premium_ends = Module["_get_user_premium_ends"] =
        Module["asm"]["ec"]).apply(null, arguments);
});
var _set_user_banned = (Module["_set_user_banned"] = function() {
    return (_set_user_banned = Module["_set_user_banned"] =
        Module["asm"]["fc"]).apply(null, arguments);
});
var _set_user_gems = (Module["_set_user_gems"] = function() {
    return (_set_user_gems = Module["_set_user_gems"] =
        Module["asm"]["gc"]).apply(null, arguments);
});
var _set_user_nick = (Module["_set_user_nick"] = function() {
    return (_set_user_nick = Module["_set_user_nick"] =
        Module["asm"]["hc"]).apply(null, arguments);
});
var _set_user_state = (Module["_set_user_state"] = function() {
    return (_set_user_state = Module["_set_user_state"] =
        Module["asm"]["ic"]).apply(null, arguments);
});
var _set_user_uid = (Module["_set_user_uid"] = function() {
    return (_set_user_uid = Module["_set_user_uid"] = Module["asm"]["jc"]).apply(
        null,
        arguments
    );
});
var _set_user_adfree_ends = (Module["_set_user_adfree_ends"] = function() {
    return (_set_user_adfree_ends = Module["_set_user_adfree_ends"] =
        Module["asm"]["kc"]).apply(null, arguments);
});
var _get_app_inited = (Module["_get_app_inited"] = function() {
    return (_get_app_inited = Module["_get_app_inited"] =
        Module["asm"]["lc"]).apply(null, arguments);
});
var _log_simple = (Module["_log_simple"] = function() {
    return (_log_simple = Module["_log_simple"] = Module["asm"]["mc"]).apply(
        null,
        arguments
    );
});
var _app_terminate_if_necessary = (Module["_app_terminate_if_necessary"] =
    function() {
        return (_app_terminate_if_necessary = Module[
                "_app_terminate_if_necessary"
            ] =
            Module["asm"]["nc"]).apply(null, arguments);
    });
var _score_set_top_nicks_and_scores = (Module[
    "_score_set_top_nicks_and_scores"
] = function() {
    return (_score_set_top_nicks_and_scores = Module[
            "_score_set_top_nicks_and_scores"
        ] =
        Module["asm"]["oc"]).apply(null, arguments);
});
var _score_set_above_nicks_and_scores = (Module[
    "_score_set_above_nicks_and_scores"
] = function() {
    return (_score_set_above_nicks_and_scores = Module[
            "_score_set_above_nicks_and_scores"
        ] =
        Module["asm"]["pc"]).apply(null, arguments);
});
var _score_set_below_nicks_and_scores = (Module[
    "_score_set_below_nicks_and_scores"
] = function() {
    return (_score_set_below_nicks_and_scores = Module[
            "_score_set_below_nicks_and_scores"
        ] =
        Module["asm"]["qc"]).apply(null, arguments);
});
var _score_read_finished_em = (Module["_score_read_finished_em"] = function() {
    return (_score_read_finished_em = Module["_score_read_finished_em"] =
        Module["asm"]["rc"]).apply(null, arguments);
});
var _keydown_browser = (Module["_keydown_browser"] = function() {
    return (_keydown_browser = Module["_keydown_browser"] =
        Module["asm"]["sc"]).apply(null, arguments);
});
var _update_screen_size = (Module["_update_screen_size"] = function() {
    return (_update_screen_size = Module["_update_screen_size"] =
        Module["asm"]["tc"]).apply(null, arguments);
});
var _request_fullscreen = (Module["_request_fullscreen"] = function() {
    return (_request_fullscreen = Module["_request_fullscreen"] =
        Module["asm"]["uc"]).apply(null, arguments);
});
var _user_accepted_and_clicked = (Module["_user_accepted_and_clicked"] =
    function() {
        return (_user_accepted_and_clicked = Module["_user_accepted_and_clicked"] =
            Module["asm"]["vc"]).apply(null, arguments);
    });
var _main = (Module["_main"] = function() {
    return (_main = Module["_main"] = Module["asm"]["wc"]).apply(null, arguments);
});
var _ntp_set_server_time = (Module["_ntp_set_server_time"] = function() {
    return (_ntp_set_server_time = Module["_ntp_set_server_time"] =
        Module["asm"]["xc"]).apply(null, arguments);
});
var _moderation_publish_perform = (Module["_moderation_publish_perform"] =
    function() {
        return (_moderation_publish_perform = Module[
                "_moderation_publish_perform"
            ] =
            Module["asm"]["yc"]).apply(null, arguments);
    });
var _play_counter_falloff = (Module["_play_counter_falloff"] = function() {
    return (_play_counter_falloff = Module["_play_counter_falloff"] =
        Module["asm"]["zc"]).apply(null, arguments);
});
var _news_create = (Module["_news_create"] = function() {
    return (_news_create = Module["_news_create"] = Module["asm"]["Ac"]).apply(
        null,
        arguments
    );
});
var _news_update_started = (Module["_news_update_started"] = function() {
    return (_news_update_started = Module["_news_update_started"] =
        Module["asm"]["Bc"]).apply(null, arguments);
});
var _news_update_finished = (Module["_news_update_finished"] = function() {
    return (_news_update_finished = Module["_news_update_finished"] =
        Module["asm"]["Cc"]).apply(null, arguments);
});
var ___errno_location = (Module["___errno_location"] = function() {
    return (___errno_location = Module["___errno_location"] =
        Module["asm"]["Dc"]).apply(null, arguments);
});
var stackSave = (Module["stackSave"] = function() {
    return (stackSave = Module["stackSave"] = Module["asm"]["Ec"]).apply(
        null,
        arguments
    );
});
var stackRestore = (Module["stackRestore"] = function() {
    return (stackRestore = Module["stackRestore"] = Module["asm"]["Fc"]).apply(
        null,
        arguments
    );
});
var stackAlloc = (Module["stackAlloc"] = function() {
    return (stackAlloc = Module["stackAlloc"] = Module["asm"]["Gc"]).apply(
        null,
        arguments
    );
});
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
Module["addRunDependency"] = addRunDependency;
Module["removeRunDependency"] = removeRunDependency;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
var calledRun;

function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = "Program terminated with exit(" + status + ")";
    this.status = status;
}
var calledMain = false;
dependenciesFulfilled = function runCaller() {
    if (!calledRun) run();
    if (!calledRun) dependenciesFulfilled = runCaller;
};

function callMain(args) {
    var entryFunction = Module["_main"];
    args = args || [];
    args.unshift(thisProgram);
    var argc = args.length;
    var argv = stackAlloc((argc + 1) * 4);
    var argv_ptr = argv >> 2;
    args.forEach((arg) => {
        HEAP32[argv_ptr++] = allocateUTF8OnStack(arg);
    });
    HEAP32[argv_ptr] = 0;
    try {
        var ret = entryFunction(argc, argv);
        exit(ret, true);
        return ret;
    } catch (e) {
        return handleException(e);
    } finally {
        calledMain = true;
    }
}

function run(args) {
    args = args || arguments_;
    if (runDependencies > 0) {
        return;
    }
    preRun();
    if (runDependencies > 0) {
        return;
    }

    function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        preMain();
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        if (shouldRunNow) callMain(args);
        postRun();
    }
    if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function() {
            setTimeout(function() {
                Module["setStatus"]("");
            }, 1);
            doRun();
        }, 1);
    } else {
        doRun();
    }
}
Module["run"] = run;

function exit(status, implicit) {
    EXITSTATUS = status;
    procExit(status);
}

function procExit(code) {
    EXITSTATUS = code;
    if (!keepRuntimeAlive()) {
        if (Module["onExit"]) Module["onExit"](code);
        ABORT = true;
    }
    quit_(code, new ExitStatus(code));
}
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function")
        Module["preInit"] = [Module["preInit"]];
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()();
    }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) shouldRunNow = false;
run();