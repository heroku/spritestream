'use strict';

var crypto         = require('crypto');
var es             = require('event-stream');
var fs             = require('fs');
var gulp           = require('gulp');
var path           = require('path');
var tmp            = require('tmp');
var spritestream   = require('..');
var expectedCSS    = fs.readFileSync(path.join(__dirname, './fixtures/expected-css.css'));
var expectedLegacy = fs.readFileSync(path.join(__dirname, './fixtures/expected-legacy.png'));
var expectedRetina = fs.readFileSync(path.join(__dirname, './fixtures/expected-retina.png'));

require('should');

describe('output files', function() {
  var results;

  before(function(done) {
    compile(null, function(res) {
      results = res;
      done();
    });
  });

  it('outputs the expected non-retina file', function() {
    var image = results[0];
    expectedLegacy.should.eql(image.contents);
  });

  it('outputs the expected retina file', function() {
    var image = results[1];
    expectedRetina.should.eql(image.contents);
  });

  it('outputs the expected CSS file', function() {
    var css = results[2];
    expectedCSS.should.eql(css.contents);
  });
});

describe('when given a custom CSS class', function() {
  var results;

  before(function(done) {
    compile({ cssClass: 'sprite' }, function(res) {
      results = res;
      done();
    });
  });

  it('uses the custom CSS class', function() {
    var expected = expectedCSS.toString().replace(/icon/g, 'sprite');
    results[2].contents.toString().should.eql(expected);
  });
});

describe('when given a custom template', function() {
  var results;

  before(function(done) {
    compile({ template: '<%= cssClass %>s: <%= icons.length %>' }, function(res) {
      results = res;
      done();
    });
  });

  it('uses the custom template', function() {
    results[2].contents.toString().should.eql('icons: 4');
  });
});

describe('when given custom path options', function() {
  var tmpPath;

  before(function(done) {
    tmp.dir({ unsafeCleanup: true }, function(err, tmpDirPath) {
      tmpPath = tmpDirPath;

      compile({
        imagesPath: './custom-images/custom-sprite',
        cssPath   : './custom-stylesheets/custom-css'
      }, function(results) {
        es.readArray(results).pipe(gulp.dest(tmpPath)).on('end', done);
      });
    });
  });

  it('accepts a custom images path', function(done) {
    fs.exists(path.join(tmpPath, 'custom-images/custom-sprite.png'), function(exists) {
      exists.should.eql(true);
      done();
    });
  });

  it('accepts a custom css path', function(done) {
    fs.exists(path.join(tmpPath, 'custom-stylesheets/custom-css.css'), function(exists) {
      exists.should.eql(true);
      done();
    });
  });
});

describe('when given the digest option', function() {
  var results;

  before(function(done) {
    compile({ digest: true }, function(res) {
      results = res;
      done();
    });
  });

  it('digests image names', function() {
    var digestValue = digest(results[0].contents);
    results[0].path.should.eql('sprites-' + digestValue + '.png');
  });

  it('digests CSS names', function() {
    var digestValue = digest(results[2].contents);
    results[2].path.should.eql('sprites-' + digestValue + '.css');
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
