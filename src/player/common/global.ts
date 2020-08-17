/**
 * @ignore
 */
declare const window: any;

function playSound(id: string, loop: Boolean = false) {
	return window.createjs.Sound.play(id, {
		interrupt: window.createjs.Sound.INTERRUPT_EARLY,
		loop: loop
	});
}

Object.defineProperties(window, {
	playSound: {
		value: playSound
	}
});

export {};