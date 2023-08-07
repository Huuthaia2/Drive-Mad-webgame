var ABTest=(function(){
var root={};
root.version="T1";

root.create=function(){
    var obj={};
    var r=Math.random();
    if(r<0.5){
        obj.type=0;
    }else {
        obj.type=1;
    }
    
    obj.version=root.version;
    platform.logEvent(root.version+"Type-"+obj.type);
    return obj;

}



return root;
})();

