/* global ga */
/*eslint-disable */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
/*eslint-enable */

/**
 * Analytics Id.
 * @type {String}
 */
var ANALYTICS_ID = 'UA-54021204-2',
  counter, $element, links, analytics;

ga('create', ANALYTICS_ID, 'auto');
ga('set', 'checkProtocolTask', null);

/**
 * Set main page tracking.
 */
window.trackPageView = function() {
  ga('send', 'pageview', '/' + earthview.app.photo.data.id);
  ga('set', 'dimension1', earthview.app.version);
};

/**
 * Track exceptions.
 * @param {string} error The error message.
 * @param {string} url   The url where the error occured.
 * @param {string} line  The line on which the error occured.
 */
window.onerror = function (error, url, line) {
  ga('send', 'exception', {
    exDescription: url + '#' + line + ': ' + error
  });
};

/**
 * Track every click on a given link.
 * Use data-type attribute on the link to define click type.
 */
function trackClick() {
  var type = this.getAttribute('data-type');

  if (type === 'bookmarks-link') {
    ga('send', 'event', {
      eventCategory: 'type',
      eventAction: 'Open bookmarks'
     });
  } else if (type === 'share') {
    ga('send', 'event', {
      eventCategory: 'type',
      eventAction: this.getAttribute('title')
     });
  } else {
    ga('send', 'event', {
      eventCategory: 'type',
      eventAction: this.id,
      eventLabel: earthview.app.photo.id
     });
  }
}

/**
 * Get all link on the page.
 * @type {nodelist}
 */
links = document.querySelectorAll('a');

for (counter = 0; counter < links.length; counter++) {
  $element = links[counter];
  $element.addEventListener('click', trackClick, true);
}

/**
 * Track install/update events
 */
analytics = JSON.parse(localStorage.getItem('analytics'));

if (analytics) {
  ga('send', 'event', analytics);
  localStorage.removeItem('analytics');
}
