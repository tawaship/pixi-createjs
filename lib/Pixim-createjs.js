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
						Object.defineProperties(exportRoot, {
							$: {
								value: vars || {}
							}
						});
						
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
	
	var pixiObj = Pixim;
	
	/////////////////////////////////////////////////
	
	function initAsync(basepath, comp) {
		return new Promise(function(resolve, reject) {
			var lib = comp.getLibrary();
			
			if (lib.properties.manifest.length === 0) {
				resolve({
					evt: {},
					comp: comp
				});
			}
			
			var loader = new createjs.LoadQueue(false);
			
			loader.installPlugin(createjs.Sound);
			
			loader.addEventListener('fileload', function(evt) {
				handleFileLoad(evt, comp);
			});
			
			loader.addEventListener('complete', function(evt) {
				resolve({
					evt: evt,
					comp: comp
				});
			});
			
			var lib = comp.getLibrary();
			
			if (basepath) {
				basepath = (basepath + '/').replace(/\/\//g, '/');
				var m = lib.properties.manifest;
				for (var i = 0; i < m.length; i++) {
					m[i].src = basepath + m[i].src;
				}
			}
			
			loader.loadManifest(lib.properties.manifest);
		});
	}
	
	function handleFileLoad(evt, comp) {
		var images = comp.getImages();
		if (evt && (evt.item.type == 'image')) {
			images[evt.item.id] = evt.result;
		}
	}
	
	function initStage(stage, options) {
		options = options || {};
		
		if (options.useSynchedTimeline) {
			function containerDrawFunction() {
				var list = this.children.slice();
				for (var i = 0,l = list.length; i < l; i++) {
					var child = list[i];
					if (!child.isVisible()) { continue; }
					child.draw();
				}
				
				return true;
			};
			
			function imageDrawFunction() {
				return true;
			}
			
			Object.defineProperties(createjs.MovieClip.prototype, {
				draw: {
					value: function() {
						this._updateState();
						return this._containerDraw();
					}
				},
				
				_containerDraw: {
					value: containerDrawFunction
				}
			});
			
			var imageDescriptors = {
				draw: {
					value: imageDrawFunction
				}
			};
			
			Object.defineProperties(createjs.Sprite.prototype, imageDescriptors);
			Object.defineProperties(createjs.Graphics.prototype, imageDescriptors);
			Object.defineProperties(createjs.Shape.prototype, imageDescriptors);
			Object.defineProperties(createjs.Text.prototype, imageDescriptors);
			Object.defineProperties(createjs.Bitmap.prototype, imageDescriptors);
			
			stage.update = function(props) {
				if (this.tickOnUpdate) { this.tick(props); }
				this.dispatchEvent("drawstart");
				if (this.autoClear) { this.clear(); }
				
				if (this._webGLContext) {
					this._batchDraw(this, this._webGLContext);
					if (this._autoPurge != -1 && !(this._drawID%((this._autoPurge/2)|0))) {
						this.purgeTextures(this._autoPurge);
					}
				} else {
					this.draw();
				}
				
				this.dispatchEvent("drawend");
			}
			
			stage.draw = containerDrawFunction;
			
			stage._tickFunction = stage.update;
		} else {
			stage._tickFunction = stage.tick;
		}
	}
	
	var createjsOrigin = {
		DisplayObject: createjs.DisplayObject,
		MovieClip: createjs.MovieClip,
		Sprite: createjs.Sprite,
		Container: createjs.Container,
		Text: createjs.Text,
		Shape: createjs.Shape,
		Graphics: createjs.Graphics,
		ButtonHelper: createjs.ButtonHelper
	};
	
	function overrideCreatejs(self, pixi) {
		self._originParams = {
			x: 0,
			y: 0,
			scaleX: 0,
			scaleY: 0,
			regx: 0,
			regy: 0,
			skewX: 0,
			skewY: 0,
			rotation: 0,
			visible: true,
			alpha: 1,
			mask: null,
			filters: null
		};
		
		pixi._createjs = self;
		
		self._pixiData = {
			instance: pixi,
			regObj: pixi.anchor || pixi.pivot,
			events: {}
		};
	}
	
	var _downInstance;
	var _isDown = false;
	
	var EventMap = {
		mousedown: {
			types: ['pointerdown'],
			factory: function(self, cb) {
				return function(e) {
					e.currentTarget = e.currentTarget._createjs;
					
					e.target = e.target._createjs;
					var ev = e.data;
					e.rawX = ev.global.x;
					e.rawY = ev.global.y;
					
					_isDown = true;
					
					cb(e);
				};
			}
		},
		/*
		mouseup: {
			types: ['pointerup'],
			factory: function(self, cb) {
				return function(e) {
					e.currentTarget = e.currentTarget._createjs;
					
					e.target = e.target._createjs;
					var ev = e.data;
					e.rawX = ev.global.x;
					e.rawY = ev.global.y;
					
					_isDown = true;
					
					cb(e);
				};
			}
		},
		*/
		rollover: {
			types: ['pointerover'],
			factory: function(self, cb) {
				return function(e) {
					e.currentTarget = e.currentTarget._createjs;
					
					e.target = e.target._createjs;
					var ev = e.data;
					e.rawX = ev.global.x;
					e.rawY = ev.global.y;
					
					_isDown = true;
					
					cb(e);
				};
			}
		},
		rollout: {
			types: ['pointerout'],
			factory: function(self, cb) {
				return function(e) {
					e.currentTarget = e.currentTarget._createjs;
					
					e.target = e.currentTarget._createjs;
					var ev = e.data;
					e.rawX = ev.global.x;
					e.rawY = ev.global.y;
					
					_isDown = true;
					
					cb(e);
				};
			}
		},
		pressmove:{
			types: ['pointermove'],
			factory:  function(self, cb) {
				return function(e) {
					if (!_isDown) {
						return;
					}
					
					e.currentTarget = self;
					
					e.target = e.target && e.target._createjs;
					var ev = e.data;
					e.rawX = ev.global.x;
					e.rawY = ev.global.y;
					
					cb(e);
				};
			}
		},
		pressup: {
			types: ['pointerup', 'pointeupoutside'],
			factory: function(self, cb) {
				var func = function(e) {
					if (!_isDown) {
						return;
					}
					
					e.currentTarget = self;
					
					_isDown = false;
					
					e.target = e.target && e.target._createjs;
					var ev = e.data;
					e.rawX = ev.global.x;
					e.rawY = ev.global.y;
					
					cb(e);
				};
				
				return func;
			}
		}
	}
	
	var DEG_TO_RAD = Math.PI / 180;
	var COLOR_RED = 16 * 16 * 16 * 16;
	var COLOR_GREEN = 16 * 16;
	
	var appendixDescriptor = {
		x: {
			get: function() {
				return this._originParams.x;
			},
			
			set: function(value) {
				this._pixiData.instance.x = value;
				return this._originParams.x = value;
			}
		},
		y: {
			get: function() {
				return this._originParams.y;
			},
			
			set: function(value) {
				this._pixiData.instance.y = value;
				return this._originParams.y = value;
			}
		},
		scaleX: {
			get: function() {
				return this._originParams.scaleX;
			},
			
			set: function(value) {
				this._pixiData.instance.scale.x = value;
				return this._originParams.scaleX = value;
			}
		},
		scaleY: {
			get: function() {
				return this._originParams.scaleY;
			},
			
			set: function(value) {
				this._pixiData.instance.scale.y = value;
				return this._originParams.scaleY = value;
			}
		},
		skewX: {
			get: function() {
				return this._originParams.skewX;
			},
			
			set: function(value) {
				this._pixiData.instance.skew.x = -value * DEG_TO_RAD;
				return this._originParams.skewX = value;
			}
		},
		skewY: {
			get: function() {
				return this._originParams.skewY;
			},
			
			set: function(value) {
				this._pixiData.instance.skew.y = value * DEG_TO_RAD;
				return this._originParams.skewY = value;
			}
		
		},
		regX: {
			get: function() {
				return this._originParams.regX;
			},
			
			set: function(value) {
				this._pixiData.regObj.x = value;
				return this._originParams.regX = value;
			}
		},
		regY: {
			get: function() {
				return this._originParams.regY;
			},
			
			set: function(value) {
				this._pixiData.regObj.y = value;
				return this._originParams.regY = value;
			}
		},
		rotation: {
			get: function() {
				return this._originParams.rotation;
			},
			
			set: function(value) {
				this._pixiData.instance.rotation = value * DEG_TO_RAD;
				return this._originParams.rotation = value;
			}
		},
		visible: {
			get: function() {
				return this._originParams.visible;
			},
			
			set: function(value) {
				value = !!value;
				this._pixiData.instance.visible = value;
				return this._originParams.visible = value;
			}
		},
		alpha: {
			get: function() {
				return this._originParams.alpha;
			},
			
			set: function(value) {
				this._pixiData.instance.alpha = value;
				return this._originParams.alpha = value;
			}
		},
		addEventListener: {
			value: function(type, cb) {
				if (!(cb instanceof Function)) {
					return
				}
				
				if (type in EventMap) {
					var ev = EventMap[type];
					
					var func = ev.factory(this, cb);
					
					var types = ev.types;
					
					for (var i = 0; i < types.length; i++) {
						var t = types[i];
						
						this._pixiData.events[t] = this._pixiData.events[t] || [];
						this._pixiData.events[t].push({ func: func, origin: cb });
						
						this._pixiData.instance.on(t, func);
					}
					
					this._pixiData.instance.interactive = true;
				}
				
				return createjsOrigin.DisplayObject.prototype.addEventListener.apply(this, arguments);
			}
		},
		removeEventListener: {
			value: function(type, cb) {
				if (type in EventMap) {
					var ev = EventMap[type];
					
					var types = ev.types;
					
					for (var i = 0; i < types.length; i++) {
						var t = types[i];
						
						var list = this._pixiData.events[t];
						
						if (list) {
							for (var j = list.length - 1; j >= 0; j--) {
								if (list[j].origin === cb) {
									this._pixiData.instance.off(t, list[j].func);
									
									list.splice(j, 1);
									break;
								}
							}
						}
					}
					
					if (Object.keys(this._pixiData.instance._events).length === 0) {
						this._pixiData.instance.interactive = false;
					}
				}
				
				return createjsOrigin.DisplayObject.prototype.removeEventListener.apply(this, arguments);
			}
		},
		mask: {
			get: function() {
				return this._originParams.mask;
			},
			
			set: function(value) {
				if (value) {
					value._pixiData.masked.push(this._pixiData.instance);
					this._pixiData.instance.mask = value._pixiData.instance;
					
					this._pixiData.instance.once('added', function() {
						this.parent.addChild(value._pixiData.instance);
					});
				} else {
					this._pixiData.instance.mask = null;
				}
				
				return this._originParams.mask = value;
			}
		},
		filters: {
			get: function() {
				return this._originParams.filters;
			},
			
			set: function(value) {
				if (this._pixiData.subInstance) {
					if (value) {
						var list = [];
						
						for (var i = 0; i < value.length; i++) {
							var f = value[i];
							var m = new PIXI.filters.ColorMatrixFilter();
							
							m.matrix = [
								f.redMultiplier, 0, 0, 0, f.redOffset / 255,
								0, f.greenMultiplier, 0, 0, f.greenOffset / 255,
								0, 0, f.blueMultiplier, 0, f.blueOffset / 255,
								0, 0, 0, f.alphaMultiplier, 0, f.alphaOffset / 255,
								0, 0, 0, 0, 1
							];
							
							list.push(m);
						}
						
						var o = this._pixiData.instance;
						var c = o.children;
						var n = this._pixiData.subInstance = new PIXI.Container();
						
						while (c.length) {
							n.addChild(c[0]);
						}
						
						o.addChild(n);
						
						n.filters = list;
						n.cacheAsBitmap = true;
					} else {
						var o = this._pixiData.subInstance;
						var c = o.children;
						var n = this._pixiData.instance;
						
						while (o.length) {
							n.addChild(o[0]);
						}
						
						n.removeChild(o);
						
						this._pixiData.subInstance = n;
						
						o.filters = null;
						o.cacheAsBitmap = false;
					}
				}
				
				return this._originParams.filters = value;
			}
		}
	};
	
	createjs.MovieClip = function _MovieClip() {
		overrideCreatejs(this, new PIXI.Container());
		createjsOrigin.MovieClip.apply(this, arguments);
	}
	
	createjs.MovieClip.prototype = Object.defineProperties(Object.create(createjsOrigin.MovieClip.prototype), Object.assign({
		initialize: {
			value: function() {
				overrideCreatejs(this, new PIXI.Container());
				this._pixiData.subInstance = this._pixiData.instance;//.addChild(new PIXI.Container());
				return createjsOrigin.MovieClip.prototype.initialize.apply(this, arguments);
			}
		},
		addChild: {
			value: function(child) {
				this._pixiData.subInstance.addChild(child._pixiData.instance);
				return createjsOrigin.MovieClip.prototype.addChild.call(this, child);
			}
		},
		addChildAt: {
			value: function(child, index) {
				this._pixiData.subInstance.addChildAt(child._pixiData.instance, index);
				return createjsOrigin.MovieClip.prototype.addChildAt.call(this, child, index);
			}
		},
		removeChild: {
			value: function(child) {
				this._pixiData.subInstance.removeChild(child._pixiData.instance);
				return createjsOrigin.MovieClip.prototype.removeChild.call(this, child);
			}
		},
		removeChildAt: {
			value: function(index) {
				this._pixiData.subInstance.removeChildAt(index);
				return createjsOrigin.MovieClip.prototype.removeChildAt.call(this, index);
			}
		}
		,
		removeAllChldren: {
			value: function() {
				this._pixiData.subInstance.removeChildren();
				return createjsOrigin.MovieClip.prototype.removeAllChldren();
			}
		}
	}, appendixDescriptor));
	
	createjs.Sprite = function _Sprite() {
		overrideCreatejs(this, new PIXI.Sprite());
		createjsOrigin.Sprite.apply(this, arguments);
	}
	
	createjs.Sprite.prototype = Object.defineProperties(Object.create(createjsOrigin.Sprite.prototype), Object.assign({
		initialize: {
			value: function() {
				overrideCreatejs(this, new PIXI.Sprite());
				return createjsOrigin.Sprite.prototype.initialize.apply(this, arguments);
			}
		},
		gotoAndStop: {
			value: function() {
				createjsOrigin.Sprite.prototype.gotoAndStop.apply(this, arguments);
				
				var frame = this.spriteSheet.getFrame(this.currentFrame);
				var baseTexture = PIXI.BaseTexture.from(frame.image);
				var texture = new PIXI.Texture(baseTexture, frame.rect);
				
				this._pixiData.instance.texture = texture;
			}
		}
	}, appendixDescriptor));
	
	createjs.Shape = function _Shape() {
		overrideCreatejs(this, new PIXI.Container());
		this._pixiData.masked = [];
		
		createjsOrigin.Shape.apply(this, arguments);
	}
	
	createjs.Shape.prototype = Object.defineProperties(Object.create(createjsOrigin.Shape.prototype), Object.assign({
		graphics: {
			get: function() {
				return this._graphics;
			},
			
			set: function(value) {
				if (this._pixiData.masked.length) {
					this._pixiData.instance.removeChildren();
					
					if (value) {
						for (var i = 0; i < this._pixiData.masked.length; i++) {
							this._pixiData.masked[i].mask = this._pixiData.instance;
						}
					} else {
						for (var i = 0; i < this._pixiData.masked.length; i++) {
							this._pixiData.masked[i].mask = null;
						}
					}
				}
				
				if (value) {
					this._pixiData.instance.addChild(value._pixiData.instance);
				}
				
				return this._graphics = value;
			}
		}
	}, appendixDescriptor));
	
	createjs.Graphics = function _Graphics() {
		overrideCreatejs(this, new PIXI.Graphics());
		createjsOrigin.Graphics.apply(this, arguments);
		
		this._pixiData.instance.beginFill(0xFFEEEE, 1);
		
		this._pixiData.strokeFill = 0;
		this._pixiData.strokeAlpha = 1;
	}
	
	var LineCap = {
		0: PIXI.LINE_JOIN.BUTT,
		1: PIXI.LINE_JOIN.ROUND,
		2: PIXI.LINE_JOIN.SQUARE
	};
	
	var LineJoin = {
		0: PIXI.LINE_JOIN.MITER,
		1: PIXI.LINE_JOIN.ROUND,
		2: PIXI.LINE_JOIN.BEVEL
	};
	
	createjs.Graphics.prototype = Object.defineProperties(Object.create(createjsOrigin.Graphics.prototype), Object.assign({
		moveTo: {
			value: function(x, y) {
				if (this._pixiData.instance.clone().endFill().containsPoint({x: x, y: y})) {
					this._pixiData.instance.beginHole();
				} else {
					this._pixiData.instance.endHole();
				}
				
				this._pixiData.instance.moveTo(x, y);
				
				return createjsOrigin.Graphics.prototype.moveTo.call(this, x, y);
			}
		},
		
		lineTo: {
			value: function(x, y) {
				this._pixiData.instance.lineTo(x, y);
				
				return createjsOrigin.Graphics.prototype.lineTo.call(this, x, y);
			}
		},
		
		arcTo: {
			value: function(x1, y1, x2, y2, radius) {
				this._pixiData.instance.arcTo(x1, y1, x2, y2, radius);
				
				return createjsOrigin.Graphics.prototype.arcTo.call(this, x1, y1, x2, y2, radius);
			}
		},
		
		arc: {
			value: function(x, y, radius, startAngle, endAngle, anticlockwise) {
				this._pixiData.instance.arc(x, y, radius, startAngle, endAngle, anticlockwise);
				
				return createjsOrigin.Graphics.prototype.arc.call(this, x, y, radius, startAngle, endAngle, anticlockwise);
			}
		},
		
		quadraticCurveTo: {
			value: function(cpx, cpy, x, y) {
				this._pixiData.instance.quadraticCurveTo(cpx, cpy, x, y);
				
				return createjsOrigin.Graphics.prototype.quadraticCurveTo.call(this, cpx, cpy, x, y);
			}
		},
		
		bezierCurveTo: {
			value: function(cp1x, cp1y, cp2x, cp2y, x, y) {
				this._pixiData.instance.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
				
				return createjsOrigin.Graphics.prototype.bezierCurveTo.call(this, cp1x, cp1y, cp2x, cp2y, x, y);
			}
		},
		
		rect: {
			value: function(x, y, w, h) {
				this._pixiData.instance.drawRect(x, y, w, h);
				
				return createjsOrigin.Graphics.prototype.rect.call(this, x, y, w, h);
			}
		},
		
		closePath: {
			value: function() {
				this._pixiData.instance.closePath();
				
				var points = this._pixiData.instance.currentPath.points;
				
				return createjsOrigin.Graphics.prototype.closePath.call(this);
			}
		},
		
		clear: {
			value: function() {
				this._pixiData.instance.clear();
				
				return createjsOrigin.Graphics.prototype.clear.call(this);
			}
		},
		
		_parseColor: {
			value: function(color) {
				var res = {
					color: 0,
					alpha: 1
				};
				
				if (!color) {
					res.alpha = 0;
					return res;
				}
				
				if (color.charAt(0) === '#') {
					res.color = parseInt(color.slice(1), 16);
					return res;
				}
				
				color = color.replace(/rgba|\(|\)|\s/g, '').split(',');
				
				res.color = Number(color[0]) * COLOR_RED + Number(color[1]) * COLOR_GREEN + Number(color[2]);
				res.alpha = Number(color[3]);
				
				return res;
			}
		},
		
		beginFill: {
			value: function(color) {
				var c = this._parseColor(color);
				this._pixiData.instance.beginFill(c.color, c.alpha);
				
				return createjsOrigin.Graphics.prototype.beginFill.call(this, color);
			}
		},
		
		endFill: {
			value: function() {
				this._pixiData.instance.endFill();
				
				return createjsOrigin.Graphics.prototype.endFill.call(this);
			}
		},
		
		setStrokeStyle: {
			value: function(thickness, caps, joints, miterLimit, ignoreScale) {
				this._pixiData.instance.lineStyle({
					width: thickness,
					color: this._pixiData.strokeFill,
					alpha: this._pixiData.strokeAlpha,
					cap: (caps in LineCap) ? LineCap[caps] : caps,
					join: (joints in LineJoin) ? LineJoin[joints] : joints,
					miterLimit: miterLimit
				});
				
				return createjsOrigin.Graphics.prototype.setStrokeStyle.call(this, thickness, caps, joints, miterLimit, ignoreScale);
			}
		},
		
		beginStroke: {
			value: function(color) {
				var c = this._parseColor(color);
				this._pixiData.strokeFill = c.color;
				this._pixiData.strokeAlpha = c.alpha;
				
				return createjsOrigin.Graphics.prototype.beginStroke.call(this, color);
			}
		},
		
		drawRoundRect: {
			value: function(x, y, w, h, radius) {
				this._pixiData.instance.drawRoundedRect(x, y, w, h, radius);
				
				return createjsOrigin.Graphics.prototype.drawRoundRect.call(this, x, y, w, h, radius);
			}
		},
		
		drawCircle: {
			value: function(x, y, radius) {
				this._pixiData.instance.drawCircle(x, y, radius);
				
				return createjsOrigin.Graphics.prototype.drawCircle.call(this, x, y, radius);
			}
		},
		
		drawEllipse: {
			value: function(x, y, w, h) {
				this._pixiData.instance.drawEllipse(x, y, w, h);
				
				return createjsOrigin.Graphics.prototype.drawEllipse.call(this, x, y, w, h);
			}
		},
		
		drawPolyStar: {
			value: function(x, y, radius, sides, pointSize, angle) {
				this._pixiData.instance.drawRegularPolygon(x, y, radius, sides, angle * DEG_TO_RAD);
				
				return createjsOrigin.Graphics.prototype.drawPolyStar.call(this, x, y, radius, sides, pointSize, angle);
			}
		}
	}, appendixDescriptor));
	
	Object.defineProperties(createjs.Graphics.prototype, {
		curveTo: {
			value: createjs.Graphics.prototype.quadraticCurveTo
		},
		
		drawRect: {
			value: createjs.Graphics.prototype.rect
		},
		
		mt: {
			value: createjs.Graphics.prototype.moveTo
		},
		
		lt: {
			value: createjs.Graphics.prototype.lineTo
		},
		
		at: {
			value: createjs.Graphics.prototype.arcTo
		},
		
		bt: {
			value: createjs.Graphics.prototype.bezierCurveTo
		},
		
		qt: {
			value: createjs.Graphics.prototype.quadraticCurveTo
		},
		
		a: {
			value: createjs.Graphics.prototype.arc
		},
		
		r: {
			value: createjs.Graphics.prototype.rect
		},
		
		cp: {
			value: createjs.Graphics.prototype.closePath
		},
		
		c: {
			value: createjs.Graphics.prototype.clear
		},
		
		f: {
			value: createjs.Graphics.prototype.beginFill
		},
		
		ef: {
			value: createjs.Graphics.prototype.endFill
		},
		
		ss: {
			value: createjs.Graphics.prototype.setStrokeStyle
		},
		
		s: {
			value: createjs.Graphics.prototype.beginStroke
		},
		
		dr: {
			value: createjs.Graphics.prototype.drawRect
		},
		
		rr: {
			value: createjs.Graphics.prototype.drawRoundRect
		},
		
		dc: {
			value: createjs.Graphics.prototype.drawCircle
		},
		
		de: {
			value: createjs.Graphics.prototype.drawEllipse
		},
		
		dp: {
			value: createjs.Graphics.prototype.drawPolyStar
		}
	});
	
	createjs.Text = function _Text(text, font, color) {
		overrideCreatejs(this, new PIXI.Container());
		
		this._originParams = Object.assign(this._originParams, {
			text: text,
			font: font,
			color: color,
			textAlign: 'left',
			lineHeight: 0,
			lineWidth: 0
		});
		
		var _font = this._parseFont(font);
		
		this._pixiData.instance.text = this._pixiData.instance.addChild(new PIXI.Text(text, {
			fontSize: _font.fontSize,
			fontFamily: _font.fontFamily,
			fill: this._parseColor(color),
			wordWrap: true
		}));
		
		createjsOrigin.Text.apply(this, arguments);
	}
	
	createjs.Text.prototype = Object.defineProperties(Object.create(createjsOrigin.Text.prototype), Object.assign({
		text: {
			get: function() {
				return this._originParams.text;
			},
			set: function(text) {
				this._pixiData.instance.text.text = text;
				this._align(this.textAlign);
				
				return this._originParams.text = text;
			}
		},
		_parseFont: {
			value: function(font) {
				var p = font.split(' ');
				
				return {
					fontSize: Number(p.shift().replace('px', '')),
					fontFamily: p.join(' ').replace(/'/g, '') //'
				};
			}
		},
		font: {
			get: function() {
				return this._originParams.font;
			},
			set: function(font) {
				var _font = this._parseFont(font);
				this._pixiData.instance.text.style.fontSize = _font.fontSize;
				this._pixiData.instance.text.style.fontFamily = _font.fontFamily;
				
				return this._originParams.font = font;
			}
		},
		_parseColor: {
			value: function(color) {
				return parseInt(color.slice(1), 16);
			}
		},
		color: {
			get: function() {
				return this._originParams.color;
			},
			set: function(color) {
				this._pixiData.instance.text.style.fill = this._parseColor(color);
				
				return this._originParams.color = color;
			}
		},
		_align: {
			value: function(align) {
				if (align === 'left') {
					this._pixiData.instance.text.x = 0;
					return;
				}
				
				if (align === 'center') {
					this._pixiData.instance.text.x = -this.lineWidth / 2;
					return;
				}
				
				if (align === 'right') {
					this._pixiData.instance.text.x =  -this.lineWidth;
					return;
				}
			}
		},
		textAlign: {
			get: function() {
				return this._originParams.textAlign;
			},
			set: function(align) {
				this._pixiData.instance.text.style.align = align;
				this._align(align);
				
				return this._originParams.textAlign = align;
			}
		},
		lineHeight: {
			get: function() {
				return this._originParams.lineHeight;
			},
			set: function(height) {
				this._pixiData.instance.text.lineHeight = height;
				
				return this._originParams.lineHeight = height;
			}
		},
		lineWidth: {
			get: function() {
				return this._originParams.lineWidth;
			},
			set: function(width) {
				this._pixiData.instance.text.lineWidthWrap = width;
				
				return this._originParams.lineWidth = width;
			}
		}
	}, appendixDescriptor));
	
	createjs.ButtonHelper = function _ButtonHelper() {
		overrideCreatejs(this, new PIXI.Container());
		
		createjsOrigin.ButtonHelper.apply(this, arguments);
		
		var createjs = arguments[0];
		var pixi = createjs._pixiData.instance;
		
		var baseFrame = arguments[1];
		var overFrame = arguments[2];
		var downFrame = arguments[3];
		var hit = arguments[5];
		var hitFrame = arguments[6];
		
		hit.gotoAndStop(hitFrame);
		var hitPixi = pixi.addChild(hit._pixiData.instance);
		hitPixi.alpha = 0.00001
		
		var isOver = false;
		var isDown = false;
		
		hitPixi.on('pointerover', function() {
			isOver = true;
			if (isDown) {
				createjs.gotoAndStop(downFrame);
			} else {
				createjs.gotoAndStop(overFrame);
			}
		});
		
		hitPixi.on('pointerout', function() {
			isOver = false;
			
			if (isDown) {
				createjs.gotoAndStop(overFrame);
			} else {
				createjs.gotoAndStop(baseFrame);
			}
		});
		
		hitPixi.on('pointerdown', function() {
			isDown = true;
			createjs.gotoAndStop(downFrame);
		});
		
		hitPixi.on('pointerup', function() {
			isDown = false;
			if (isOver) {
				createjs.gotoAndStop(overFrame);
			} else {
				createjs.gotoAndStop(baseFrame);
			}
		});
		
		hitPixi.on('pointerupoutside', function() {
			isDown = false;
			if (isOver) {
				createjs.gotoAndStop(overFrame);
			} else {
				createjs.gotoAndStop(baseFrame);
			}
		});
		
		hitPixi.interactive = true;
		hitPixi.cursor = 'pointer';
	}
	
	createjs.ButtonHelper.prototype = Object.create(createjsOrigin.ButtonHelper.prototype);
	
	var originTo = createjs.Tween.prototype.to;
	createjs.Tween.prototype.to = function() {
		var obj = arguments[0];
		
		if ('rotation' in obj) {
			var prevRotation = this._prevRotation || 0;
			
			if (Math.abs(obj.rotation - prevRotation) >= 360) {
				if ('skewX' in obj) {
					obj.skewX += 360;
				}
				
				if ('skewY' in obj) {
					obj.skewY += 360;
				}
			}
			
			this._prevRotation = obj.rotation;
		}
		
		return originTo.apply(this, arguments);
	};
	
	pixiObj.createjs = Object.defineProperties({}, {
		Application: {
			value: CreatejsApplication
		}
	});
	
	window,playSound = function(id, loop) {
		return createjs.Sound.play(id, {
			interrupt: createjs.Sound.INTERRUPT_EARLY,
			loop: loop
		});
	}
})();