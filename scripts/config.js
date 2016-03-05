window.earthview = window.earthview || {};

window.earthview.config = {
  // This is the template to build the maps link.
  MAPS_LINK: 'https://www.google.com/maps/@{{lat}},{{lng}},{{zoom}}z/' +
    'data=!3m1!1e3',
  // The base url to the images.
  IMAGE_BASE_URL: 'https://www.gstatic.com/prettyearth/assets/data/',
  // The deeplink base url to the earthview gallery.
  BASE_URL: 'https://earthview.withgoogle.com/',
  SHARE_BASE_URL: 'https://g.co/ev/'
};
