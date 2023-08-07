var CLASS$=Laya.class;
var STATICATTR$=Laya.static;
var View=laya.ui.View;
var Dialog=laya.ui.Dialog;
var adViewUI=(function(_super){
		function adViewUI(){
			
		    this.bg=null;
		    this.native=null;
		    this.native_ad=null;
		    this.native_close=null;
		    this.native_img=null;
		    this.native_desc=null;
		    this.btn_native=null;

			adViewUI.__super.call(this);
		}

		CLASS$(adViewUI,'ui.adViewUI',_super);
		var __proto__=adViewUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(adViewUI.uiView);

		}

		adViewUI.uiView={"type":"View","props":{"width":720,"top":0,"right":0,"mouseThrough":true,"left":0,"height":1280,"bottom":0},"child":[{"type":"Image","props":{"width":750,"var":"bg","skin":"ui/youzi_black.png","height":1624,"alpha":0.6}},{"type":"Box","props":{"width":720,"var":"native","height":909,"centerY":0,"centerX":0},"child":[{"type":"Image","props":{"y":210,"x":12,"var":"native_ad","height":528}},{"type":"Image","props":{"y":168,"x":12,"width":704}},{"type":"Image","props":{"y":173,"x":96,"var":"native_close","skin":"ui/close_1.png","scaleY":0.8,"scaleX":0.8}},{"type":"Image","props":{"y":296,"x":115,"width":500,"var":"native_img","height":320}},{"type":"Label","props":{"y":663,"x":127,"width":492,"var":"native_desc","valign":"middle","text":"天猫双11","overflow":"hidden","height":45,"fontSize":32,"color":"#000000","bold":true,"align":"center"}},{"type":"Image","props":{"y":568,"x":570,"width":50,"skin":"ui/b_vessel_5.png","height":30}},{"type":"Label","props":{"y":575,"x":578,"width":36,"text":"广告","height":18,"fontSize":18,"color":"#ffffff","bold":true}},{"type":"Image","props":{"y":756,"x":162,"var":"btn_native","scaleY":1.3,"scaleX":1.3},"child":[{"type":"Label","props":{"y":0,"x":0,"width":335,"valign":"middle","text":"查看广告","height":94,"fontSize":52,"color":"#ffffff","bold":true,"align":"center"}}]}]}]};
		return adViewUI;
	})(View);
