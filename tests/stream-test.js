var crypto       = require('crypto');
var es           = require('event-stream');
var fs           = require('fs');
var gulp         = require('gulp');
var path         = require('path');
var tmp          = require('tmp');
var spritestream = require('..');
var expectedCSS  = fs.readFileSync(path.join(__dirname, './fixtures/expected-css.css'));

require('should');

it('outputs a valid CSS file', function(done) {
  compile(null, function(results) {
    var css = results[2];

    expectedCSS.toString().should.eql(css.contents.toString());
    done();
  });
});

it('accepts a custom images path', function(done) {
  tmp.dir({ unsafeCleanup: true }, function(err, tmpPath) {
    compile({ imagesPath: './custom-images/custom-sprite' }, function(results) {
      es.readArray(results).pipe(gulp.dest(tmpPath)).on('end', function() {
        fs.exists(path.join(tmpPath, 'custom-images/custom-sprite.png'), function(exists) {
          exists.should.eql(true);
          done();
        });
      });
    });
  });
});

it('accepts a custom css path', function(done) {
  tmp.dir({ unsafeCleanup: true }, function(err, tmpPath) {
    compile({ cssPath: './custom-stylesheets/custom-css' }, function(results) {
      es.readArray(results).pipe(gulp.dest(tmpPath)).on('end', function() {
        fs.exists(path.join(tmpPath, 'custom-stylesheets/custom-css.css'), function(exists) {
          exists.should.eql(true);
          done();
        });
      });
    });
  });
});

describe('when given the digest option', function() {
  it('digests image names', function(done) {
    compile({ digest: true }, function(results) {
      digestValue = digest(results[0].contents);
      results[0].path.should.eql('sprites-' + digestValue + '.png');
      done();
    });
  });

  it('digests CSS names', function(done) {
    compile({ digest: true }, function(results) {
      digestValue = digest(results[2].contents);
      results[2].path.should.eql('sprites-' + digestValue + '.css');
      done();
    });
  });
});

function digest(contents) {
  var hash = crypto.createHash('md5');
  hash.update(contents);
  return hash.digest('hex');
}

function compile(opts, cb) {
  gulp.src('./tests/fixtures/images/*.png')
    .pipe(spritestream(opts, function(err, results) {
      if (err) { throw err; }
      cb(results);
    }));
}
