//                   Подключаем библиотеки
// Они должны быть указаны в dev зависимостях файла package.json и установлены командой npm i

const gulp = require('gulp'); // сборщик
const plumber = require('gulp-plumber'); // обработчик ошибок в файлах препроцессора
const sourcemap = require('gulp-sourcemaps'); // создание карты стилей
const sass = require('gulp-sass')(require('sass')); // препроцессор SCSS
const postcss = require('gulp-postcss'); // обработчик файла стилей
const rename = require("gulp-rename"); // переименование файла
const csso = require("postcss-csso"); // минификация файла стилей
const jscompile = require("webpack-stream"); // обработка Js файлов
const webpack = require("webpack"); // компановщик js файлов
const htmlmin = require("gulp-htmlmin"); // минификация html
const autoprefix = require('autoprefixer'); // автоматическая подстановка префиксов для поддержки разных браузеров
const squoosh = require("gulp-libsquoosh"); // Оптимизация картинок
const webp = require("gulp-webp"); // Конвертер изображений в формат webp
const svgstore = require("gulp-svgstore"); // Сборка svg файлов в спрайт
const svgmin = require('gulp-svgmin'); // Сжимание файлов svg
const path = require('path');
const del = require("del"); // удаление папки
const critical = require('critical'); // критические участки кода, встраивает инлайн в html
const sync = require('browser-sync').create();

/**
 * Задачи
 *
 */
// Запуск сервера (режим разработчика)
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build" // папка из которой сервер берет источники для страницы
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}
exports.server = server;

// Отслеживание изменений в исходных файлах (режим разработчика)
const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(styles, reload)); // отслеживать файлы препроцессора
  gulp.watch("source/js/**/*.js", gulp.series(scriptsjs, reload)); // отслеживать файлы скриптов
  gulp.watch("source/img/**/*.{jpg,png}", gulp.series(createWebp, reload)); // отслеживать картинки
  gulp.watch("source/*.html", gulp.series(html, reload)); // отслеживать файлы разметки HTML
}
exports.watcher = watcher;

// Перезагрузка в случае изменений в файлах (режим разработчика)
const reload = (done) => {
  sync.reload(); // перезагрузка в случае если произошли изменения в исходных файлах разметки
  done();
}
exports.reload = reload;

//Генерация файла стилей из файлов препроцессора
const styles = () => {
  return gulp.src('source/sass/style.scss') // Загружаем главный препроцесорный файл
    .pipe(plumber()) // подключаем обработчик ошибок
    .pipe(sourcemap.init()) // Фиксация исходного состояния кода в файлах препроцессора
    .pipe(sass()) // запускаем препроцессор чтобы получить файл стилей
    .pipe(postcss( // полученный результат обработаем плагинами постпроцессора
      [
        autoprefix(), // добавить префиксы для поддержки разных версий браузеров
        csso() // минифицировать код CSS
      ]
    ))
    .pipe(rename("style.min.css")) // переименовать файл стилей
    .pipe(sourcemap.write(".")) // сохранение карты стилей в отдельном файле в той же папке
    .pipe(gulp.dest('build/css')) // сохранение результатов сборки в указанной папке
    .pipe(sync.stream());
}
exports.styles = styles;

// Обработка скриптов JS

const scriptsjs = () => {
  return gulp.src("source/js/main.js")
    .pipe(jscompile(require('./webpack.config.js'), webpack)) // компановщик Js скриптов
    .pipe(rename("app.min.js")) // переименовать файл
    .pipe(gulp.dest("build/js/")) // сохранение результатов в указанной папке
    .pipe(sync.stream());
}
exports.scriptsjs = scriptsjs;

// минификация html
const html = () => {
  return gulp.src("source/*.html")
    // .pipe(htmlmin({
    //   collapseWhitespace: true
    // }))
    .pipe(gulp.dest("build"));
}
exports.html = html;

// Удаление старой версии сборки перед записью новой
const cleanbuild = () => {
  return del("build");
}
exports.cleanbuild = cleanbuild;

// Копирование файлов необходимых для нормального показа страницы в браузере
const copy = (done) => {
  return gulp.src([
      "source/fonts/*.{woff2,woff}", // копируем только шрифты указанного в {} формата
      "source/*.ico", // копируем favicon
      "source/*.webmanifest", // копируем манифест с favicons
      "source/img/**/*.svg", // копируем файлы формата SVG
      "source/*.html" // копируем разметку HTML
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build")); // помещаем все файлы сборки в указанную папку
  done();
}
exports.copy = copy;

// Копирование медиа файлов без сжатия в режиме разработчика
const copyImages = () => {
  return gulp.src("source/img/**/*.{jpg,png}") // копируем только файлы указанного в {} формата
    .pipe(gulp.dest("build/img"));
}
exports.copyImages = copyImages;

// Оптимизация и копирование медиа для сборки конечного продукта
const optimizeImages = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}") // выбираем все файлы указанного формата
    .pipe(squoosh()) // пропускаем через плагин оптимизации
    .pipe(gulp.dest("build/img")); // сохраняем в указанную папку
}
exports.optimizeImages = optimizeImages;

// Конвертация изображений в формат webp для сборки конечного продукта
const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}") // выбираем все файлы указанного формата
    .pipe(webp({
      quality: 70
    })) // конвертируем через плагин
    .pipe(gulp.dest("build/img")); // сохраняем в указанную папку
}
exports.createWebp = createWebp;

//  Создание спрайта из иконок в svg
const sprite = () => {
  return gulp.src("source/img/icons/*.svg") // выбираем все файлы формата SVG в папке с иконками
    .pipe(svgmin((file) => { // сжимаем сначала svg файл
      const prefix = path.basename(file.relative, path.extname(file.relative));
      return {
        plugins: [{
          cleanupIDs: {
            prefix: prefix + '-',
            minify: true
          }
        }]
      }
    }))
    .pipe(svgstore({ // создаем спрайт
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg")) // Даем имя файлу
    .pipe(gulp.dest("build/img")); // сохраняем в указанную папку
}
exports.sprite = sprite;

// Выборка критических участков кода и стилей
const critcss =  (done) => {
  critical.generate({
      inline: true,
      base: 'build/',
      src: 'index.html',
      dest: 'index.html',
      minify: true,
      width: 360,
      height: 740
  });
  done();
}
exports.critcss = critcss;

/**
 *  Запуск задач
 */
// Запуск для сборки конечного продукта ( npm run build )
const build = gulp.series(
  cleanbuild,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    sprite,
    scriptsjs,
    createWebp
  ), critcss);
exports.build = build;

// Запуск по умолчанию - сборка в режиме разработчика (npm start)
exports.default = gulp.series(
  cleanbuild,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    sprite,
    scriptsjs,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
