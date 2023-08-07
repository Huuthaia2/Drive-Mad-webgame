var AdView=(function(){
    var root={};
    var ui;
    root.clickInof = null;

    root.init=function(){
        ui=new adViewUI();
        ui.visible=true;
        root.ui=ui;
        Laya.stage.addChild(ui);
        ui.bg.visible =false;
        ui.native.visible = false;
        ui.native_close.on('click',this,function(){
            var num = Math.random();
            var b = num.toFixed(1);
            console.log(User.version)
            if (parseFloat(b) < User.aderrorrate && User.clickNum < User.aderrormaxcount && User.version == "1.0") {
                platform.createNativeAdClick();
                root.hide();
                User.clickNum += 1;
            } else {
                 root.hide();
            }
            
        })
        ui.native_img.on('click',this,function(){
          platform.createNativeAdClick();
          root.hide();
        })
        ui.btn_native.on('click',this,function(){
          platform.createNativeAdClick();
          root.hide();
        })

        ui.native_ad.on('click',this,function(){
          platform.createNativeAdClick();
          root.hide();
        })
    }

    root.ad = function (show,x) {
        // if(User.isOnline == 0)return;
        console.log(show)
        if (show && root.clickInof != null) {
            if(root.clickInof){
                ui.native.visible = true;
                ui.native_close.x = x;
                ui.native_img.skin = root.clickInof.imgUrlList[0];
                ui.native_desc.text = root.clickInof.desc;
            }
            return;
        }
        platform.createNativeAd(function (res) {
            console.log(res);
            if (!show) {
                root.clickInof = res;
            }
        })
    }
    
    root.show = function(){
        ui.visible = true;
        ui.bg.visible =true;
    }
    
    root.hide = function(){
        ui.visible = false;
        ui.bg.visible =false;
    }

 

    return root;
    })();
    