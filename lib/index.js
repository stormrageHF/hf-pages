const { src, dest, series, parallel, watch } = require('gulp')

// 自动载入插件
const loadPlugins = require('gulp-load-plugins')

// const plugins.sass = require('gulp-sass')
// const plugins.babel = require('gulp-babel')
// const plugins.swig = require('gulp-swig')
// const plugins.imagemin = require('gulp-imagemin')

const del = require('del')
const browserSync = require('browser-sync')

const plugins = loadPlugins() // 自动载入
const bs = browserSync.create()
const cwd = process.cwd()

let config = {
  // defult config
  build: {
    src: 'src',
    dist: 'dist',
    temp: "temp",
    public: 'public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }
  }
}

try {
  const loadConfig = require(`${cwd}/pages.config.js`)
  config = Object.assign({}, config, loadConfig)
} catch (e) { }


const clean = () => {
  return del([config.build.dist, config.build.temp])
}

const style = () => {
  return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src }) // base 可以保证导出的目录结构与src中一致
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true })) // 可以自动刷新就不用监听files了
}

const script = () => {
  return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true })) // 可以自动刷新就不用监听files了

}

const page = () => {
  return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src }) // src/**/*.html --- src目录和子目录中所有html文件
    .pipe(plugins.swig({
      data: config.data,
      defaults: {
        cache: false
      }
    }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true })) // 可以自动刷新就不用监听files了

}

const image = () => {
  return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const font = () => {
  return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const extra = () => {
  return src('**', { base: config.build.public, cwd: config.build.public })
    .pipe(dest(config.build.dist))
}

const serve = () => {
  watch(config.build.paths.styles, { cwd: config.build.src }, style)
  watch(config.build.paths.scripts, { cwd: config.build.src }, script)
  watch(config.build.paths.pages, { cwd: config.build.src }, page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)

  // 有变动刷新浏览器
  watch([
    config.build.paths.images,
    config.build.paths.fonts,
  ], { cwd: config.build.src }, bs.reload)

  watch('**', { cwd: config.build.public }, bs.reload)

  bs.init({
    notify: false, // 关闭右上角提示
    port: 2080,
    // open: false, // 自动打开web
    // files: 'dist/**', // 监听dist下文件修改
    server: {
      baseDir: [config.build.temp, config.build.src, config.build.public],  // 指定发布项目根目录
      // 为了解决 index.html 中引入node_modules问题
      // routes 优先级高过 baseDir
      routes: {
        '/node_modules': 'node_modules' // 路由指定整体项目目录下的node_modules
      }
    }
  })
}

const useref = () => {
  return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
    // 根据构建注释合并文件 
    .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
    // 压缩
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true, // 将空格，回车符去掉
      minifyCSS: true, // 将html中的style 压缩
      minifyJS: true // 将 html 中的 script 压缩
    })))
    .pipe(dest(config.build.dist))
}

const compile = parallel(style, script, page)

// 上线之前
const build = series(
  clean,
  parallel(
    series(compile, useref),
    image,
    font,
    extra
  )
)

const develop = series(compile, serve)

module.exports = {

  clean,
  build,
  develop,
}

