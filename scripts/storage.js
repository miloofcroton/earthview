/**
 * A wrapper around the localStorage to cache the image
 */
backgrounds.Storage = new Model({
  /**
   * Set the image.
   * @param  {Object} image The photo to save
   * @returns {Promise} The promise
   */
  setImage: function(image) {
    return new Promise(function(resolve, reject) {
      if (typeof image === 'string') {
        reject(new Error('Only an object can be saved!'));
      } else {
        localStorage.setItem('image', JSON.stringify(image));
        resolve();
      }
    });
  },

  /**
   * check if a image is in the cache.
   * @return {boolean} true if there is a cached image
   */
  hasImage: function() {
    return !!localStorage.getItem('image');
  },

  /**
   * Get the cached image.
   * @return {Object} The cached image
   */
  getImage: function() {
    var image = localStorage.getItem('image');

    if (!image) {
      return null;
    }

    return JSON.parse(image);
  }
});
