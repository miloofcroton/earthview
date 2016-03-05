/* global ga */
/**
 * Main entry point of the app.
 */
backgrounds.App = new Model({

  /**
   * How often we load a new image.
   * @type {Number} The update interval in miliseconds.
   */
  UPDATE_INTERVAL: 0,

  /**
   * Initialize.
   */
  init: function() {
    this.getVersion();

    this.history = new backgrounds.History();
    this.photo = new backgrounds.Photo(this.history);
    this.globe = new backgrounds.Globe();
    this.share = new backgrounds.Share(this.photo);
    this.menu = new backgrounds.Menu(this.history);
    this.isHistoryScrollTracked = false;

    this.onOnlineStateChange();
    this.photo.show();

    this.initEvents();
  },

  /**
   * Initialize app events
   */
  initEvents: function() {
    // module events
    this.photo.on('show', this.history.addItem);
    this.photo.on('show', this.globe.set);

    this.history.on('imageSelected', this.photo.show);

    window.addEventListener('click', this.onBackgroundClick);
    window.addEventListener('online', this.onOnlineStateChange);
    window.addEventListener('offline', this.onOnlineStateChange);

    window.addEventListener('mousewheel', this.onMouseWheel);
  },

  /**
   * When click on Background
   * @param {MouseEvent} event Event on click
   */
  onBackgroundClick: function(event) {
    if (event.target.className !== 'content') {
      return;
    }
    this.history.hide();
  },

  /**
   * When Scrolling to the History
   * @param {MouseEvent} event Event on Scrolling
   */
  onMouseWheel: function(event) {
    if (
      Math.abs(event.wheelDeltaX) > Math.abs(event.wheelDeltaY) ||
      event.wheelDeltaY === 0
    ) {
      return;
    }
    if (event.wheelDeltaY < 0) {
      this.history.show();
      if (!this.isHistoryScrollTracked) {
        this.isHistoryScrollTracked = true;
        ga('send', 'event', {
          eventCategory: 'History',
          eventAction: 'Open via Scroll',
          eventLabel: this.photo.data.id
        });
      }
    } else {
      this.history.hide();
    }
  },

  /**
   * Set the online status
   * @param {Event} event The online/offline event
   */
  onOnlineStateChange: function() {
    this.online = navigator.onLine;

    if (this.online) {
      this.history.activate();
    } else {
      this.history.deactivate();
    }
  },

  /**
   * Get the version of the extension.
   */
  getVersion: function() {
    var app = chrome.app.getDetails();
    this.version = app ? app.version : 'dev';
  },

  /**
   * Shows the changes overlay.
   */
  showChanges: function() {
    var $container = document.querySelector('.overlay--changes');
    $container.classList.add('overlay--active');

    $container.addEventListener('click', this.hideChanges);
    $container.querySelector('.overlay__content__close')
      .addEventListener('click', this.hideChanges);
    $container.querySelector('.changes__dismiss')
      .addEventListener('click', this.hideChanges);
  },

  /**
   * Hides the changes overlay.
   * @param {Event} event The event triggering the overlay close.
   */
  hideChanges: function(event) {
    var target = event.target;

    if (target.classList.contains('changes__dismiss') ||
      target.classList.contains('overlay') ||
      target.classList.contains('overlay__content__close')) {
      event.preventDefault();
      event.stopPropagation();

      document.querySelector('.overlay--changes')
        .classList.remove('overlay--active');

      localStorage.setItem('changesOverlayClosed', true);
    }
  }
});

/**
 * Initilize app
 * @type {backgrounds.App}
 */
window.earthview.app = new backgrounds.App();

window.trackPageView();