var battleUI=(function(_super){
		function battleUI(){
			
		    this.p0=null;
		    this.stick=null;
		    this.stickBg=null;
		    this.stickSign=null;
		    this.yourScore=null;
		    this.p2=null;
		    this.leftCount=null;
		    this.remain=null;
		    this.killCount=null;
		    this.kill=null;
		    this.p4=null;
		    this.lvlup=null;
		    this.countDown=null;
		    this.tutorial=null;
		    this.tutorial_sign=null;
		    this.hand=null;
		    this.tutorial_text=null;
		    this.tutorial_text2=null;
		    this.comboCount=null;
		    this.combo=null;
		    this.warning=null;
		    this.report=null;
		    this.reportC=null;
		    this.WudiFengHuoLun=null;
		    this.buffRebornText=null;
		    this.reborn=null;
		    this.btn_close=null;

			battleUI.__super.call(this);
		}

		CLASS$(battleUI,'ui.battleUI',_super);
		var __proto__=battleUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(battleUI.uiView);

		}

		battleUI.uiView={"type":"View","props":{"width":720,"top":0,"right":0,"left":0,"height":1280,"bottom":0},"child":[{"type":"Sprite","props":{"var":"p0"},"child":[{"type":"Box","props":{"y":748,"x":403,"width":221,"visible":false,"var":"stick","height":210,"anchorY":0.5,"anchorX":0.5},"child":[{"type":"Image","props":{"y":104,"x":120,"var":"stickBg","skin":"ui/b_wheel_2.png","scaleY":0.9,"scaleX":0.9,"anchorY":0.5,"anchorX":0.5}},{"type":"Image","props":{"y":83,"x":117,"var":"stickSign","skin":"ui/b_wheel_1.png","scaleY":0.8,"scaleX":0.8,"anchorY":0.5,"anchorX":0.5}}]},{"type":"Image","props":{"y":2,"x":3,"width":267,"skin":"ui/f_vessel_10.png","height":163,"sizeGrid":"7,15,7,27"}},{"type":"Box","props":{"y":8,"x":10,"name":"item0"},"child":[{"type":"Image","props":{"y":-2,"x":3,"width":25,"name":"photo","height":25}},{"type":"Label","props":{"y":0,"x":34,"width":104,"text":"name1234567","name":"pName","height":19,"fontSize":20,"color":"#ffffff","align":"left"}},{"type":"Label","props":{"y":3,"x":186,"width":58,"text":"19000","name":"pScore","height":19,"fontSize":20,"color":"#ffffff","align":"right"}}]},{"type":"Box","props":{"y":38,"x":10,"name":"item1"},"child":[{"type":"Image","props":{"y":-2,"x":3,"width":25,"name":"photo","height":25}},{"type":"Label","props":{"y":0,"x":34,"width":104,"text":"name1234567","name":"pName","height":19,"fontSize":20,"color":"#ffffff","align":"left"}},{"type":"Label","props":{"y":3,"x":186,"width":58,"text":"19000","name":"pScore","height":19,"fontSize":20,"color":"#ffffff","align":"right"}}]},{"type":"Box","props":{"y":68,"x":10,"name":"item2"},"child":[{"type":"Image","props":{"y":-2,"x":3,"width":25,"name":"photo","height":25}},{"type":"Label","props":{"y":0,"x":34,"width":104,"text":"name1234567","name":"pName","height":19,"fontSize":20,"color":"#ffffff","align":"left"}},{"type":"Label","props":{"y":3,"x":186,"width":58,"text":"19000","name":"pScore","height":19,"fontSize":20,"color":"#ffffff","align":"right"}}]},{"type":"Box","props":{"y":98,"x":10,"name":"item3"},"child":[{"type":"Image","props":{"y":-2,"x":3,"width":25,"name":"photo","height":25}},{"type":"Label","props":{"y":0,"x":34,"width":104,"text":"name1234567","name":"pName","height":19,"fontSize":20,"color":"#ffffff","align":"left"}},{"type":"Label","props":{"y":3,"x":186,"width":58,"text":"19000","name":"pScore","height":19,"fontSize":20,"color":"#ffffff","align":"right"}}]},{"type":"Box","props":{"y":128,"x":10,"name":"item4"},"child":[{"type":"Image","props":{"y":-2,"x":3,"width":25,"name":"photo","height":25}},{"type":"Label","props":{"y":0,"x":34,"width":104,"text":"name1234567","name":"pName","height":19,"fontSize":20,"color":"#ffffff","align":"left"}},{"type":"Label","props":{"y":3,"x":186,"width":58,"text":"19000","name":"pScore","height":19,"fontSize":20,"color":"#ffffff","align":"right"}}]},{"type":"Box","props":{"y":163,"x":11,"var":"yourScore"},"child":[{"type":"Image","props":{"y":2,"x":3,"width":25,"name":"photo","height":25}},{"type":"Label","props":{"y":3,"x":34,"width":78,"text":"name1234567","name":"pName","height":19,"fontSize":20,"color":"#37f308","align":"left"}},{"type":"Label","props":{"y":3,"x":186,"width":58,"text":"19000","name":"pScore","height":19,"fontSize":20,"color":"#37f308","align":"right"}}]}]},{"type":"Sprite","props":{"y":0,"x":720,"var":"p2"},"child":[{"type":"Box","props":{"y":155,"x":-114,"var":"leftCount","right":0},"child":[{"type":"Image","props":{"y":3,"x":-7,"skin":"ui/f_vessel_9.png"}},{"type":"FontClip","props":{"y":15,"x":-1,"width":63,"var":"remain","value":"120","skin":"ui/sz.png","sheet":"0123456789","rotation":0,"height":30,"align":"center"}}]},{"type":"Box","props":{"y":86,"x":-114,"var":"killCount","right":0},"child":[{"type":"Image","props":{"y":0,"x":0,"skin":"ui/t_vessel_1.png","name":"Bg"}},{"type":"FontClip","props":{"y":13,"x":0,"width":57,"var":"kill","value":"99","skin":"ui/sz.png","sheet":"0123456789","rotation":0,"height":30,"align":"center"}}]}]},{"type":"Sprite","props":{"y":640,"x":360,"var":"p4"},"child":[{"type":"Image","props":{"y":-87,"x":-115,"visible":false,"var":"lvlup","skin":"ui/f_pic_lv.png"}},{"type":"Image","props":{"y":-258,"x":-11,"visible":false,"var":"countDown","skin":"ui/countDown3.png","anchorY":0.5,"anchorX":0.5}},{"type":"Box","props":{"y":360,"x":0,"width":378,"visible":false,"var":"tutorial","height":362,"anchorY":0.5,"anchorX":0.5},"child":[{"type":"Image","props":{"width":378,"skin":"ui/b_vessel_5.png","height":304}},{"type":"Image","props":{"y":194,"x":188,"var":"tutorial_sign","skin":"ui/b_pic_5.png","anchorY":0.5,"anchorX":0.5}},{"type":"Image","props":{"y":246,"x":110,"var":"hand","skin":"ui/b_pic_4.png","anchorY":0.5,"anchorX":0.5}},{"type":"Label","props":{"y":12,"x":37,"width":304,"var":"tutorial_text","text":"Drag to Move","stroke":4,"rotation":0,"height":50,"fontSize":40,"font":"Microsoft YaHei","color":"#ffffff","bold":true,"align":"center"}},{"type":"Label","props":{"y":71,"x":4,"width":370,"var":"tutorial_text2","text":"Stop to Attack","stroke":4,"rotation":0,"height":50,"fontSize":40,"font":"Microsoft YaHei","color":"#ffffff","bold":true,"align":"center"}}]},{"type":"Box","props":{"y":-243,"var":"comboCount","anchorY":0.5,"anchorX":0.5},"child":[{"type":"Image","props":{"y":6,"skin":"ui/f_pic_combo.png"}},{"type":"FontClip","props":{"x":27,"width":88,"var":"combo","value":"2","skin":"ui/shuzi.png","sheet":"0123456789","rotation":0,"height":55,"align":"center"}}]},{"type":"Label","props":{"y":-507,"x":23,"width":644,"visible":false,"var":"warning","text":"10","strokeColor":"#000000","height":59,"fontSize":100,"font":"Microsoft YaHei","color":"#f4dd30","bold":true,"anchorY":0.5,"anchorX":0.5,"align":"center"}},{"type":"Image","props":{"y":-401,"x":12,"width":435,"var":"report","skin":"ui/reportBg.png","scaleY":1,"scaleX":1,"pivotY":43,"pivotX":219,"height":86},"child":[{"type":"Image","props":{"y":42,"x":222,"width":314,"var":"reportC","skin":"ui/report1.png","pivotY":32,"pivotX":154,"height":59}}]},{"type":"Image","props":{"y":-179,"x":-153,"var":"WudiFengHuoLun","skin":"ui/Huo.png"}}]},{"type":"Box","props":{"width":500,"var":"buffRebornText","height":500,"centerY":0,"centerX":0},"child":[{"type":"Text","props":{"y":-131,"x":21,"width":500,"text":"Get super Resurrection","height":96,"fontSize":40,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}}]},{"type":"Box","props":{"y":260,"x":57,"var":"reborn"},"child":[{"type":"Image","props":{"y":0,"x":0,"width":593,"skin":"ui/game_plate2.png","height":552}},{"type":"Image","props":{"y":193,"x":324,"skin":"ui/f_pic_pow.png","scaleY":1.5,"scaleX":1.5,"name":"buff","anchorY":0.5,"anchorX":0.5}},{"type":"Sprite","props":{"y":373,"x":188,"name":"weapon"},"child":[{"type":"Image","props":{"y":26,"x":29,"skin":"weapon/f_wq_19.png","scaleY":2,"scaleX":2,"rotation":-20,"name":"weapon","anchorY":0.8,"anchorX":0.5}}]},{"type":"Image","props":{"y":357,"x":312,"skin":"hero/f_hero_1.png","name":"actor","anchorY":0.6,"anchorX":0.5}},{"type":"Sprite","props":{"y":363,"x":315,"name":"tail"}},{"type":"Image","props":{"y":340,"x":313,"skin":"effect/shield.png","name":"shield","anchorY":0.5,"anchorX":0.5}},{"type":"Box","props":{"y":477,"x":226,"name":"normalReborn"},"child":[{"type":"Label","props":{"text":"Reborn to Lv1","stroke":2,"fontSize":25,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}}]},{"type":"Box","props":{"y":577,"x":125,"name":"buffReborn"},"child":[{"type":"Image","props":{"skin":"ui/button_off short.png","scaleY":1,"scaleX":1}},{"type":"Label","props":{"y":32,"x":103,"width":248,"text":"Gain Buff","strokeColor":"#000000","stroke":3,"height":61,"fontSize":40,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}},{"type":"Image","props":{"y":33,"x":31,"skin":"ui/k_pic_10.png"}},{"type":"Label","props":{"y":70,"x":27,"width":248,"visible":false,"text":"5s ad","strokeColor":"#000000","height":61,"fontSize":22,"font":"Microsoft YaHei","color":"#f94b4b","align":"left"}}]},{"type":"Label","props":{"y":46,"x":64,"text":"Reborn With Buff & Retain Level","stroke":2,"fontSize":34,"color":"#ffffff","bold":false}},{"type":"Image","props":{"y":9,"x":529,"var":"btn_close","skin":"ui/x.png","scaleY":1.2,"scaleX":1.2}}]}]};
		return battleUI;
	})(View);
