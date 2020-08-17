import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import del from 'del';

const version = require('./package.json').version;
const playerBanner = [
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
		/*{
			input: 'src/player/pixi/index.ts',
			output: [
				{
					playerBanner,
					file: 'dist/pixi-createjs-player.js',
					format: 'iife',
					name: 'PIXI.createjs',
					sourcemap: true,
					globals: {
						'pixi.js': 'PIXI',
						AdobeAn: 'AdobeAn'
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
			input: 'src/player/pixi/index.ts',
			output: [
				{
					playerBanner,
					file: 'dist/pixi-createjs-player.min.js',
					format: 'iife',
					name: 'PIXI.createjs',
					globals: {
						'pixi.js': 'PIXI',
						AdobeAn: 'AdobeAn'
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
		},*/
		{
			input: 'src/player/pixim/index.ts',
			output: 
				{
					banner: playerBanner,
					file: 'dist/Pixim-createjs-player.js',
					format: 'iife',
					//dir: 'dist',
					name: 'Pixim.createjs',
					sourcemap: true,
					globals: {
						'pixi.js': 'PIXI',
						'@tawaship/pixim.js': 'Pixim'
					}
				}
			,
			external: ['pixi.js', '@tawaship/pixim.js'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript({tsconfig: false, include: ['src/player/pixim/**/*.ts', 'src/player/common/**/*.ts']}),
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
		}/*,
		{
			input: 'src/player/pixim/index.ts',
			output: [
				{
					banner: playerBanner,
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
			external: ['pixi.js', '@tawaship/pixim.js'],
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
		}*/
	]
})();