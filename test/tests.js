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