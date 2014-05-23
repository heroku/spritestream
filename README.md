# spritestream

spritestream is a utility for reading a pipe of Vinyl image file objects and
turning them into a non-retina sprite file, a retina sprite file, and an
accompanying CSS file. It assumes that for each `image.png`, there is an
accompanying `image@2x.png`.

## Usage

Pipe your source files into `spritestream`, and give it a callback. The callback
will receive either an error or an array of results with the non-retina sprite
image, the retina sprite image, and the CSS file, in that order.

```javascript
var es           = require('event-stream');
var gulp         = require('gulp');
var spritestream = require('spritestream');

gulp.src('./images/**/*.png').pipe(spritestream(function(err, results) {
  if (err) { throw err; }
  es.readArray(results).pipe(gulp.dest('./public'));
}));
```

## Options

### `digest`

Append an md5 hash of the file contents to the end of its name

### `imagesPath`

The path, relative to the ultimate pipe destination, to attach to the image
Vinyl file objects.

### `cssPath`

The path, relative to the ultimate pipe destination, to attach to the css Vinyl
file objects.

### Example

This example will result in the following files:

- `./public/images/sprites-34509438543098abcde.png`
- `./public/images/sprites-234098234098234908a@2x.png`
- `./public/stylesheets/sprites-styles-2340823049823094098.css`

```javascript
gulp.src('./images/**/*.png').pipe(spritestream({
  digest    : true,
  imagesPath: './images/sprites',
  cssPath   : './stylesheets/sprites-styles'
}, function(err, results) {
  es.readArray(results).pipe(gulp.dest('./public'));
});
```

## Installation

```sh
npm install spritestream --save
```

## Tests

Automated tests:

```sh
npm test
```

Manual tests:

```sh
npm run test-server
```

## Credits

The icons used in the test suite—"Watch", "Breakfast", "Sketchbook", and
"Twinkie"—were designed by [Edward Boatman][boatman] from
[thenounproject.com][nounproject].

[boatman]: http://www.thenounproject.com/edward
[nounproject]: http://www.thenounproject.com/