var bossViewUI=(function(_super){
		function bossViewUI(){
			
		    this.btn_click=null;
		    this.hero=null;
		    this.wq=null;
		    this.monsterY=null;
		    this.hp=null;

			bossViewUI.__super.call(this);
		}

		CLASS$(bossViewUI,'ui.bossViewUI',_super);
		var __proto__=bossViewUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(bossViewUI.uiView);

		}

		bossViewUI.uiView={"type":"View","props":{"width":720,"height":1624},"child":[{"type":"Image","props":{"top":0,"skin":"ui/bg.png","right":0,"left":0,"bottom":0}},{"type":"Image","props":{"y":1045,"x":357,"var":"btn_click","skin":"ui/button_off short.png","anchorY":0.5,"anchorX":0.5},"child":[{"type":"Label","props":{"y":34,"x":118,"text":"点我","stroke":4,"fontSize":66,"color":"#ffffff","bold":true}}]},{"type":"Image","props":{"y":851,"x":363,"var":"hero","skin":"hero/f_hero_1.png","rotation":180,"anchorY":0.5,"anchorX":0.5}},{"type":"Box","props":{"y":630,"x":363,"width":34,"var":"wq","height":180,"anchorY":0.5,"anchorX":0.5},"child":[{"type":"Image","props":{"visible":false,"skin":"weapon/f_wq_1.png"}}]},{"type":"Image","props":{"y":66,"x":262,"skin":"hero/Monster.png","scaleY":0.8,"scaleX":0.8}},{"type":"Box","props":{"y":220,"x":352,"width":50,"var":"monsterY","height":50,"anchorY":0.5,"anchorX":0.5}},{"type":"Image","props":{"y":12,"x":240,"width":228,"skin":"ui/youzi_black.png","sizeGrid":"10,10,10,10","height":44},"child":[{"type":"Image","props":{"y":2,"x":2,"width":224,"var":"hp","skin":"ui/red.png","height":40}}]}]};
		return bossViewUI;
	})(View);
