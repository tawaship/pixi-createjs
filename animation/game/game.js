(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [
		{name:"game_atlas_", frames: [[0,164,63,63],[0,0,80,80],[0,82,80,80]]}
];


// symbols:



(lib.CachedBmp_40 = function() {
	this.initialize(ss["game_atlas_"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_45 = function() {
	this.initialize(ss["game_atlas_"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_39 = function() {
	this.initialize(ss["game_atlas_"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.gra = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// レイヤー_1
	this.instance = new lib.CachedBmp_40();
	this.instance.setTransform(-15.75,-15.75,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-15.7,-15.7,31.5,31.5);


(lib.anim = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// レイヤー_2
	this.instance = new lib.CachedBmp_39();
	this.instance.setTransform(36.5,274.55,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_45();
	this.instance_1.setTransform(36.5,274.55,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},20).to({state:[{t:this.instance_1}]},10).to({state:[]},1).to({state:[{t:this.instance_1}]},8).wait(27));

	// レイヤー_1
	this.instance_2 = new lib.gra("synched",0);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1).to({rotation:7.8842},0).wait(1).to({rotation:15.7898},0).wait(1).to({rotation:23.7322},0).wait(1).to({rotation:31.7276},0).wait(1).to({rotation:39.7937},0).wait(1).to({rotation:47.9492},0).wait(1).to({rotation:56.2146},0).wait(1).to({rotation:64.6117},0).wait(1).to({rotation:73.164},0).wait(1).to({rotation:81.8968},0).wait(1).to({rotation:90.8376},0).wait(1).to({rotation:100.0158},0).wait(1).to({rotation:109.4634},0).wait(1).to({rotation:119.2148},0).wait(1).to({rotation:129.3074},0).wait(1).to({rotation:139.7816},0).wait(1).to({rotation:150.6813},0).wait(1).to({rotation:162.054},0).wait(1).to({rotation:173.9515},0).wait(1).to({rotation:186.4302},0).wait(1).to({rotation:199.5513},0).wait(1).to({rotation:213.3817},0).wait(1).to({rotation:227.9946},0).wait(1).to({rotation:243.4699},0).wait(1).to({rotation:259.8953},0).wait(1).to({rotation:277.367},0).wait(1).to({rotation:295.9906},0).wait(1).to({rotation:315.8828},0).wait(1).to({rotation:337.1719},0).wait(1).to({rotation:360},0).to({_off:true},1).wait(8).to({_off:false,rotation:387.9931,x:37.85,y:26.35},0).wait(1).to({rotation:387.7921,x:41.0747,y:28.5943},0).wait(1).to({rotation:387.5722,x:44.6031,y:31.05},0).wait(1).to({rotation:387.3311,x:48.4717,y:33.7425},0).wait(1).to({rotation:387.0662,x:52.7221,y:36.7007},0).wait(1).to({rotation:386.7745,x:57.4023,y:39.9581},0).wait(1).to({rotation:386.4526,x:62.5676,y:43.553},0).wait(1).to({rotation:386.0964,x:68.2818,y:47.5299},0).wait(1).to({rotation:385.7015,x:74.6191,y:51.9406},0).wait(1).to({rotation:385.2623,x:81.666,y:56.8451},0).wait(1).to({rotation:384.7726,x:89.5234,y:62.3137},0).wait(1).to({rotation:384.225,x:98.3094,y:68.4286},0).wait(1).to({rotation:383.6109,x:108.1625,y:75.2862},0).wait(1).to({rotation:382.9202,x:119.2447,y:82.9992},0).wait(1).to({rotation:382.1411,x:131.7458,y:91.6997},0).wait(1).to({rotation:381.2598,x:145.8863,y:101.5412},0).wait(1).to({rotation:380.2604,x:161.9205,y:112.7007},0).wait(1).to({rotation:379.1251,x:180.1369,y:125.379},0).wait(1).to({rotation:377.8339,x:200.8547,y:139.7982},0).wait(1).to({rotation:376.3656,x:224.4135,y:156.1947},0).wait(1).to({rotation:374.6991,x:251.1519,y:174.8041},0).wait(1).to({rotation:372.8156,x:281.3739,y:195.8381},0).wait(1).to({rotation:370.7011,x:315.301,y:219.4507},0).wait(1).to({rotation:368.3503,x:353.019,y:245.7018},0).wait(1).to({rotation:365.7692,x:394.4329,y:274.525},0).wait(1).to({rotation:362.976,x:439.2493,y:305.7164},0).wait(1).to({rotation:360,x:487,y:338.95},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-22.3,-22.3,525.1,377);


// stage content:
(lib.game = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// レイヤー_1
	this.instance = new lib.anim("synched",39);
	this.instance.setTransform(31.75,30.8);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(58));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(284.5,208.5,250,177);
// library properties:
lib.properties = {
	id: '2FA8E0C7230941478CE2CA3DB82DBEDF',
	width: 550,
	height: 400,
	fps: 60,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"images/game_atlas_.png?1596620439998", id:"game_atlas_"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.StageGL();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['2FA8E0C7230941478CE2CA3DB82DBEDF'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}


an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}			
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;			
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});			
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;			
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;