QUnit.module("ImageLoader");

// Embedded images to use in tests.
var INVALID_IMAGE = "data:image/gif;base64,invalid=",
    BLACK_GIF = "data:image/gif;base64,R0lGODdhAQABAIABAAAAAP///ywAAAAAAQABAAACAkQBADs=",
    RED_GIF = "data:image/gif;base64,R0lGODdhAQABAIABAP8AAP///ywAAAAAAQABAAACAkQBADs=",
    WHITE_GIF = "data:image/gif;base64,R0lGODdhAQABAIAAAP///////ywAAAAAAQABAAACAkQBADs=",
    VALID_IMAGES = [ BLACK_GIF, RED_GIF, WHITE_GIF];

QUnit.asyncTest("Nothing to load (no args)", function (assert) {
  var loader = new ImageLoader();
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    var expected = 0;
    var actual = loader.getImages().length;
    assert.equal(actual, expected, "There was nothing to load.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("Load single URL (not an array)", function (assert) {
  var loader = new ImageLoader(BLACK_GIF);
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    var expected = 1;
    var actual = loader.getImages().length;
    assert.equal(actual, expected, "Single image loaded.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("Load multiple URLs", function (assert) {
  var loader = new ImageLoader(VALID_IMAGES);
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    var expected = 3;
    var actual = loader.getImages().length;
    assert.equal(actual, expected, "Multiple images loaded.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("Load a valid image", function (assert) {
  var loader = new ImageLoader(BLACK_GIF);
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  // Has to be asyncTest, resource loading takes time!
  setTimeout(function() {
    var actual = loader.getImages();
    assert.equal(actual.length, 1, "One image created.");
    assert.equal(actual[0].src, BLACK_GIF, "URL confirmed.");
    assert.equal(actual[0].dataset.loaderStatus, ImageLoader.LOADED, "Image loaded.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("Load an invalid image", function (assert) {
  var loader = new ImageLoader(INVALID_IMAGE);
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  // Has to be asyncTest, resource loading takes time!
  setTimeout(function() {
    var actual = loader.getImages();
    assert.equal(actual.length, 1, "One image created.");
    assert.equal(actual[0].src, INVALID_IMAGE, "URL confirmed.");
    assert.equal(actual[0].dataset.loaderStatus, ImageLoader.NOT_LOADED, "Image not loaded.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("Confirm loaded URLs", function (assert) {
  var loader = new ImageLoader(VALID_IMAGES);
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    var expected = VALID_IMAGES;
    var actual = loader.getImages();
    var i;
    for (i in actual) {
      assert.equal(actual[i].src, expected[i], "URL #" + i + " confirmed.");
    }

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("onProgress fired for a valid image", function (assert) {
  var listener = sinon.spy(),
      loader = new ImageLoader(BLACK_GIF, { onProgress: listener });
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    assert.equal(listener.callCount, 1, "onProgress fired once.");
    assert.ok(listener.calledWith(sinon.match.object), "Event object present.");
    var event = listener.firstCall.args[0];
    assert.equal(event.url, BLACK_GIF, "event.url confirmed.");
    assert.equal(event.status, ImageLoader.LOADED, "event.status confirmed.");
    assert.equal(event.completed, 1, "event.completed confirmed.");
    assert.equal(event.failed, 0, "event.failed confirmed.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("onProgress fired for an invalid image", function (assert) {
  var listener = sinon.spy(),
      loader = new ImageLoader(INVALID_IMAGE, { onProgress: listener });
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    assert.equal(listener.callCount, 1, "onProgress fired once.");
    assert.ok(listener.calledWith(sinon.match.object), "Event object present.");
    var event = listener.firstCall.args[0];
    assert.equal(event.url, INVALID_IMAGE, "event.url confirmed.");
    assert.equal(event.status, ImageLoader.NOT_LOADED, "event.status confirmed.");
    assert.equal(event.completed, 0, "event.completed confirmed.");
    assert.equal(event.failed, 1, "event.failed confirmed.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("onProgress fired for mulitple valid images", function (assert) {
  var listener = sinon.spy(),
      loader = new ImageLoader(VALID_IMAGES, { onProgress: listener });
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    var expected = VALID_IMAGES.length;
    assert.equal(listener.callCount, expected, "onProgress fired " + expected + " times.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("onComplete fired for one valid image", function (assert) {
  var listener = sinon.spy(),
      loader = new ImageLoader(BLACK_GIF, { onComplete: listener });
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    assert.equal(listener.callCount, 1, "onComplete fired once.");
    assert.ok(listener.calledWith(sinon.match.object), "Event object present.");
    var event = listener.firstCall.args[0];
    assert.equal(event.loader, loader, "event.loader confirmed.");
    assert.equal(event.total, 1, "event.total confirmed.");
    assert.equal(event.completed, 1, "event.completed confirmed.");
    assert.equal(event.failed, 0, "event.failed confirmed.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("onComplete fired for an invalid image", function (assert) {
  var listener = sinon.spy(),
      loader = new ImageLoader(INVALID_IMAGE, { onComplete: listener });
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    assert.equal(listener.callCount, 1, "onComplete fired once.");
    assert.ok(listener.calledWith(sinon.match.object), "Event object present.");
    var event = listener.firstCall.args[0];
    assert.equal(event.loader, loader, "event.loader confirmed.");
    assert.equal(event.total, 1, "event.total confirmed.");
    assert.equal(event.completed, 0, "event.completed confirmed.");
    assert.equal(event.failed, 1, "event.failed confirmed.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("onComplete fired for multiple mixed images", function (assert) {
  var urls = [ BLACK_GIF, INVALID_IMAGE, WHITE_GIF ],
      listener = sinon.spy(),
      loader = new ImageLoader(urls, { onComplete: listener });
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    assert.equal(listener.callCount, 1, "onComplete fired once.");
    assert.ok(listener.calledWith(sinon.match.object), "Event object present.");
    var event = listener.firstCall.args[0];
    assert.equal(event.loader, loader, "event.loader confirmed.");
    assert.equal(event.total, 3, "event.total confirmed.");
    assert.equal(event.completed, 2, "event.completed confirmed.");
    assert.equal(event.failed, 1, "event.failed confirmed.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("onComplete fired last", function (assert) {
  var onProgress = sinon.spy(),
      onComplete = sinon.spy(),
      loader = new ImageLoader(VALID_IMAGES, {
        onProgress: onProgress,
        onComplete: onComplete
      });
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    assert.equal(onProgress.callCount, VALID_IMAGES.length, "onProgress fired multiple times.");
    assert.equal(onComplete.callCount, 1, "onComplete fired once.");
    assert.ok(onComplete.calledAfter(onProgress), "onComplete fired last.");

    QUnit.start();
  }, 5);
});

QUnit.asyncTest("Serial Loading (in sequence, non-parallel)", function (assert) {
  var onProgress = sinon.spy(),
      onComplete = sinon.spy(),
      loader = new ImageLoader(VALID_IMAGES, {
        parallel: false,
        onProgress: onProgress,
        onComplete: onComplete
      });
  assert.ok(loader instanceof ImageLoader, "ImageLoader instance created.");

  setTimeout(function() {
    var i, expected = VALID_IMAGES.length;
    assert.equal(onProgress.callCount, expected, "onProgress fired " + expected + " times.");
    assert.equal(onComplete.callCount, 1, "onComplete fired once.");
    assert.ok(onComplete.calledAfter(onProgress), "onComplete fired last.");

    for (i = 0; i < onProgress.callCount; i++) {
      var event = onProgress.getCall(i).args[0];
      assert.equal(event.url, VALID_IMAGES[i], "#" + (1 + i) + " event.url confirmed.");
    }

    QUnit.start();
  }, 5);
});