var mainUI=(function(_super){
		function mainUI(){
			
		    this.bg=null;
		    this.p4=null;
		    this.watchAdText=null;
		    this.actor=null;
		    this.dragArea=null;
		    this.ad5=null;
		    this.p0=null;
		    this.light=null;
		    this.moon=null;
		    this.c1=null;
		    this.c2=null;
		    this.skinbtn=null;
		    this.playerLevel=null;
		    this.p6=null;
		    this.btnSign=null;
		    this.signRedDot=null;
		    this.p1=null;
		    this.logo=null;
		    this.p7=null;
		    this.btnCondi=null;
		    this.btn_condi_num=null;
		    this.btnPlay=null;
		    this.play2=null;
		    this.p8=null;
		    this.btnMore=null;
		    this.btnskin=null;
		    this.getskin=null;
		    this.getskinbg=null;
		    this.watchADSkin=null;
		    this.showAdCnt=null;
		    this.closeSkinBtn=null;
		    this.blackbg=null;

			mainUI.__super.call(this);
		}

		CLASS$(mainUI,'ui.mainUI',_super);
		var __proto__=mainUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(mainUI.uiView);

		}

		mainUI.uiView={"type":"View","props":{"width":720,"height":1280},"child":[{"type":"Image","props":{"y":0,"x":0,"var":"bg","top":0,"skin":"ui/bg.png","right":0,"left":0,"bottom":0}},{"type":"Sprite","props":{"y":640,"x":360,"var":"p4"},"child":[{"type":"Image","props":{"y":98,"x":-177,"skin":"ui/t_pic_11.png"}},{"type":"Label","props":{"y":304,"x":4,"width":420,"var":"watchAdText","strokeColor":"#000000","stroke":4,"height":59,"fontSize":40,"font":"Microsoft YaHei","color":"#ffffff","anchorY":0.5,"anchorX":0.5,"align":"center"}},{"type":"Sprite","props":{"var":"actor"}},{"type":"Sprite","props":{"y":-236,"x":-352,"width":720,"var":"dragArea","height":414}},{"type":"Image","props":{"y":-217,"x":160,"var":"ad5","skin":"ui/f_btn_adlv5.png","scaleY":0.7,"scaleX":0.7,"anchorY":0.5,"anchorX":0.5}}]},{"type":"Sprite","props":{"y":0,"x":0,"var":"p0"},"child":[{"type":"Image","props":{"y":10,"x":594,"width":559,"var":"light","skin":"ui/f_pic_sx.png","pivotY":103,"pivotX":392,"height":550}},{"type":"Image","props":{"y":0,"x":585,"var":"moon","skin":"ui/f_pic_moon.png","anchorY":0.5,"anchorX":0.5}},{"type":"Image","props":{"y":-89,"x":-382,"var":"c1","skin":"ui/f_pic_yun.png","scaleY":1.5,"scaleX":1.5}},{"type":"Image","props":{"y":49,"x":393,"var":"c2","skin":"ui/f_pic_yun.png","scaleY":1.5,"scaleX":1.5}},{"type":"Image","props":{"y":410,"x":15,"var":"skinbtn","skin":"ui/SkinIcon.png"}},{"type":"Box","props":{"y":267,"x":11,"var":"playerLevel"},"child":[{"type":"Image","props":{"y":0,"x":70,"width":271,"skin":"ui/strat_btn.png","height":74}},{"type":"Image","props":{"y":37,"x":0,"width":398,"skin":"ui/exp.png","height":74}},{"type":"Image","props":{"y":16,"x":3,"skin":"ui/crown.png"}},{"type":"Label","props":{"y":52,"x":28,"text":"Win：","stroke":4,"fontSize":36,"color":"#ffffff","bold":true}},{"type":"Label","props":{"y":52,"x":208,"text":"Lv：","stroke":4,"fontSize":36,"color":"#ffffff","bold":true}},{"type":"FontClip","props":{"y":8,"x":119,"width":76,"value":"10","skin":"ui/sz.png","sheet":"0123456789","scaleY":0.9,"scaleX":0.9,"name":"exp","height":30,"align":"right"}},{"type":"Image","props":{"y":8,"x":183,"skin":"ui/xie.png","scaleY":0.9,"scaleX":0.9,"name":"levelExpSlash"}},{"type":"FontClip","props":{"y":8,"x":198,"width":94,"value":"100","skin":"ui/sz.png","sheet":"0123456789","scaleY":0.9,"scaleX":0.9,"name":"expMax","height":30,"align":"left"}},{"type":"FontClip","props":{"y":58,"x":108,"width":84,"value":"1","skin":"ui/sz.png","sheet":"0123456789","name":"winCount","height":30,"align":"center"}},{"type":"FontClip","props":{"y":59,"x":304,"width":50,"value":"1","skin":"ui/sz.png","sheet":"0123456789","name":"level","height":30,"align":"center"}}]}]},{"type":"Sprite","props":{"y":1280,"x":0,"var":"p6"},"child":[{"type":"Box","props":{"y":-321,"x":-2,"width":82,"var":"btnSign","height":88},"child":[{"type":"Image","props":{"visible":false,"var":"signRedDot","skin":"ui/t_pic_13.png","name":"btn_sign_rd"}},{"type":"Image","props":{"x":0,"width":85,"skin":"ui/t_btn_qd.png","name":"btn_sign","height":85}}]}]},{"type":"Sprite","props":{"y":0,"x":360,"var":"p1"},"child":[{"type":"Image","props":{"y":164,"x":1,"visible":false,"var":"logo","skin":"ui/f_logo.png","scaleY":0.3,"scaleX":0.3,"anchorY":0.5,"anchorX":0.5}}]},{"type":"Sprite","props":{"y":1280,"x":360,"var":"p7"},"child":[{"type":"Box","props":{"y":-269,"x":4,"var":"btnCondi","anchorY":0.5,"anchorX":0.5},"child":[{"type":"Image","props":{"y":-14,"x":-8,"width":372,"skin":"ui/button_off short.png","sizeGrid":"20,20,20,20"}},{"type":"Label","props":{"y":30,"x":101,"width":246,"var":"btn_condi_num","text":"Try Skin","strokeColor":"#000000","stroke":4,"fontSize":48,"color":"#ffffff","bold":true,"align":"center"}},{"type":"Image","props":{"y":21,"x":28,"skin":"ui/k_pic_10.png"}}]},{"type":"Box","props":{"y":-269,"x":4,"var":"btnPlay","anchorY":0.5,"anchorX":0.5},"child":[{"type":"Image","props":{"y":-20,"x":-25,"skin":"ui/button_off short.png","sizeGrid":"20,20,20,20"}},{"type":"Label","props":{"y":22,"x":88,"text":"PLAY","stroke":4,"fontSize":58,"color":"#ffffff","bold":true}}]},{"type":"Box","props":{"y":-150,"x":5,"visible":false,"var":"play2","scaleY":0.8,"scaleX":0.8,"anchorY":0.5,"anchorX":0.5},"child":[{"type":"Image","props":{"y":0,"x":0,"skin":"ui/f_btn_2.png"}},{"type":"Label","props":{"y":24,"x":25,"width":353,"text":"挑战好友","strokeColor":"#000000","stroke":4,"height":70,"fontSize":48,"font":"Microsoft YaHei","color":"#ffffff","bold":true,"align":"center"}}]}]},{"type":"Sprite","props":{"y":1280,"x":720,"var":"p8"},"child":[{"type":"Image","props":{"y":-115,"width":67,"visible":false,"var":"btnMore","skin":"ui/t_btn_gd.png","right":0,"height":73,"anchorY":0.5,"anchorX":1}},{"type":"Box","props":{"y":-278,"x":0,"width":79,"visible":true,"var":"btnskin","pivotY":44,"pivotX":85,"height":88},"child":[{"type":"Image","props":{"y":1,"width":85,"skin":"ui/f_btn_4.png","name":"btn_skin","height":85}},{"type":"Image","props":{"y":0,"x":0,"visible":false,"skin":"ui/t_pic_13.png","name":"skinRedDot"}}]}]},{"type":"Box","props":{"var":"getskin","top":0,"right":0,"left":0,"bottom":0},"child":[{"type":"Sprite","props":{"y":0,"x":0,"var":"getskinbg"}},{"type":"Image","props":{"y":113,"x":61,"skin":"ui/nazha.png"}},{"type":"Image","props":{"y":816,"x":109,"var":"watchADSkin","skin":"ui/watchAD.png"},"child":[{"type":"Label","props":{"y":38,"x":194,"text":"Watch AD","stroke":4,"fontSize":56,"color":"#ffffff"}}]},{"type":"Box","props":{"y":732,"x":322},"child":[{"type":"Text","props":{"y":0,"x":0,"width":48,"var":"showAdCnt","text":"1","height":49,"fontSize":30,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}},{"type":"Text","props":{"y":0,"x":33,"width":56,"text":"/ 2","height":45,"fontSize":30,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}}]},{"type":"Image","props":{"y":155,"x":584,"var":"closeSkinBtn","skin":"ui/close.png"}}]},{"type":"Box","props":{"var":"blackbg","top":0,"right":0,"left":0,"bottom":0}}]};
		return mainUI;
	})(View);
