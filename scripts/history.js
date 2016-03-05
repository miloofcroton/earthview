/* global ga */
/**
 * The image history.
 */
backgrounds.History = new Model({
  /**
   * The height of the thumbnail-images.
   *
   * @type {number} size in px
   * @const
   */
  THUMBNAIL_HEIGHT: 200,

    /**
     * The width of the thumbnail-images.
     *
     * @type {number} size in px
     * @const
     */
  THUMBNAIL_WIDTH: 300,

  /**
   * Initialize.
   */
  init: function() {
    /**
     * The history object
     * @type {Object}
     */
    if (localStorage.getItem('history')) {
      try {
        this.history = JSON.parse(
          localStorage.getItem('history').replace(/\u0000/g, '')
        );
      } catch(e) {
        this.history = [];
      }
    } else {
      this.history = [];
    }

    /**
     * The history HTMLElement
     * @type {HTMLElement}
     */
    this.$history = $('.history');

    /**
     * the content-element
     * @type {HTMLElement}
     */
    this.$wrapper = $('.main-wrapper');

    /**
     * the history arrow element
     * @type {HTMLElement}
     */
    this.$historyHint = $('.content__arrow');

    this.initEvents();
  },

  /**
   * init events
   */
  initEvents: function() {
    this.$historyHint.addEventListener('click', this.onHintClick.bind(this));
  },

  /**
   * Highlight one given history item.
   * @param {number} id The image id
   */
  highlightItem: function(id) {
    $('.history__item--current', this.$history)
      .classList.remove('history__item--current');

    $('#img' + id, this.$history).classList.add('history__item--current');
  },

  /**
   * Click on the Hint
   */
  onHintClick: function() {
    this.show();
    ga('send', 'event', {
      eventCategory: 'History',
      eventAction: 'Open via Click',
      eventLabel: earthview.app.photo.data.id
    });
  },

  /**
   * Add an item to the history
   * @param {Object} image The new history item
   */
  addItem: function(image) {
    // If we have this particular item already
    // in the history we do not want it! But we render the history anyway.
    if (this.isInHistory(image.id)) {
      this.render();
      return;
    }

    this.createThumbnail(image)
      .then(this.save)
      .then(this.render);
  },

  /**
   * Render a cropped, quadratic thumbnail-image from the given full-size-image.
   * Assumes that all source-images are in a landscape aspect-ratio and only
   * crops the left and right side.
   *
   * @param {object} image The image data
   * @return {Promise.<Image>} The promise
   */
  createThumbnail: function(image) {
    var width = this.THUMBNAIL_WIDTH,
      height = this.THUMBNAIL_HEIGHT;

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

        image.dataUri = canvas.toDataURL();

        resolve(image);
      };

      img.src = image.dataUri;

      img.style.width = this.THUMBNAIL_WIDTH + 'px';
      img.style.height = this.THUMBNAIL_HEIGHT + 'px';
    }.bind(this));
  },

  /**
   * Save the history.
   * @param {object} image The image data
   */
  save: function(image) {
    this.history.push(image);
    this.history = this.history.splice(-10);

    localStorage.setItem('history', JSON.stringify(this.history));
  },

  /**
   * Is the given id already in the history.
   * @param {number} id The image id
   * @return {bool} True if the item is already in the history
   */
  isInHistory: function(id) {
    var index = this.history.map(function(element) {
      return element.id;
    }).indexOf(id);

    return index >= 0;
  },

  /**
   * Hides or renders a hint to the history.
   */
  renderHint: function() {
    if (!localStorage.getItem('hintShown') && this.history.length >= 10) {
      this.$wrapper.classList.add('history-hint');
    } else {
      this.$wrapper.classList.remove('history-hint');
    }
  },

  /**
   * Render the history
   */
  render: function() {
    var template = $('#history-item'),
      placeholder = $('#placeholder-item'),
      historyItem,
      i;

    this.renderHint();

    if (this.$history.childElementCount > 0) {
      return;
    }

    this.history.forEach(function(item, index) {
      historyItem = this.createHistoryItem(item, template);

      if (index === this.history.length - 1) {
        historyItem.querySelector('.history__item')
            .classList.add('history__item--current');
      }

      this.$history.appendChild(historyItem);
    }.bind(this));
    for (i = this.history.length; i < 10; i++) {
      historyItem = this.createHistoryItem(null, placeholder);
      this.$history.appendChild(historyItem);
    }
  },

  /**
   * Toggle the state of the history.
   */
  toggle: function() {
    this.$wrapper.classList.toggle('history-shown');
  },

  /**
   * Show the history.
   */
  show: function() {
    this.$wrapper.classList.add('history-shown');
    this.$wrapper.classList.remove('history-hint');
  },

  /**
   * Hide the history.
   */
  hide: function() {
    this.$wrapper.classList.remove('history-shown');
  },

  /**
   * Create a history item
   * @param {Object} item     The item
   * @param {HTMLTemplate} template The template for the history item.
   * @return {HTMLElement} The history item element
   */
  createHistoryItem: function(item, template) {
    var node = document.importNode(template.content, true), country, location;
    if (!item) {
      return node;
    }
    country = item.geocode.country;
    location = item.geocode.locality ||
    item.geocode.administrative_area_level_2 ||
    item.geocode.administrative_area_level_1 || '';

    $('.history__item', node).id = 'img' + item.id;
    $('.history__item__image', node).style.backgroundImage =
      'url(' + item.dataUri + ')';

    if (location) {
      $('.history__item__title', node).textContent = location + ', ' + country;
    } else {
      $('.history__item__title', node).textContent = country;
    }

    $('.history__item', node).addEventListener('click',
      function(event) {
        this.highlightItem(item.id);
        this.trigger('imageSelected', item.id);
        localStorage.setItem('hintShown', true);
        this.renderHint();
        event.stopPropagation();
      }.bind(this)
    );
    return node;
  },

  /**
   * Deactive the history
   */
  deactivate: function() {
    this.$history.classList.add('history--deactive');
  },

  /**
   * Activate the history.
   */
  activate: function() {
    this.$history.classList.remove('history--deactive');
  }
});
