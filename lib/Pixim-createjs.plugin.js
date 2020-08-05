(function() {
	var DEG_TO_RAD = Math.PI / 180;
	window.cjs = window.createjs;
	
	function Timeline(container) {
		this._container = container;
		this._tweens = [];
	}
	
	Object.defineProperties(Timeline.prototype, {
		addTween: {
			value: function(tween) {
				tween.useTicks = true;
				tween.paused = true;
				tween.loop = 0;
				
				var self = this
				
				tween.on('complete', function(e) {
					if (tween !== self._tweens[self._tweens.length - 1]) {
						return;
					}
					
					self._container.emit('tweenComplete', tween);
				});
				
				this._tweens.push(tween);
				
				return tween;
			}
		},
		
		to: {
			value: function(e) {
				var tweens = this._tweens;
				
				for (var i = 0; i < tweens.length; i++) {
					tweens[i].gotoAndStop(tweens[i].position + e.delta);
				}
			}
		}
	});
	
	var originTo = createjs.Tween.prototype.to;
	
	createjs.Tween.prototype.to = function() {
		var obj = arguments[0];
		
		obj.rotation && (obj.rotation *= DEG_TO_RAD);
		obj.skewX && (obj.skewX *= -DEG_TO_RAD);
		obj.skewY && (obj.skewY *= DEG_TO_RAD);
		
		if ('rotation' in obj) {
			var prevRotation = this._prevRotation || 0;
			
			if (Math.abs(obj.rotation - prevRotation) >= 360 * DEG_TO_RAD) {
				if ('skewX' in obj) {
					obj.skewX -= 360 * DEG_TO_RAD;
				}
				
				if ('skewY' in obj) {
					obj.skewY += 360 * DEG_TO_RAD;
				}
			}
			
			this._prevRotation = obj.rotation;
		}
		
		return originTo.apply(this, arguments);
	};
	
	function TweenWrapper() {
		Pixim.Container.call(this);
		
		this.__off = false;
		this._visible = true;
		this._regObj = this.pivot || this.anchor;
	}
	
	TweenWrapper.prototype = Object.create(Pixim.Container.prototype);
	
	Object.defineProperties(TweenWrapper.prototype, {
		setTransform: {
			value: function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
				return Pixim.Container.prototype.setTransform.call(this, x, y, scaleX, scaleY, rotation * DEG_TO_RAD, -skewX * DEG_TO_RAD, skewY * DEG_TO_RAD, regX, regY);
			}
		},
		
		scaleX: {
			get: function() {
				return this.scale.x;
			},
			
			set: function(value) {
				return this.scale.x = value;
			}
		},
		
		scaleY: {
			get: function() {
				return this.scale.y;
			},
			
			set: function(value) {
				return this.scale.y = value;
			}
		},
		
		skewX: {
			get: function() {
				return this.skew.x;
			},
			
			set: function(value) {
				return this.skew.x = value;
			}
		},
		
		skewY: {
			get: function() {
				return this.skew.y;
			},
			
			set: function(value) {
				return this.skew.y = value;
			}
		},
		
		regX: {
			get: function() {
				return this._regObj.x;
			},
			
			set: function(value) {
				return this._regObj.x = value;
			}
		},
		
		regY: {
			get: function() {
				return this._regObj.x;
			},
			
			set: function(value) {
				return this._regObj.y = value;
			}
		},
		
		_off: {
			get: function() {
				return this.__off;
			},
			
			set: function(value) {
				value = !!value;
				
				this.renderable = !value;
				
				return this.__off = value;
			}
		}
	});
	
	function TimelineContainer() {
		Pixim.Container.apply(this, arguments);
		
		this.timeline = new Timeline(this);
	}
	
	TimelineContainer.prototype = Object.create(Pixim.Container.prototype);
	
	Pixim.createjs = Object.defineProperties({}, {
		Wrapper: {
			value: TweenWrapper
		},
		
		Container: {
			value: TimelineContainer
		}
	});
})();