var main_matchingUI=(function(_super){
		function main_matchingUI(){
			
		    this.p4=null;
		    this.matchingPanel=null;
		    this.loading=null;
		    this.playerNum=null;

			main_matchingUI.__super.call(this);
		}

		CLASS$(main_matchingUI,'ui.main_matchingUI',_super);
		var __proto__=main_matchingUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(main_matchingUI.uiView);

		}

		main_matchingUI.uiView={"type":"View","props":{"width":720,"mouseEnabled":true,"height":1280},"child":[{"type":"Sprite","props":{"y":651,"x":366,"width":593,"var":"p4","pivotY":291,"pivotX":303,"height":597},"child":[{"type":"Box","props":{"var":"matchingPanel"},"child":[{"type":"Image","props":{"y":0,"x":0,"width":593,"skin":"ui/game_plate2.png","sizeGrid":"50,50,50,50","height":597}},{"type":"Image","props":{"y":219,"x":301,"var":"loading","skin":"ui/t_loading.png","scaleY":2,"scaleX":2,"anchorY":0.5,"anchorX":0.5}},{"type":"Image","props":{"y":422,"x":141,"skin":"ui/o_bg1.png"}},{"type":"Label","props":{"y":433,"width":203,"var":"playerNum","text":"57/60","strokeColor":"#000000","stroke":4,"height":46,"fontSize":34,"font":"Microsoft YaHei","color":"#ffffff","centerX":16,"align":"center"}},{"type":"Label","props":{"y":47,"x":153,"text":"Matching....","stroke":4,"fontSize":54,"color":"#ffffff","bold":true}}]},{"type":"Label","props":{"y":347,"x":149,"text":"Waiting for players...","stroke":4,"fontSize":32,"color":"#ffffff","bold":true}}]}]};
		return main_matchingUI;
	})(View);
var main_WsignUI=(function(_super){
		function main_WsignUI(){
			
		    this.item0=null;
		    this.item1=null;
		    this.item2=null;
		    this.item3=null;
		    this.item4=null;
		    this.item5=null;
		    this.item6=null;
		    this.btnClose=null;
		    this.btnText=null;

			main_WsignUI.__super.call(this);
		}

		CLASS$(main_WsignUI,'ui.main_WsignUI',_super);
		var __proto__=main_WsignUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(main_WsignUI.uiView);

		}

		main_WsignUI.uiView={"type":"View","props":{"width":720,"top":0,"right":0,"left":0,"height":1280,"bottom":0},"child":[{"type":"Box","props":{"top":0,"right":0,"left":0,"bottom":0},"child":[{"type":"Box","props":{"width":644,"height":900,"centerY":0,"centerX":0},"child":[{"type":"Image","props":{"width":641,"skin":"ui/game_plate2.png","height":756}},{"type":"Image","props":{"y":-14,"x":73,"skin":"ui/menu title bg1.png","scaleY":0.6,"scaleX":0.6}},{"type":"Box","props":{"y":134,"x":92,"var":"item0"},"child":[{"type":"Image","props":{"width":146,"skin":"ui/f_vessel_5.png","name":"bg","height":146}},{"type":"Image","props":{"y":21,"x":20,"skin":"ui/f_vessel_6.png","name":"today"}},{"type":"Label","props":{"y":34,"x":-10,"width":60,"text":"Day 1","stroke":2,"rotation":-45,"height":31,"fontSize":22,"font":"Microsoft YaHei","color":"#ffffff"}},{"type":"Image","props":{"y":5,"x":16,"skin":"hero/f_hero_4.png","scaleY":0.5,"scaleX":0.5,"rotation":0,"name":"item"}},{"type":"Image","props":{"y":48,"x":38,"skin":"ui/t_pic_27.png","name":"msk"}}]},{"type":"Box","props":{"y":134,"x":262,"var":"item1"},"child":[{"type":"Image","props":{"width":146,"skin":"ui/f_vessel_5.png","name":"bg","height":146}},{"type":"Image","props":{"y":21,"x":20,"skin":"ui/f_vessel_6.png","name":"today"}},{"type":"Image","props":{"y":6,"x":15,"skin":"hero/f_hero_6.png","scaleY":0.5,"scaleX":0.5,"rotation":0,"name":"item"}},{"type":"Label","props":{"y":34,"x":-10,"width":60,"text":"Day 2","stroke":2,"rotation":-45,"height":31,"fontSize":22,"font":"Microsoft YaHei","color":"#ffffff"}},{"type":"Image","props":{"y":48,"x":38,"skin":"ui/t_pic_27.png","name":"msk"}}]},{"type":"Box","props":{"y":134,"x":432,"var":"item2"},"child":[{"type":"Image","props":{"width":146,"skin":"ui/f_vessel_5.png","name":"bg","height":146}},{"type":"Image","props":{"y":21,"x":20,"skin":"ui/f_vessel_6.png","name":"today"}},{"type":"Image","props":{"y":4,"x":16,"skin":"hero/f_hero_9.png","scaleY":0.5,"scaleX":0.5,"rotation":0,"name":"item"}},{"type":"Label","props":{"y":34,"x":-10,"width":60,"text":"Day 3","stroke":2,"rotation":-45,"height":31,"fontSize":22,"font":"Microsoft YaHei","color":"#ffffff"}},{"type":"Image","props":{"y":48,"x":38,"skin":"ui/t_pic_27.png","name":"msk"}}]},{"type":"Box","props":{"y":306,"x":92,"var":"item3"},"child":[{"type":"Image","props":{"width":146,"skin":"ui/f_vessel_5.png","name":"bg","height":146}},{"type":"Image","props":{"y":21,"x":20,"skin":"ui/f_vessel_6.png","name":"today"}},{"type":"Image","props":{"y":4,"x":12,"skin":"hero/f_hero_11.png","scaleY":0.5,"scaleX":0.5,"rotation":0,"name":"item"}},{"type":"Label","props":{"y":34,"x":-10,"width":60,"text":"Day 4","stroke":2,"rotation":-45,"height":31,"fontSize":22,"font":"Microsoft YaHei","color":"#ffffff"}},{"type":"Image","props":{"y":48,"x":38,"skin":"ui/t_pic_27.png","name":"msk"}}]},{"type":"Box","props":{"y":306,"x":262,"var":"item4"},"child":[{"type":"Image","props":{"width":146,"skin":"ui/f_vessel_5.png","name":"bg","height":146}},{"type":"Image","props":{"y":21,"x":20,"skin":"ui/f_vessel_6.png","name":"today"}},{"type":"Image","props":{"y":5,"x":14,"skin":"hero/f_hero_13.png","scaleY":0.5,"scaleX":0.5,"rotation":0,"name":"item"}},{"type":"Label","props":{"y":34,"x":-10,"width":60,"text":"Day 5","stroke":2,"rotation":-45,"height":31,"fontSize":22,"font":"Microsoft YaHei","color":"#ffffff"}},{"type":"Image","props":{"y":48,"x":38,"skin":"ui/t_pic_27.png","name":"msk"}}]},{"type":"Box","props":{"y":306,"x":432,"var":"item5"},"child":[{"type":"Image","props":{"width":146,"skin":"ui/f_vessel_5.png","name":"bg","height":146}},{"type":"Image","props":{"y":21,"x":20,"skin":"ui/f_vessel_6.png","name":"today"}},{"type":"Image","props":{"y":11,"x":15,"skin":"hero/f_hero_15.png","scaleY":0.5,"scaleX":0.5,"rotation":0,"name":"item"}},{"type":"Label","props":{"y":34,"x":-10,"width":60,"text":"Day 6","stroke":2,"rotation":-45,"height":31,"fontSize":22,"font":"Microsoft YaHei","color":"#ffffff"}},{"type":"Image","props":{"y":48,"x":38,"skin":"ui/t_pic_27.png","name":"msk"}}]},{"type":"Box","props":{"y":497,"x":176,"var":"item6"},"child":[{"type":"Image","props":{"y":-44,"x":-39,"width":236,"skin":"ui/f_vessel_8.png","name":"bg","height":236}},{"type":"Image","props":{"y":-12,"x":-7,"skin":"ui/f_vessel_6.png","scaleY":1.6,"scaleX":1.6,"name":"today"}},{"type":"Label","props":{"y":11,"x":-29,"width":60,"text":"Day 7","stroke":2,"rotation":-45,"height":31,"fontSize":22,"font":"Microsoft YaHei","color":"#ffffff"}},{"type":"Image","props":{"y":197,"x":2,"skin":"weapon/f_wq_42.png","rotation":270}},{"type":"Image","props":{"y":-26,"x":2,"skin":"hero/f_hero_7.png","scaleY":0.7,"scaleX":0.7}},{"type":"Image","props":{"y":49,"x":45,"skin":"ui/t_pic_27.png","name":"msk"}}]},{"type":"Box","props":{"y":772,"x":178,"var":"btnClose"},"child":[{"type":"Image","props":{"y":0,"x":0,"width":595,"skin":"ui/button_off short.png","scaleY":0.5,"scaleX":0.5,"height":236}},{"type":"Label","props":{"y":22,"x":32,"width":248,"var":"btnText","text":"Gain Prize","strokeColor":"#000000","stroke":4,"height":61,"fontSize":48,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}}]},{"type":"Label","props":{"y":34,"x":288,"text":"Sign","fontSize":54,"color":"#ffffff","bold":true}}]}]}]};
		return main_WsignUI;
	})(View);
