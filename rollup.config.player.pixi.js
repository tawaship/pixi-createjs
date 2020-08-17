import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import del from 'del';

const version = require('./package.json').version;
const banner = [
	'/*!',
	` * @tawaship/pixim-createjs-player.js - v${version}`,
	' * ',
	' * @require pixi.js v5.3.2',
	' * @require @tawaship/pixim.js v1.4.0',
	' * @author tawaship (makazu.mori@gmail.com)',
	' * @license MIT',
	' */',
	''
].join('\n');

export default (async () => {
	if (process.env.PROD) {
	//	await del(['./docs', './types', './dist']);
	}
	
	return [
		{
			input: 'src/player/index.ts',
			output: [
				{
					banner,
					file: 'dist/Pixim-createjs-player.js',
					format: 'iife',
					name: 'Pixim.createjs',
					sourcemap: true,
					globals: {
						'pixi.js': 'PIXI',
						'@tawaship/pixim.js': 'Pixim'
					}
				}
			],
			external: ['pixi.js', 'howler'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript(),
				buble(),
				terser({
					compress: {
						//drop_console: true
						pure_funcs: ['console.log']
					},
					mangle: false,
					output: {
						beautify: true,
						braces: true
					}
				})
			]
		},
		{
			input: 'src/player/index.ts',
			output: [
				{
					banner,
					file: 'dist/Pixim-createjs-player.min.js',
					format: 'iife',
					name: 'Pixim.createjs',
					globals: {
						'pixi.js': 'PIXI',
						'@tawaship/pixim.js': 'Pixim'
					},
					compact: true
				}
			],
			external: ['pixi.js', 'howler'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript(),
				buble(),
				terser({
					compress: {
						//drop_console: true,
						pure_funcs: ['console.log']
					}
				})
			]
		}
	]
})();