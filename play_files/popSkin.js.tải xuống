var PopSkin=(function(){
var root={};
var ui;

root.show=function(){
    ui.visible=true;
    root.shaker.start();

    root.skin=10;

}
root.hide=function(){
    ui.visible=false;
    root.shaker.stop();
}
root.init=function(){
    ui=new popSkinUI();
    ui.visible=false;
    Laya.stage.addChild(ui);
    root.shaker=g.createShaker(ui.btnAd);

    ui.btnAd.on('click',null,function(){
        
    })

    ui.btnClose.on('click',null,function(){
          root.hide();
          Match.show();
    })

}
return root;
})();