var main_WskinUI=(function(_super){
		function main_WskinUI(){
			
		    this.btnClose=null;
		    this.btnText=null;
		    this.weapon1=null;
		    this.hero2=null;
		    this.weapon2=null;
		    this.hero1=null;
		    this.hero=null;
		    this.weapon=null;

			main_WskinUI.__super.call(this);
		}

		CLASS$(main_WskinUI,'ui.main_WskinUI',_super);
		var __proto__=main_WskinUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(main_WskinUI.uiView);

		}

		main_WskinUI.uiView={"type":"View","props":{"width":720,"height":1280},"child":[{"type":"Box","props":{"top":0,"right":0,"left":0,"bottom":0},"child":[{"type":"Box","props":{"width":546,"height":900,"centerY":0,"centerX":0},"child":[{"type":"Image","props":{"y":78,"x":0,"width":555,"skin":"ui/bg.png","sizeGrid":"0,0,0,0","name":"WinBg","height":684}},{"type":"Box","props":{"y":770,"x":148,"var":"btnClose"},"child":[{"type":"Image","props":{"y":0,"x":0,"width":526,"skin":"ui/button_off short.png","scaleY":0.5,"scaleX":0.5,"height":216}},{"type":"Label","props":{"y":19,"x":51,"width":174,"var":"btnText","valign":"middle","text":"Close","strokeColor":"#000000","stroke":4,"height":61,"fontSize":42,"color":"#ffffff","align":"center"}}]},{"type":"Box","props":{"y":0,"x":201,"var":"weapon1"},"child":[{"type":"Image","props":{"y":0,"x":0,"skin":"ui/f_btn_5.png"}},{"type":"Image","props":{"y":1,"x":86,"skin":"ui/f_pic_5.png"}}]},{"type":"Box","props":{"y":15,"x":0,"var":"hero2"},"child":[{"type":"Image","props":{"y":1,"skin":"ui/f_btn_6.png"}},{"type":"Image","props":{"y":1,"x":64,"skin":"ui/f_pic_4.png","scaleY":0.8,"scaleX":0.8}}]},{"type":"Box","props":{"y":12,"x":262,"var":"weapon2"},"child":[{"type":"Image","props":{"y":4,"skin":"ui/f_btn_6.png"}},{"type":"Image","props":{"y":9,"x":68,"skin":"ui/f_pic_5.png","scaleY":0.8,"scaleX":0.8}}]},{"type":"Box","props":{"y":0,"x":0,"var":"hero1"},"child":[{"type":"Image","props":{"y":0,"x":0,"skin":"ui/f_btn_5.png"}},{"type":"Image","props":{"y":1,"x":86,"skin":"ui/f_pic_4.png"}}]},{"type":"List","props":{"y":108,"x":19,"width":518,"var":"hero","spaceY":12,"spaceX":15,"repeatY":5,"repeatX":3,"height":610},"child":[{"type":"Box","props":{"y":17,"x":0,"name":"render"},"child":[{"type":"Image","props":{"y":25,"x":6,"width":146,"skin":"ui/f_vessel_5.png","name":"bg","height":146}},{"type":"Image","props":{"x":1,"skin":"hero/f_hero_1.png","scaleY":0.7,"scaleX":0.7,"rotation":0,"name":"item"}},{"type":"Label","props":{"y":182,"x":9,"width":140,"rotation":0,"height":31,"fontSize":22,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}},{"type":"Image","props":{"y":134,"x":92,"skin":"ui/t_pic_27.png","name":"msk"}},{"type":"Image","props":{"y":23,"skin":"ui/t_pic_29.png","scaleY":1.5,"scaleX":1.5,"name":"lvBg"}},{"type":"FontClip","props":{"y":38,"x":6,"width":63,"value":"99","skin":"ui/sz.png","sheet":"0123456789","scaleY":0.5,"scaleX":0.5,"name":"lvNum","height":30,"align":"center"}}]}]},{"type":"List","props":{"y":108,"x":13,"width":532,"var":"weapon","spaceY":12,"spaceX":5,"repeatY":15,"repeatX":3,"height":617},"child":[{"type":"Box","props":{"y":-19,"x":0,"name":"render"},"child":[{"type":"Image","props":{"y":25,"x":6,"width":146,"skin":"ui/f_vessel_5.png","name":"bg","height":146}},{"type":"Image","props":{"y":12,"x":123,"skin":"weapon/f_wq_26.png","scaleY":1,"scaleX":1,"rotation":45,"name":"item"}},{"type":"Label","props":{"y":182,"x":9,"width":140,"rotation":0,"height":31,"fontSize":22,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}},{"type":"Image","props":{"y":134,"x":92,"skin":"ui/t_pic_27.png","name":"msk"}},{"type":"Image","props":{"y":23,"skin":"ui/t_pic_29.png","scaleY":1.5,"scaleX":1.5,"name":"lvBg"}},{"type":"FontClip","props":{"y":39,"x":5,"width":63,"value":"99","skin":"ui/sz.png","sheet":"0123456789","scaleY":0.5,"scaleX":0.5,"name":"lvNum","height":30,"align":"center"}}]}]}]}]}]};
		return main_WskinUI;
	})(View);
