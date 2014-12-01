;(function() {
  var jqueryFound = typeof jQuery !== 'undefined',
      nativeBind = Function.prototype.bind,
      nativeEvents = !!Image.prototype.addEventListener;

  // Use jQuery.extend() or borrow from L.Util.extend().
  var extend = jqueryFound ? jQuery.extend : function(dest) {
        var i, j, len, src;
        for (j = 1, len = arguments.length; j < len; j++) {
          src = arguments[j];
          for (i in src) {
            dest[i] = src[i];
          }
        }
        return dest;
      },
      bind = function(fn, obj) {
        var slice = Array.prototype.slice;

        // Use native Function.bind() or borrow from L.Util.bind().
        if (nativeBind && fn.bind === nativeBind) {
          return nativeBind.apply(fn, slice.call(arguments, 1));
        }

        var args = slice.call(arguments, 2);
        return function() {
          return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
      },
      isArray = Array.isArray || function(obj) {
        return (Object.prototype.toString.call(obj) === '[object Array]');
      };

  // Use native events where possible.
  var addListener = function(obj, event, fn) {
        if (nativeEvents) {
          obj.addEventListener(event, fn, false);
        }
        else {
          obj['on' + event] = fn;
        }
      },
      removeListener = function(obj, event, fn) {
        if (nativeEvents) {
          obj.removeEventListener(event, fn);
        }
        else {
          obj['on' + event] = null;
        }
      };

  /**
   * Default ImageLoader options.
   * @param { boolean } autoStart Start loading automatically? Default `true`.
   * @param { boolean } parallel Load multiple images in parallel? Default `true`.
   * @param { function } onProgress `progress` event listener.
   * @param { function } onComplete `complete` event listener.
   */
  var defaultOptions = {
    autoStart: true,
    parallel: true,
    onComplete: function() {}
  };

  /**
   * Loading status constants.
   */
  var NOT_LOADED = 'not-loaded',
      LOADING = 'loading',
      LOADED = 'loaded';

  /**
   * Event-driven customizable JavaScript image pre-/re-/loader.
   * Once created it can be used for reloading.
   *
   * @param { array | string } urls One or more URLs to load.
   * @param { object } options Options to use when loading and/or creating images.
   * Defaults to `{ autoStart: true, parallel: true }`.
   */
  var ImageLoader = function(urls, options) {
    // Bind event listeners.
    this._onLoadBound = bind(this._onLoad, this);
    this._onErrorBound = bind(this._onError, this);

    // Set initial options.
    this._options = extend(defaultOptions, options);

    // Set URLs to load.
    this.setUrls(urls);

    // Start loading automatically if required and there's something to load.
    if (this._options.autoStart && this._urls.length) {
      this.load();
    }
  };

  // Make the loading status constants public.
  ImageLoader.NOT_LOADED = NOT_LOADED;
  ImageLoader.LOADING = LOADING;
  ImageLoader.LOADED = LOADED;

  /**
   * Sets the image loader options, overrides existing ones (shallow copy).
   *
   * @param { object } options Options to set/modify.
   * @return { object ImageLoader }
   */
  ImageLoader.prototype.setOptions = function(options) {
    extend(this._options, options);
    return this;
  };

  /**
   * Stores the list of URLs to load (a local copy is made).
   *
   * @param { array | string } urls One or more URLs to load.
   * @return { object ImageLoader }
   */
  ImageLoader.prototype.setUrls = function(urls) {
    this._urls = [];
    if (typeof urls !== 'undefined') {
      this._urls = isArray(urls) ? urls.slice() : [ urls ];
    }

    return this;
  };

  /**
   * Creates a new `HTMLImageElement` .
   *
   * @param { number } index Index of the image.
   * @return { HTMLImageElement }
   */
  ImageLoader.prototype.createImage = function(index) {
    var img = new Image();
    img.dataset.loaderStatus = NOT_LOADED;
    return img;
  };

  /**
   * Adds itself as listener to image's events.
   *
   * @private
   */
  ImageLoader.prototype._attachListeners = function(image) {
    addListener(image, 'load', this._onLoadBound);
    addListener(image, 'error', this._onErrorBound);
    addListener(image, 'abort', this._onErrorBound);
  };

  /**
   * Removes itself as listener to image's events.
   *
   * @private
   */
  ImageLoader.prototype._detachListeners = function(image) {
    removeListener(image, 'load', this._onLoadBound);
    removeListener(image, 'error', this._onErrorBound);
    removeListener(image, 'abort', this._onErrorBound);
  };

  /**
   * Builds an event object that can be used for onProgress/onSuccess/onError.
   *
   * @param { HTMLImageElement } img Image to create the event for.
   * @private
   */
  ImageLoader.prototype._createEvent = function(img) {
    var result = {
      loader: this,
      image: img,
      url: img.src,
      index: this._images.indexOf(img),
      status: img.dataset.loaderStatus,
      completed: this._completed,
      failed: this._failed,
      total: this._urls.length
    };
    result.success = result.status === LOADED;
    return result;
  };

  /**
   * `img.onload` event listener.
   *
   * @private
   */
  ImageLoader.prototype._onLoad = function(event) {
    var img = event.target;
    img.dataset.loaderStatus = LOADED;
    this._detachListeners(img);

    this._completed++;
    this._notify(img);
    this._loadNext();
  };

  /**
   * `img.onerror` and `img.onabort` event listener.
   *
   * @private
   */
  ImageLoader.prototype._onError = function(event) {
    var img = event.target;
    img.dataset.loaderStatus = NOT_LOADED;
    this._detachListeners(img);

    this._failed++;
    this._notify(img);
    this._loadNext();
  };

  /**
   * `options.onProgress` and `options.onComplete` event trigger.
   *
   * @private
   */
  ImageLoader.prototype._notify = function(img) {
    var opts = this._options;

    if (opts.onProgress) {
      opts.onProgress(this._createEvent(img));
    }

    // If we're done fire the onComplete event.
    if ((this._completed + this._failed) === this._urls.length) {
      if (opts.onComplete) {
        opts.onComplete({
          loader: this,
          images: this.getImages(),
          completed: this._completed,
          failed: this._failed,
          total: this._urls.length
        });
      }
    }
  };

  /**
   * Returns (a copy of) the array of all images as-is, i.e. whatever the status.
   *
   * @return { array:HTMLImageElement }
   */
  ImageLoader.prototype.getImages = function() {
    return this._images ? this._images.slice() : [];
  };

  /**
   * Returns an array of all loaded images, i.e. `status == LOADED`.
   *
   * @return { array:HTMLImageElement }
   */
  ImageLoader.prototype.getCompleted = function() {
    var i,
        imgs = this._images,
        result = [];
    for (i = 0; i < imgs.length; i++) {
      if (imgs[i].dataset.loaderStatus === LOADED) {
        result.push(imgs[i]);
      }
    }
    return result;
  };

  /**
   * Returns an array of all failed images, i.e. `status == NOT_LOADED`.
   *
   * @return { array:HTMLImageElement }
   */
  ImageLoader.prototype.getFailed = function() {
    var i,
        imgs = this._images,
        result = [];
    for (i = 0; i < imgs.length; i++) {
      var status = imgs[i].dataset.loaderStatus;
      if (status === NOT_LOADED) {
        result.push(imgs[i]);
      }
    }
    return result;
  };

  /**
   * Starts loading images. Called automatically if `autoStart` option is `true`.
   */
  ImageLoader.prototype.load = function() {
    var i,
        opts = this._options,
        urls = this._urls;

    this._completed = 0;
    this._failed = 0;
    this._images = this._images || [];

    if (opts.parallel) {
      for (i = 0; i < urls.length; i++) {
        this._loadImage(urls[i], i);
      }
    }
    else {
      this._currentIndex = 0;
      this._loadImage(urls[0], 0);
    }

    return this;
  };

  /**
   * Continue loading. Called if `parallel` option is `false`.
   *
   * @private
   */
  ImageLoader.prototype._loadNext = function() {
    if (! this._options.parallel) {
      var i = ++this._currentIndex;
      if (i < this._urls.length) {
        this._loadImage(this._urls[i], i);
      }
    }
  };

  /**
   * Single image loading.
   *
   * @private
   */
  ImageLoader.prototype._loadImage = function(url, index) {
    var img = this.createImage(index);
    this._images[index] = img;
    img.dataset.loaderStatus = LOADING;
    this._attachListeners(img);
    img.src = url;
  };


  // Define the module.
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return ImageLoader;
    });
  }
  else {
    this.ImageLoader = ImageLoader;
  }
})();
