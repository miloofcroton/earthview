backgrounds.Share = new Model({
  /**
   * Initializes the class.
   * @param {backgrounds.Photo} photo The photo object.
   */
  init: function(photo) {
    this.photo = photo;

    this.$overlay = $('.overlay');
    this.$overlayClose = $('.overlay__content__close', this.$overlay);

    this.$shareDeeplinkButton = $('.share__deeplink__button');
    this.$shareLinks = $('.share__links');

    this.$shareDeeplink = $('.share__deeplink');
    this.$shareDeeplinkInput = $('input', this.$shareDeeplink);
    this.$shareDeeplinkCopy = $('.share__deeplink__copy', this.$shareDeeplink);
    this.$shareDeeplinkImage = $(
      '.share__deeplink__image img',
      this.$shareDeeplink
    );

    this.initEvents();
  },

  /**
   * Initializes event-handlers for DOM-elements.
   */
  initEvents: function() {
    this.$shareDeeplinkButton.addEventListener(
        'click', this.shareDeeplink.bind(this));

    this.$shareLinks.addEventListener(
        'click', this.handleShareLinkClick.bind(this));

    this.$shareDeeplinkCopy.addEventListener(
        'click', this.copyDeeplink.bind(this));

    this.$overlay.addEventListener(
        'click', this.onOverlayClick.bind(this));

    this.$overlayClose.addEventListener(
        'click', this.onOverlayClick.bind(this));
  },

  /**
   * Handles click events to the deeplink share button.
   * @param {MouseEvent} event the click-event.
   */
  shareDeeplink: function(event) {
    event.preventDefault();
    event.stopPropagation();

    this.photo.getThumbnail(440, 250).then(function(image) {
      this.$shareDeeplinkImage.src = image.dataUri;
    }.bind(this));

    this.$shareDeeplink.classList.toggle('overlay--active');

    this.$shareDeeplinkInput.value =
      earthview.config.SHARE_BASE_URL + this.photo.getId();

    this.$shareDeeplinkInput.focus();
    this.$shareDeeplinkInput.select();
  },

  /**
   * Copies the deeplink to the users clipboard.
   * @param {MouseEvent} event the click-event.
   */
  copyDeeplink: function(event) {
    event.preventDefault();
    event.stopPropagation();

    this.$shareDeeplinkInput.focus();
    this.$shareDeeplinkInput.select();

    document.execCommand('copy');
  },

  /**
   * Handles clicks to the .share__links container.
   * @param {MouseEvent} event the click-event.
   */
  handleShareLinkClick: function(event) {
    var target = event.target;

    do {
      if (target.dataset && target.dataset.type === 'share') {
        this.share(target.href);
        event.preventDefault();

        break;
      }

      target = target.parentNode;
    } while (target !== null);
  },

  /**
   * Handles clicks on the overlay. Mainly close the overlay.
   * @param {event} event The click event.
   */
  onOverlayClick: function(event) {
    if (event.target === this.$overlay || event.target === this.$overlayClose) {
      this.$shareDeeplink.classList.remove('overlay--active');
    }
  },

  /**
   * Open share dialogs
   * @param  {string} shareUrl the url to be opened
   */
  share: function(shareUrl) {
    window.open(
      shareUrl + this.photo.getId(),
      'Share',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'
    );
  }

});
