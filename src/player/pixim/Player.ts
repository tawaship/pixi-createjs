import { initAsync, initStage } from '../common/core';
import * as _Pixim from '@tawaship/pixim.js';

/**
 * @ignore
 */
declare const window: any;

export namespace Pixim {
	export namespace createjs {
		/**
		 * @property useSynchedTimeline Whether the movie clip plays when placed as a "graphic".
		 */
		export type TCreatejsPlayerOption = {
			useSynchedTimeline?: boolean
		};
		
		/**
		 * @see https://tawaship.github.io/Pixim.js/classes/application.html
		 */
		export class Player extends _Pixim.Application {
			private _composition: any;
			private _rootClass: any;
			private _basepath: string;
			private _stage: any;
			
			constructor(id: string, rootName: string, basepath: string, pixiOptions: Object = {}, piximOptions: _Pixim.TApplicationOption = {}) {
				const comp = window.AdobeAn.getComposition(id);
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
				
				window.createjs.Ticker.framerate = prop.fps;
				
				const handlePlay = () => {
					this._stage._tickFunction();
					app.render();
				}
				
				Object.defineProperties(this, {
					play: {
						value: function() {
							window.createjs.Ticker.addEventListener('tick', handlePlay);
						}
					},
					
					stop: {
						value: function() {
							window.createjs.Ticker.removeEventListener('tick', handlePlay);
						}
					}
				});
			}
			
			initAsync(options: TCreatejsPlayerOption = {}) {
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
							ss[ssMetadata[i].name] = new window.createjs.SpriteSheet({
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
						
						window.AdobeAn.compositionLoaded(lib.properties.id);
						
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
		
		/**
		 * @ignore
		 */
		const Content = _Pixim.Content.create();

		Content.defineLibraries({
			root: class Root extends _Pixim.Container {
				constructor($: any) {
					super();
					
					this.addChild($.vars.root);
				}
			}
		});
	}
}