var popSkinUI=(function(_super){
		function popSkinUI(){
			
		    this.p4=null;
		    this.matchingPanel=null;
		    this.tittle=null;
		    this.Tittle=null;
		    this.btnAd=null;
		    this.btnClose=null;

			popSkinUI.__super.call(this);
		}

		CLASS$(popSkinUI,'ui.popSkinUI',_super);
		var __proto__=popSkinUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(popSkinUI.uiView);

		}

		popSkinUI.uiView={"type":"View","props":{"width":720,"mouseEnabled":true,"height":1280},"child":[{"type":"Sprite","props":{"y":640,"x":360,"var":"p4"},"child":[{"type":"Box","props":{"y":-12,"x":-30,"width":613,"var":"matchingPanel","height":404,"anchorY":0.5,"anchorX":0.5},"child":[{"type":"Box","props":{"y":-7,"x":32,"var":"tittle"},"child":[{"type":"Image","props":{"y":7,"x":-32,"skin":"ui/f_vessel_2.png","name":"tittleBg"}},{"type":"Label","props":{"y":14,"x":-6,"width":244,"var":"Tittle","text":"免费皮肤","strokeColor":"#000000","stroke":4,"height":46,"fontSize":36,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}}]},{"type":"Image","props":{"y":58,"x":58,"width":555,"skin":"ui/f_vessel_3.png","name":"WinBg","height":346}},{"type":"Image","props":{"y":93,"x":205,"skin":"hero/f_hero_3.png"}}]},{"type":"Box","props":{"y":283,"x":-7,"var":"btnAd","anchorY":0.5,"anchorX":0.5},"child":[{"type":"Image","props":{"y":-20,"x":0,"width":400,"skin":"ui/f_btn_1.png","name":"bg","height":134}},{"type":"Image","props":{"y":16,"x":60,"skin":"ui/k_pic_10.png"}}]},{"type":"Label","props":{"y":234,"width":235,"text":"免费领取","strokeColor":"#000000","stroke":4,"height":46,"fontSize":50,"font":"Microsoft YaHei","color":"#ffffff","centerX":-73,"align":"center"}},{"type":"Box","props":{"y":426,"x":-5,"var":"btnClose","anchorY":0.5,"anchorX":0.5},"child":[{"type":"Image","props":{"width":298,"skin":"ui/f_btn_2.png","height":105}},{"type":"Label","props":{"y":24,"x":31,"width":236,"text":"返回大厅","strokeColor":"#000000","stroke":4,"height":57,"fontSize":36,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}}]}]}]};
		return popSkinUI;
	})(View);
