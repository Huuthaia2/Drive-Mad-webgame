var Res=(function(){
var root={};

var res=[
   {
      url: "res/atlas/effect.atlas",
      type:Laya.Loader.ATLAS
   },
   {
      url: "res/atlas/hero.atlas",
      type:Laya.Loader.ATLAS
   },
    {
      url: "res/atlas/ui.atlas",
      type:Laya.Loader.ATLAS
   },
   {
      url: "res/atlas/weapon.atlas",
      type:Laya.Loader.ATLAS
   },
   {
      url: "f_dm_1.png",
      type:Laya.Loader.IMAGE
   }
   
];

var count=10;
var pauseCount=0;
function update(){
  if(pauseCount>0){
    pauseCount-=1;
  }else{
    pauseCount=100+Math.floor(Math.random()*20);
  }
  if(pauseCount>90){
      if(count<97){
      count+=Math.floor(Math.random()*3);
      platform.setLoadingProgress(count);
    }
  }
  
}
console.log(11111)
root.loadRes=function(f){
    Laya.timer.frameLoop(1,null,update);
    Laya.loader.load(res, Laya.Handler.create(null, function(){
      platform.setLoadingProgress(100);
      Laya.timer.clear(null,update);
      f();
      console.log(22222)
    }));
}

return root;
})();
