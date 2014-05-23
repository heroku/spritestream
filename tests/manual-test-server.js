var express      = require('express');
var es           = require('event-stream');
var gulp         = require('gulp');
var http         = require('http');
var path         = require('path');
var spritestream = require('..');
var app          = express();

app.use(express.static(path.join(__dirname, 'static')));

gulp.src(path.join(__dirname, './fixtures/**/*.png')).pipe(spritestream({
  imagesPath: './images/sprite',
  cssPath  : './stylesheets/css'
}, function(err, results) {
  if (err) { throw err; }

  es.readArray(results).pipe(gulp.dest(path.join(__dirname, './static')))
  .on('end', function() {
    http.createServer(app).listen(function() {
      console.log('http://localhost:' + this.address().port);
    });
  });
}));