var resultUI=(function(_super){
		function resultUI(){
			
		    this.p0=null;
		    this.playerLevel=null;
		    this.lightBg=null;
		    this.winLogo=null;
		    this.botPanel=null;
		    this.killCount=null;
		    this.kill=null;
		    this.expCount=null;
		    this.exp=null;
		    this.loseLogo=null;
		    this.rank=null;
		    this.btnNext=null;
		    this.btnAd=null;
		    this.ADExp=null;

			resultUI.__super.call(this);
		}

		CLASS$(resultUI,'ui.resultUI',_super);
		var __proto__=resultUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(resultUI.uiView);

		}

		resultUI.uiView={"type":"View","props":{"width":720,"top":0,"right":0,"left":0,"height":1280,"bottom":0},"child":[{"type":"Sprite","props":{"y":0,"x":0,"visible":false,"var":"p0"},"child":[{"type":"Box","props":{"y":111,"x":5,"width":271,"var":"playerLevel","pivotX":0,"height":145,"anchorY":0.5},"child":[{"type":"Image","props":{"y":0,"x":0,"skin":"ui/b_vessel_5.png","name":"levelBg"}},{"type":"Image","props":{"y":43,"x":78,"width":80,"pivotY":40,"pivotX":40,"name":"photo","height":80}},{"type":"FontClip","props":{"y":54,"x":122,"width":91,"value":"1","skin":"ui/sz.png","sheet":"0123456789","name":"winCount","height":30,"align":"center"}},{"type":"FontClip","props":{"y":96,"x":7,"width":50,"value":"1","skin":"ui/sz.png","sheet":"0123456789","name":"level","height":30,"align":"center"}},{"type":"Image","props":{"y":114,"x":74,"skin":"ui/t_plan_1.png","name":"bar","anchorY":0.5}},{"type":"FontClip","props":{"y":103,"x":85,"width":76,"value":"10","skin":"ui/sz.png","sheet":"0123456789","scaleY":0.9,"scaleX":0.9,"name":"exp","height":30,"align":"right"}},{"type":"Image","props":{"y":103,"x":149,"skin":"ui/xie.png","scaleY":0.9,"scaleX":0.9,"name":"levelExpSlash"}},{"type":"FontClip","props":{"y":103,"x":164,"width":94,"value":"100","skin":"ui/sz.png","sheet":"0123456789","scaleY":0.9,"scaleX":0.9,"name":"expMax","height":30,"align":"left"}}]}]},{"type":"Box","props":{"top":0,"right":0,"left":0,"bottom":0},"child":[{"type":"Box","props":{"width":719,"height":900,"centerY":0,"centerX":-3},"child":[{"type":"Box","props":{"y":315,"x":366,"width":1038,"var":"lightBg","rotation":0,"pivotY":512,"pivotX":515,"height":1057},"child":[{"type":"Image","props":{"y":512,"x":511.0000274379761,"skin":"ui/t_pic_20.png","name":"light0","anchorY":1,"anchorX":1}},{"type":"Image","props":{"y":1,"x":511.0000274379761,"skin":"ui/t_pic_20.png","rotation":90,"name":"light1","anchorY":1}},{"type":"Image","props":{"y":1025,"x":1024,"skin":"ui/t_pic_20.png","rotation":180,"name":"light3"}},{"type":"Image","props":{"y":1024,"x":0.000027437976143573906,"skin":"ui/t_pic_20.png","scaleX":-1,"rotation":180,"name":"light2"}}]},{"type":"Box","props":{"y":328,"x":364,"width":475,"var":"winLogo","pivotY":167,"pivotX":241,"height":322},"child":[{"type":"Image","props":{"x":119,"skin":"ui/t_pic_22.png"}},{"type":"Image","props":{"y":51,"skin":"ui/t_pic_21.png"}},{"type":"Image","props":{"y":55,"x":481,"skin":"ui/t_pic_21.png","skewX":0,"scaleX":-1,"rotation":0,"pivotX":0}},{"type":"Image","props":{"y":196,"x":1,"skin":"ui/t_pic_25.png"}},{"type":"Label","props":{"y":64,"x":157,"width":168,"text":"1","strokeColor":"#000000","stroke":4,"height":127,"fontSize":100,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}}]},{"type":"Box","props":{"y":484,"x":129,"width":497,"var":"botPanel","height":548},"child":[{"type":"Box","props":{"var":"killCount"},"child":[{"type":"Image","props":{"skin":"ui/t_vessel_12.png"}},{"type":"Image","props":{"y":13,"x":29.5,"skin":"ui/b_pic_KILL1.png"}},{"type":"FontClip","props":{"y":54,"x":110,"width":66,"var":"kill","value":"99","skin":"ui/sz.png","sheet":"0123456789","scaleY":1.5,"scaleX":1.5,"height":30,"align":"center"}}]},{"type":"Box","props":{"x":240,"var":"expCount"},"child":[{"type":"Image","props":{"skin":"ui/t_vessel_12.png"}},{"type":"Image","props":{"y":20,"x":21,"skin":"ui/t_pic_15.png","scaleY":0.3,"scaleX":0.3}},{"type":"FontClip","props":{"y":59,"x":74,"width":93,"var":"exp","value":"999","skin":"ui/sz.png","sheet":"0123456789","scaleY":1.5,"scaleX":1.5,"height":30,"align":"left"}},{"type":"Image","props":{"y":54,"x":41,"skin":"ui/plus.png","scaleY":1.5,"scaleX":1.5}}]}]},{"type":"Box","props":{"y":294,"x":365,"width":208,"var":"loseLogo","pivotY":114,"pivotX":101,"height":227},"child":[{"type":"Image","props":{"skin":"ui/t_pic_23.png"}},{"type":"Label","props":{"y":111,"x":98,"width":109,"var":"rank","text":"2","strokeColor":"#000000","stroke":4,"height":115,"fontSize":90,"font":"Microsoft YaHei","color":"#ffffff","anchorY":0.5,"anchorX":0.5,"align":"center"}}]},{"type":"Box","props":{"y":761,"x":279,"width":192,"var":"btnNext","height":84},"child":[{"type":"Image","props":{"y":40,"x":18,"width":163,"skin":"ui/downline.png","height":60}},{"type":"Label","props":{"y":10,"x":-20,"width":236,"text":"Next Game","strokeColor":"#000000","stroke":4,"height":57,"fontSize":36,"font":"Microsoft YaHei","color":"#ffffff","align":"center"}}]},{"type":"Box","props":{"y":679,"x":386,"width":400,"var":"btnAd","pivotY":54,"pivotX":200,"height":128},"child":[{"type":"Image","props":{"y":0,"x":0,"width":400,"skin":"ui/f_btn_1.png","name":"bg","height":134}},{"type":"Image","props":{"y":36,"x":26,"skin":"ui/k_pic_10.png"}},{"type":"Image","props":{"y":43,"x":125,"skin":"ui/t_pic_15.png","scaleY":0.35,"scaleX":0.35}},{"type":"FontClip","props":{"y":43,"x":273,"width":68,"var":"ADExp","value":"100","skin":"ui/sz.png","sheet":"0123456789","scaleY":1.5,"scaleX":1.5,"height":30,"align":"center"}},{"type":"Image","props":{"y":37,"x":235,"width":24,"skin":"ui/plus.png","scaleY":1.5,"scaleX":1.5,"height":30}}]}]}]}]};
		return resultUI;
	})(View);