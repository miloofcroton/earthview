backgrounds.Menu = new Model({
  /**
   * initialize the menu
   * @param {backgrounds.History} history the history component.
   */
  init: function(history) {
    this.history = history;
    this.timer = null;

    this.$container = $('.menu');
    this.$links = this.$container.querySelectorAll('.menu__item');

    this.initEvents();
  },

  /**
   * init events
   */
  initEvents: function() {
    this.$container.addEventListener('mouseover', this.open.bind(this));
    this.$container.addEventListener('mouseout', this.close.bind(this));

    for (var i = 0; i < this.$links.length; i++) {
      this.$links[i].addEventListener('click',
        this.handleMenuClick.bind(this));
    }
  },

  /**
   * open menu
   */
  open: function() {
    var $menu = this.$container;

    clearTimeout(this.timer);
    this.timer = setTimeout(function() {
      $menu.classList.remove('menu--closed');
    }, 50);
  },

  /**
   * close menu
   */
  close: function() {
    var $menu = this.$container;

    clearTimeout(this.timer);
    this.timer = setTimeout(function() {
      $menu.classList.add('menu--closed');
    }, 150);
  },

  /**
   * handle. menu. click.
   * Like the name says.
   *
   * @param {MouseEvent} event the click event
   */
  handleMenuClick: function(event) {
    var target = event.currentTarget,
      url = target.href;

    if (target.hash === '#history') {
      this.history.toggle();
    } else if (
      target.href &&
      !target.classList.contains('menu__item--maps') &&
      (window.chrome && chrome.tabs)
    ) {
      if (target.target === '_blank') {
        this.openNewTab(url);
      } else {
        this.updateTabLocation(url);
      }

      event.preventDefault();
    }
  },

  /**
   * Open the location in a new tab.
   * @param  {string} url The new URL.
   */
  openNewTab: function(url) {
    chrome.tabs.create({
      url: url
    });
  },

  /**
   * Update the location in the current tab.
   * @param  {string} url The new URL.
   */
  updateTabLocation: function(url) {
    chrome.tabs.update({
      url: url
    });
  }
});
