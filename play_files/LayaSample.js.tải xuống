

function start(){
// parseStatic();
// Laya.MiniAdpter.init();
Laya.MiniAdpter.init();
// Laya.QGMiniAdapter.init();

Laya.init(720,1280,laya.webgl.WebGL);

Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_WIDTH;
Laya.stage.bgColor = "#ffffff";
Laya.stage.screenMode=Laya.Stage.SCREEN_VERTICAL;

Laya.stage.alignH=Laya.Stage.ALIGN_CENTER;
Laya.SoundManager.useAudioMusic=false;
Laya.stage.frameRate="fast";
UIConfig.popupBgAlpha=0.8;
Laya.SoundManager.useAudioMusic=false;

// Laya.Stat.show();


Res.loadRes(function(){
    platform.afterInit(Game.init);
});

}
platform.init(start);