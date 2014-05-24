var express      = require('express');
var es           = require('event-stream');
var fs           = require('fs');
var gulp         = require('gulp');
var http         = require('http');
var path         = require('path');
var tmp          = require('tmp');
var spritestream = require('..');
var app          = express();


gulp.src(path.join(__dirname, './fixtures/images/**/*.png')).pipe(spritestream({
  imagesPath: './images/sprites',
  cssPath  : './stylesheets/sprites'
}, function(err, results) {
  if (err) { throw err; }

  tmp.dir(function(err, tmpPath) {
    app.use(express.static(path.join(tmpPath, 'public')));

    es.readArray(results).pipe(gulp.dest(path.join(tmpPath, 'public'))).on('end', function() {
      fs.readFile(path.join(__dirname, 'fixtures/index.html'), function(err, index) {
        fs.writeFile(path.join(tmpPath, 'public/index.html'), index, function(err) {
          http.createServer(app).listen(function() {
            console.log('http://localhost:' + this.address().port);
          });
        });
      });
    });
  });
}));
