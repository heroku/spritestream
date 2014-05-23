var es           = require('event-stream');
var fs           = require('fs');
var gulp         = require('gulp');
var path         = require('path');
var spritestream = require('..');
var expectedCSS  = fs.readFileSync(path.join(__dirname, './fixtures/expected-css.css'));

require('should');

it('outputs a valid CSS file', function(done) {
  compile(function(results) {
    expectedCSS.toString().should.eql(results.css.contents.toString());
    done();
  });
});

function compile(cb) {
  gulp.src('./tests/fixtures/images/*.png')
    .pipe(spritestream(function(err, results) {
      if (err) { throw err; }
      cb(results);
    }));
}
