import * as Pixim from '@tawaship/pixim.js';
export declare class Player extends Pixim.Application {
    private _composition;
    private _rootClass;
    private _basepath;
    private _stage;
    constructor(id: string, rootName: string, basepath: string, pixiOptions?: Object, piximOptions?: Object);
    initAsync(options?: {}): any;
}
