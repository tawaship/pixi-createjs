(function() {
	function CreatejsApplication(id, rootName, basepath, pixiOptions) {
		var comp = AdobeAn.getComposition(id);
		if (!comp) {
			throw new Error('no composition');
		}
		
		var lib = comp.getLibrary();
		var root = lib[rootName];
		if (!root) {
			throw new Error('no root class');
		}
		
		var prop = lib.properties;
		
		pixiOptions = pixiOptions || {};
		pixiOptions.width = prop.width;
		pixiOptions.height = prop.height;
		pixiOptions.autoStart = false;
		pixiOptions.backgroundColor = parseInt(prop.color.slice(1), 16);
		
		var app = this._app = new PIXI.Application(pixiOptions);
		
		this._composition = comp;
		this._rootClass = root;
		this._basepath = basepath;
		
		createjs.Ticker.framerate = prop.fps;
		
		function handlePlay(e) {
			stage._tickFunction(e);
			app.render();
		}
		
		Object.defineProperties(this, {
			play: {
				value: function() {
					createjs.Ticker.addEventListener('tick', handlePlay);
				}
			},
			
			stop: {
				value: function() {
					createjs.Ticker.removeEventListener('tick', handlePlay);
				}
			}
		});
	}
	
	Object.defineProperties(CreatejsApplication.prototype, {
		app: {
			get: function() {
				return this._app;
			},
			set: function(v) {
			
			}
		},
		initAsync: {
			value: function(options) {
				var app = this;
				var rootClass = this._rootClass;
				
				return initAsync(this._basepath, this._composition)
					.then(function(data) {
						var evt = data.evt;
						var comp = data.comp;
						
						var lib = comp.getLibrary();
						var ss = comp.getSpriteSheet();
						var queue = evt.target;
						var ssMetadata = lib.ssMetadata;
						
						for (var i = 0; i < ssMetadata.length; i++) {
							ss[ssMetadata[i].name] = new createjs.SpriteSheet({
								images: [
									queue.getResult(ssMetadata[i].name)
								],
								frames: ssMetadata[i].frames
							});
						}
						
						var exportRoot = new rootClass();
						
						var stage = new lib.Stage();
						initStage(stage, options);
						
						Object.defineProperties(window, {
							exportRoot: {
								value: exportRoot
							},
							
							stage: {
								value: stage
							}
						});
						
						AdobeAn.compositionLoaded(lib.properties.id);
						
						app.app.render();
						
						stage.addChild(exportRoot);
						app.app.stage.addChild(exportRoot._pixiData.instance);
					});
			}
		}
	});
	
	PIXI.createjs = Object.defineProperties({}, {
		Player: {
			value: CreatejsApplication
		}
	});
	

})();