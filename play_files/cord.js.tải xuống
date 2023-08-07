var Cord=(function(){
var root={};


root.getPos=function (i,j){

    var w=Laya.stage.width/2;
    var h=Laya.stage.height/2;
    return {x:j*w,y:i*h};
}


root.adjustUI=function (ui){
    var w=Laya.stage.width/2;
    var h=Laya.stage.height/2;
    
    ui.width=Laya.stage.width;
    ui.height=Laya.stage.height;
    for(var i=0;i<3;i++){
        for(var j=0;j<3;j++){
            var p=ui["p"+(i*3+j)];
            if(p){
                p.x=j*w;
                p.y=i*h;
            }
        };
    };
    
}


root.init=function (){

    // root.

}


return root;
})();
