# spritestream

spritestream is a utility for reading a pipe of Vinyl image file objects and
turning them into a non-retina sprite file, a retina sprite file, and an
accompanying CSS file. It assumes that for each `image.png`, there is an
accompanying `image@2x.png`.

## Usage

```javascript
var es           = require('event-stream');
var gulp         = require('gulp');
var spritestream = require('spritestream');

gulp.src('./images/**/*.png').pipe(spritestream(function(err, results) {
  if (err) { throw err; }

  es.readArray([
    results.legacy,
    results.retina,
    results.css
  ]).pipe(gulp.dest('./public'));
}));
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

The lovely icons used by the test suite are:

- Watch designed by [Edward Boatman][boatman] from the [thenounproject.com][nounproject]
- Breakfast designed by [Edward Boatman][boatman] from the [thenounproject.com][nounproject]
- Sketchbook designed by [Edward Boatman][boatman] from the [thenounproject.com][nounproject]
- Twinkie designed by [Edward Boatman][boatman] from the [thenounproject.com][nounproject]

[boatman]: http://www.thenounproject.com/edward
[nounproject]: http://www.thenounproject.com/
