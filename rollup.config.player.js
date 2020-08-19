import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import del from 'del';

const conf = require('./package.json');
const version = conf.version;
const pixi = conf.dependencies['pixi.js'].replace('^', '');
const pixim = conf.dependencies['@tawaship/pixim.js'].replace('^', '');

const banner = [
	'/*!',
	` * @tawaship/pixim-createjs-player.js - v${version}`,
	' * ',
	` * @require pixi.js v${pixi}`,
	` * @require @tawaship/pixim.js v${pixim}`,
	' * @author tawaship (makazu.mori@gmail.com)',
	' * @license MIT',
	' */',
	''
].join('\n');

export default (async () => {
	if (process.env.PROD) {
		await del(['./docs', './dist/player']);
	}
	
	return [
		{
			input: 'src/player/pixim/index.ts',
			output: [
				{
					banner,
					file: 'dist/player/Pixim-createjs-player.js',
					format: 'iife',
					name: 'Pixim.createjs',
					sourcemap: true,
					extend: true,
					globals: {
						'pixi.js': 'PIXI',
						'@tawaship/pixim.js': 'Pixim'
					}
				}
			],
			external: ['pixi.js', '@tawaship/pixim.js'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript({tsconfig: 'tsconfig.player.pixim.json'}),
				buble(),
				terser({
					compress: {
						//drop_console: true
						//pure_funcs: ['console.log']
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
			input: 'src/player/pixim/index.ts',
			output: [
				{
					banner,
					file: 'dist/player/Pixim-createjs-player.min.js',
					format: 'iife',
					name: 'Pixim.createjs',
					sourcemap: true,
					extend: true,
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
				typescript({tsconfig: 'tsconfig.player.pixim.json'}),
				buble(),
				terser({
					compress: {
						//drop_console: true,
						pure_funcs: ['console.log']
					}
				})
			]
		},
		{
			input: 'src/player/pixi/index.ts',
			output: [
				{
					banner,
					file: 'dist/player/pixi-createjs-player.js',
					format: 'iife',
					name: 'PIXI.createjs',
					sourcemap: true,
					extend: true,
					globals: {
						'pixi.js': 'PIXI'
					}
				}
			],
			external: ['pixi.js'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript({tsconfig: 'tsconfig.player.pixi.json'}),
				buble(),
				terser({
					compress: {
						//drop_console: true
						//pure_funcs: ['console.log']
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
					banner,
					file: 'dist/player/pixi-createjs-player.min.js',
					format: 'iife',
					name: 'PIXI.createjs',
					sourcemap: true,
					extend: true,
					globals: {
						'pixi.js': 'PIXI'
					},
					compact: true
				}
			],
			external: ['pixi.js'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript({tsconfig: 'tsconfig.player.pixi.json'}),
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