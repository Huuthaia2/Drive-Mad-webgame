function parseStatic(){
    var newStatic={};
    for(var i=0;i<cfgs.length;i++){
        var chart=cfgs[i];
        var name=chart["name"];
        var data=chart["data"];
        newStatic[name]={};
        var head=data[0];
        var properties=head.slice(1,head.length);
        for(var j=1;j<data.length;j++){
            var id=data[j][0];
            var dItem=data[j].slice(1,data[j].length);
            newStatic[name][id]={};
            for(var k=0;k<properties.length;k++){
                if(dItem[k]==null){
                    newStatic[name][id][properties[k]]="";
                }else{
                    newStatic[name][id][properties[k]]=dItem[k];
                }
            };
        };
    };
    cfgs=newStatic;
}
function getData(id){
    // console.log(type,id)
    // console.log(static[0].data[id][1])
    // console.log(static[0].type)
    return cfgs[0].data[id][1];
}

function getDataLength(type){
    return Object.keys(cfgs[type]).length;
}


function parseArray(d){
    if(d==null){
        return [];
    }
    if(typeof d =="number"){
        return [d];
    }
    return d.split(",");
}
