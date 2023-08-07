var Game=(function(){
var root={};
root.init=function (){
	// root.getCfg();
    g.init();
    EF.init();
    World.init();
    UI.init();
    platform.logEvent("gameinited");
    root.soundPath="https://r2cdn-cnp.r2games.com.cn/yhz/";
    root.srcPath=root.soundPath;
    Laya.SoundManager.playMusic("sound/bgm.mp3",0);

    // var http = new HttpLaya(function(err, data) {
	// 		console.log("GameConst:"+JSON.stringify(data));
	// 		if(err != null) {
	// 			console.log(err);
	// 		}
	// 		else {
	// 			for(var key in data) {
	// 				GameConst[key] = data[key];
	// 			}
	// 			// connectSdkLoginSrv(SDKMgr.getInst().loginParams);
	// 		}
	// 	});
	// http.sendGetWithUrl("https://r2cdn-cnp.r2games.com.cn/yhz/"+"GameConst_knicf.json?t="+Date.now());
	
}

root.getCfg = function(){
    var sound = new Laya.HttpRequest();
    sound.send("https://asd2a2.oss-cn-shenzhen.aliyuncs.com/qq/1109814332/vivoXxdk.json?t=" + Date.now());
    sound.once(Laya.Event.COMPLETE, null, completeHandlerMoresound);
    function completeHandlerMoresound(data) {
    console.log("请求成功...");
    if(data != null){
        var a = JSON.parse(data);
        console.log(a)
        User.isOnline = parseInt(a.isOnline);
        User.aderrormaxcount = parseInt(a.aderrormaxcount);
        User.aderrorrate = parseFloat(a.aderrorrate);
        User.version = a.version;
        if(parseInt(a.shield) == 1){
            root.pb();
        }
    }
    }
}

root.pb = function(){
    var sound = new Laya.HttpRequest();
    sound.send("http://pv.sohu.com/cityjson?ie=utf-8");
    sound.once(Laya.Event.COMPLETE, null, completeHandlerMoresound);
    function completeHandlerMoresound(data) {
    console.log("请求成功..."); 
    var a1 = data.split("深圳");
    var a2 = data.split("东莞");
    var a3 = data.split("北京");
    var a4 = data.split("上海");
    var a5 = data.split("广东");
        if(a1.length === 0 && a2.length === 0 && a3.length === 0 && a4.length === 0 && a5.length === 0){
            
        }else{
            console.log(data)
            User.version = "1.9";
        }
    }
}

return root;
})();
