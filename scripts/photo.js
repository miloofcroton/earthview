/* global ga */
/**
 * The current photo view.
 */
backgrounds.Photo = new Model({
  /**
   * The data object for the current image
   * @type {Object}
   */
  data: {
    id: null
  },

  /**
   * Initialize.
   * @param {backgrounds.History} history The history object
   */
  init: function(history) {
    this.history = history;

    this.$background = $('.background__image');
    this.$history = $('.history');
    this.nextImage = false;
    this.$mapsMenu = $('.menu__item--maps');
    this.$location = $('.content__location');
    this.$locationRegion = $('.content__location__region');
    this.$locationCountry = $('.content__location__country');
    this.$attributionText = $('.content__attribution__text');
    this.$shareLinks = document.querySelectorAll('[data-type=share]');
    this.$downloadLink = document.querySelector('.menu__item--download');

    this.storage = new backgrounds.Storage();

    Object.observe(this, function (event) {
      if (event[0].name === 'data') {
        this.render();
      }
    }.bind(this));
  },

  /**
   * Show an image
   * @param {int} id The image ID to load
   */
  show: function(id) {
    if (id === this.data.id) {
      return;
    }

    if (id) {
      ga('send', 'event', {
        eventCategory: 'History',
        eventAction: 'Select',
        eventLabel: id
      });
      earthview.app.history.history.forEach(function(photo) {
        if (photo.id === id) {
          earthview.app.photo.$background.style.backgroundImage =
            'url(' + photo.dataUri + ')';
        }
      });
      this.nextImage = id;
      this.requestImage(id)
        .then(this.updateImageData, this.error);
      return;
    }

    if (this.storage.hasImage()) {
      this.updateImageData(this.storage.getImage());
    }

    this.requestRandomImage().then(this.saveImage, this.error);
  },

  /**
   * Gets the id of the current image.
   * @return {number} The image id.
   */
  getId: function() {
    return this.data.id;
  },

  /**
   * Render a cropped, quadratic thumbnail-image from the given full-size-image.
   * Assumes that all source-images are in a landscape aspect-ratio and only
   * crops the left and right side.
   *
   * @param {number} width The width of the new image data.
   * @param {number} height The width of the new image data.
   * @return {Promise.<Image>} The promise
   */
  getThumbnail: function(width, height) {
    var thumb = {};

    return new Promise(function(resolve, reject) {
      var img = document.createElement('img');

      img.onerror = reject;
      img.onload = function() {
        var canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(
          img, 0, 0, width, height
        );

        thumb.dataUri = canvas.toDataURL();

        resolve(thumb);
      };

      img.src = this.data.dataUri;

      img.style.width = width + 'px';
      img.style.height = height + 'px';
    }.bind(this));
  },

  /**
   * save the image to local storage for later use
   * @param  {string} newImage The image data
   */
  saveImage: function(newImage) {
    var oldImage = this.storage.getImage();

    if (newImage === oldImage || this.history.isInHistory(newImage.id)) {
      this.requestRandomImage().then(this.saveImage, this.error);
      return;
    }

    this.storage.setImage(newImage);

    if (!this.data.id) {
      this.updateImageData(newImage);
    }
  },

  /**
   * Set the current showing image
   * @param {string} data The image data
   */
  updateImageData: function(data) {
    if (!this.nextImage || this.nextImage === data.id) {
      this.data = data;
      this.nextImage = false;
      if (!this.storage.hasImage()) {
        this.saveImage(data);
      }
    }
  },

  /**
   * Get a new image id.
   * @return {int} The new image id.
   */
  getRandomImageId: function() {
    var subset,
      newIDs = [],
      oldIDs = [];

    backgrounds.imageIds.forEach(function(id) {
      var target = id >= 5000 ? newIDs : oldIDs;
      target.push(id);
    });

    subset = Math.random() > 0.25 ? newIDs : oldIDs;
    return subset[Math.floor(Math.random() * subset.length)];
  },

  /**
   * Request a random image from the server.
   * @return {Promise} a promise to be fulfilled with the image-data
   */
  requestRandomImage: function() {
    return this.requestImage(this.getRandomImageId());
  },

  /**
   * Request a specific image form the server.
   * @param  {number} id The image id
   * @return {Promise}    The promise. I Promise.
   */
  requestImage: function(id) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();

      request.open(
        'GET',
        earthview.config.IMAGE_BASE_URL +
        id +
        '.json',
        true
      );
      request.onload = function() {
        if (request.status === 200) {
          resolve(JSON.parse(request.response));
        } else {
          reject(request.statusText);
        }
      };
      request.send();
    });
  },

  /**
   * Set Background photo to the passed photo.
   */
  render: function() {
    var linkUrl = earthview.config.MAPS_LINK
      .replace('{{lat}}', this.data.lat)
      .replace('{{lng}}', this.data.lng)
      .replace('{{zoom}}', this.data.zoom + 1 || 11),
      downloadLink = earthview.config.BASE_URL + 'download/'
        + this.data.id + '.jpg',
      country = this.data.geocode.country,
      location = this.data.geocode.locality ||
      this.data.geocode.administrative_area_level_2 ||
      this.data.geocode.administrative_area_level_1 || '',
      linkTitle = 'See ' + location + ', ' + country +
      ' on Google Maps';

    // this.$background.style.backgroundImage = 'url(' + this.getImageUrl(this.data) + ')';
    this.$background.style.backgroundImage = 'url(' + this.data.dataUri + ')';

    this.$downloadLink.setAttribute('href', downloadLink);
    this.$attributionText.textContent = this.data.attribution;
    this.$location.setAttribute('href', linkUrl);
    this.$mapsMenu.setAttribute('href', linkUrl);
    this.$location.setAttribute('title', linkTitle);
    this.$mapsMenu.setAttribute('title', linkTitle);
    this.$locationRegion.textContent = location;
    this.$locationCountry.textContent = country;

    this.trigger('show', this.data);
  },

  /**
   * generate an url to be used for the background-image of the photo
   * using.
   *
   * @param {object} data object as retrieved from the json-file
   * @returns {string} the object-url for the background-image
   */
  getImageUrl: function(data) {
    var
      base64 = data.dataUri.replace('data:image\/jpeg;base64,', ''),
      blob = new Blob([this.base64DecToArr(base64)], {type: 'image/jpeg'});

    return URL.createObjectURL(blob);
  },

  /**
   * convert a single base64-char to the corresponding 6-bit [0..63] unsigned
   * int-value.
   *
   * @param {number} nChr ordinal of the base64-character
   * @returns {number} uint6-value according to the character
   */
  b64ToUint6: function(nChr) {
    if (nChr > 64 && nChr < 91) {
      return nChr - 65;
    }
    if (nChr > 96 && nChr < 123) {
      return nChr - 71;
    }
    if (nChr > 47 && nChr < 58) {
      return nChr + 4;
    }
    if (nChr === 43) {
      return 62;
    }
    if (nChr === 47) {
      return 63;
    }

    return 0;
  },

  /**
   * convert a base64-encoded string into an Uint8Array.
   * (source: MDN – http://goo.gl/uYsm4N)
   *
   * @param {string} sBase64 base64-encoded data
   * @returns {Uint8Array} byte-array with decoded data
   */
  base64DecToArr: function(sBase64) {
    var
      sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ''),
      nInLen = sB64Enc.length,
      nOutLen = nInLen * 3 + 1 >> 2,
      taBytes = new Uint8Array(nOutLen),
      nMod3, nMod4, nUint24, nOutIdx, nInIdx;

    for (nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
      nMod4 = nInIdx & 3;
      nUint24 |= this.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
          taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
        }

        nUint24 = 0;
      }
    }

    return taBytes;
  }
});
