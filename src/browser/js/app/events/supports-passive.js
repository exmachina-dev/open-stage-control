// https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection

var supportsPassive = false;

try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener("testPassive", null, opts);
  window.removeEventListener("testPassive", null, opts);
} catch (e) {}

module.exports = supportsPassive
