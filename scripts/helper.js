/**
 * Fake jQuery Selector
 * @param  {String}  selector The CSS selector
 * @param  {DOMNode}  node A node wher we search in
 * @return {Element}          The found element(s)
 */
window.$ = function(selector, node) {
  node = node || document;

  return node.querySelector(selector);
};
