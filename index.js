var File        = require('vinyl');
var async       = require('async');
var concat      = require('concat-stream');
var crypto      = require('crypto');
var ejs         = require('ejs');
var fs          = require('fs');
var path        = require('path');
var spritesmith = require('spritesmith');

module.exports = function(opts, cb) {
  opts = opts || {};

  if (typeof opts === 'function') {
    cb   = opts;
    opts = {};
  }

  opts = getOpts(opts);

  var legacyImages = [];
  var retinaImages = [];

  return concat(function(files) {
    files.forEach(function(file) {
      if (/@2x\.png$/.test(file.path)) {
        retinaImages.push(file.path);
      } else {
        legacyImages.push(file.path);
      }
    });
  }).on('finish', compileSprites);

  function compileSprite(images, isRetina, cb) {
    spritesmith({
      algorithm: 'binary-tree',
      engine   : 'pngsmith',
      src      : images
    }, function(err, result) {
      if (err) { return cb(err); }

      var spriteFile = getSpriteFile(result, isRetina);

      cb(null, {
        result: result,
        file  : spriteFile
      });
    });
  }

  function compileSprites() {
    async.parallel({
      legacy: function(cb) { compileSprite(legacyImages, false, cb); },
      retina: function(cb) { compileSprite(legacyImages, true,  cb); }
    }, function(err, results) {
      if (err) { return cb(err); }

      getCSSFile(results.legacy.result, results.retina.result, function(err, cssFile) {
        if (err) { return cb(err); }

        cb(null, [
          results.legacy.file,
          results.retina.file,
          cssFile
        ]);
      });
    });
  }

  function getCSSFile(legacySprite, retinaSprite, cb) {
    var templatePath = path.join(__dirname, './templates/sprites.css.ejs');

    fs.readFile(templatePath, function(err, template) {
      if (err) { return cb(err); }

      var icons = Object.keys(legacySprite.coordinates).map(function(key) {
        var coordinate = legacySprite.coordinates[key];

        return {
          name: path.basename(key).split('.')[0],
          width: coordinate.width,
          height: coordinate.height,
          x: coordinate.x,
          y: coordinate.y
        };
      });

      var contents = ejs.render(template.toString(), {
        legacyURL: '/sprite.png',
        retinaURL: '/sprite@2x.png',
        width : legacySprite.properties.width,
        height: legacySprite.properties.height,
        icons : icons,
        pixels: function(int, prefix) {
          prefix = prefix || '';

          if (int === 0) {
            return 0;
          } else {
            return prefix + int + 'px';
          }
        }
      });

      var cssPath;

      if (opts.digest) {
        cssPath = opts.cssPath + '-' + digest(contents);
      } else {
        cssPath = opts.cssPath;
      }

      var file = new File({
        path    : cssPath + '.css',
        contents: new Buffer(contents)
      });

      cb(null, file);
    });
  }

  function getOpts(opts) {
    var defaultOpts = {
      imagesPath: 'sprites',
      cssPath   : 'sprites',
      digest    : false
    };

    for (var key in defaultOpts) {
      if (!opts.hasOwnProperty(key)) {
        opts[key] = defaultOpts[key];
      }
    }

    return opts;
  }

  function getSpriteFile(result, isRetina) {
    var imagePath = opts.imagesPath;
    var digestValue, fileName, segments;

    if (opts.digest) {
      imagePath += '-' + digest(result.image);
    }

    if (isRetina) {
      imagePath += '@2x.png';
    } else {
      imagePath += '.png';
    }

    return new File({
      path    : imagePath,
      contents: new Buffer(result.image, 'binary')
    });
  }

  function digest(contents) {
    var hash = crypto.createHash('md5');
    hash.update(contents);
    return hash.digest('hex');
  }
};
