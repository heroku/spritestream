var express      = require('express');
var es           = require('event-stream');
var gulp         = require('gulp');
var http         = require('http');
var path         = require('path');
var spritestream = require('..');
var app          = express();

app.use(express.static(path.join(__dirname, 'static')));

gulp.src(path.join(__dirname, './fixtures/images/**/*.png')).pipe(spritestream(function(err, results) {
  if (err) { throw err; }

  es.readArray([
    results.legacy,
    results.retina,
    results.css
  ]).pipe(gulp.dest(path.join(__dirname, './static')))
  .on('end', function() {
    http.createServer(app).listen(function() {
      console.log('http://localhost:' + this.address().port);
    });
  });
}));
