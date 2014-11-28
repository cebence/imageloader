QUnit.module("ImageLoader");

// Embedded images to use in tests.
var INVALID_IMAGE = "data:image/gif;base64,invalid=",
    BLACK_GIF = "data:image/gif;base64,R0lGODdhAQABAIABAAAAAP///ywAAAAAAQABAAACAkQBADs=",
    RED_GIF = "data:image/gif;base64,R0lGODdhAQABAIABAP8AAP///ywAAAAAAQABAAACAkQBADs=",
    WHITE_GIF = "data:image/gif;base64,R0lGODdhAQABAIAAAP///////ywAAAAAAQABAAACAkQBADs=",
    VALID_IMAGES = [ BLACK_GIF, RED_GIF, WHITE_GIF];

QUnit.test("Nothing to load (no args)", function (assert) {
  var loader = new ImageLoader();
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  var expected = 0;
  var actual = loader.getImages().length;
  assert.equal(actual, expected, "There was nothing to load.");
});

QUnit.test("Load single URL (not an array)", function (assert) {
  var loader = new ImageLoader(BLACK_GIF);
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  var expected = 1;
  var actual = loader.getImages().length;
  assert.equal(actual, expected, "Single image loaded.");
});

QUnit.test("Load multiple URLs", function (assert) {
  var loader = new ImageLoader(VALID_IMAGES);
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  var expected = 3;
  var actual = loader.getImages().length;
  assert.equal(actual, expected, "Multiple images loaded.");
});

QUnit.asyncTest("Load an invalid image/URL", function (assert) {
  var loader = new ImageLoader(INVALID_IMAGE);
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  // Has to be asyncTest, resource loading takes time!
  setTimeout(function() {
    var actual = loader.getImages();
    assert.equal(actual.length, 1, "One image created.");
    assert.equal(actual[0].src, INVALID_IMAGE, "URL confirmed.");
    assert.equal(actual[0].dataset.loaderStatus, ImageLoader.NOT_LOADED, "Image not loaded.");
    QUnit.start();
  }, 100);
});

QUnit.test("Confirm loaded URLs", function (assert) {
  var loader = new ImageLoader(VALID_IMAGES);
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  var expected = VALID_IMAGES;
  var actual = loader.getImages();
  var i;
  for (i in actual) {
    assert.equal(actual[i].src, expected[i], "URL #" + i + " confirmed.");
  }
});
