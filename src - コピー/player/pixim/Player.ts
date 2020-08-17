import { initAsync, initStage } from '../core';
import * as Pixim from '@tawaship/pixim.js';

declare const AdobeAn: any;
declare const createjs: any;

export class Player extends Pixim.Application {
	private _composition: any;
	private _rootClass: any;
	private _basepath: string;
	private _stage: any;
	
	constructor(id: string, rootName: string, basepath: string, pixiOptions: Object = {}, piximOptions: Object = {}) {
		const comp = AdobeAn.getComposition(id);
		if (!comp) {
			throw new Error('no composition');
		}
		
		const lib = comp.getLibrary();
		const root = lib[rootName];
		if (!root) {
			throw new Error('no root class');
		}
		
		const prop = lib.properties;
		
		super(Object.assign(pixiOptions, {
			width: prop.width,
			height: prop.height,
			backgroundColor: parseInt(prop.color.slice(1), 16)
		}), piximOptions);
		
		const app = this.app;
		
		this._composition = comp;
		this._rootClass = root;
		this._basepath = basepath;
		
		createjs.Ticker.framerate = prop.fps;
		
		const handlePlay = () => {
			this._stage._tickFunction();
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
	
	initAsync(options = {}) {
		const rootClass = this._rootClass;
		
		return initAsync(this._basepath, this._composition)
			.then(data => {
				const evt = data.evt;
				const comp = data.comp;
				
				const lib = comp.getLibrary();
				const ss = comp.getSpriteSheet();
				const queue = evt.target;
				const ssMetadata = lib.ssMetadata;
				
				for (let i = 0; i < ssMetadata.length; i++) {
					ss[ssMetadata[i].name] = new createjs.SpriteSheet({
						images: [
							queue.getResult(ssMetadata[i].name)
						],
						frames: ssMetadata[i].frames
					});
				}
				
				const exportRoot = new this._rootClass();
				
				this._stage = new lib.Stage();
				initStage(this._stage, options);
				
				Object.defineProperties(window, {
					exportRoot: {
						value: exportRoot
					},
					
					stage: {
						value: this._stage
					}
				});
				
				AdobeAn.compositionLoaded(lib.properties.id);
				
				const content = new Content();
				content.addVars({
					root: exportRoot.getPixi()
				});
				
				this.app.render();
				
				this._stage.addChild(exportRoot);
				
				return this.attachAsync(content);
			});
	}
}

const Content = Pixim.Content.create();

Content.defineLibraries({
	root: class Root extends Pixim.Container {
		constructor($: any) {
			super();
			
			this.addChild($.vars.root);
		}
	}
});