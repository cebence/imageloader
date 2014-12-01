# ImageLoader

[![Build Status][travis-image]][travis-url]

`ImageLoader` is a customizable, event-driven JavaScript image pre-/re-/loader.

Simplest use case (loading images in parallel):

```javascript
// Load three images in parallel and show each one when it's loaded.
var urls = [
  'http://dummyimage.com/80x80/f00/000',
  'http://dummyimage.com/80x80/0f0/000',
  'http://dummyimage.com/80x80/00f/fff'
];
new ImageLoader(urls, {
  onProgress: function(event) {
    if (event.success) {
      document.getElementById('images').appendChild(event.image);
    }
  }
});
```

### TODO Describe the options

### TODO Describe the events

### TODO A few more examples

Sequential loading use case:

```javascript
// Load images in sequence.
var urls = [
  'http://dummyimage.com/80x80/f00/000',
  'http://dummyimage.com/80x80/0f0/000',
  'http://dummyimage.com/80x80/00f/fff'
];
new ImageLoader(urls, {
  parallel: false,
  onProgress: function(event) {
    if (event.success) {
      $('#images').append(event.image);
    }
  }
});
```

A more complex use case:

```javascript
// Load three images in parallel and inform on progress.
var urls = [
  'http://dummyimage.com/80x80/f00/000',
  'http://dummyimage.com/80x80/0f0/000',
  'http://dummyimage.com/80x80/00f/fff'
];
new ImageLoader(urls, {
  onProgress: function(event) {
    if (event.status === ImageLoader.LOADED) {
      $('#images').append(event.image);
    }
    var left = event.total - event.completed - event.failed;
    $('#images-status').text(left + ' images left to load...');
  },

  onComplete: function(event) {
    $('#images-status').text(event.completed + '/' + event.total + ' images loaded.');
  }
});
```

[travis-url]: https://travis-ci.org/cebence/imageloader
[travis-image]: http://img.shields.io/travis/cebence/imageloader.svg?style=flat-square
