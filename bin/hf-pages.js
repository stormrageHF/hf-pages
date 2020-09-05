#!/usr/bin/env node

// console.log('hf=pages');

process.argv.push('--cwd')
process.argv.push(process.cwd()) // 工作目录
process.argv.push('--gulpfile')
process.argv.push(require.resolve('..')) // 会自动查找 package 里的 main 字段 路径

// console.log(process.argv);

require('gulp/bin/gulp')

