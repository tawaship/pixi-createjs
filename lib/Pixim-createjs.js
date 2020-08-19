(function() {
	function CreatejsApplication(id, rootName, basepath, pixiOptions, piximOpstions) {
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
		pixiOptions.backgroundColor = parseInt(prop.color.slice(1), 16);
		
		Pixim.Application.call(this, pixiOptions, piximOpstions);
		
		var app = this.app;
		
		this._composition = comp;
		this._rootClass = root;
		this._basepath = basepath;
		
		createjs.Ticker.framerate = prop.fps;
		
		function handlePlay(e) {
			stage._tickFunction();
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
	
	CreatejsApplication.prototype = Object.create(Pixim.Application.prototype);
	
	Object.defineProperties(CreatejsApplication.prototype, {
		initAsync: {
			value: function(options, vars) {
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
						
						var exportRoot = Object.create(rootClass.prototype);
						
						/*
						Object.defineProperties(exportRoot, {
							$: {
								value: vars || {}
							}
						});
						*/
						
						rootClass.call(exportRoot);
						
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
						
						var content = new Content();
						content.addVars({
							createjsRoot: exportRoot
						});
						
						app.app.render();
						
						stage.addChild(exportRoot);
						
						return app.attachAsync(content);
					});
			}
		}
	});
	
	var Content = Pixim.Content.create();
	
	function PiximRoot($) {
		Pixim.Container.call(this);
		
		this.addChild($.vars.createjsRoot._pixiData.instance);
	}
	
	PiximRoot.prototype = Object.create(Pixim.Container.prototype);
	
	Content.defineLibraries({
		root: PiximRoot
	});
	
	Pixim.createjs = Object.defineProperties({}, {
		Player: {
			value: CreatejsApplication
		}
	});
	
})();
