/**
 * Determine if the more restrictive media query covers all cases of the less restrictive one
 *
 * For MQ "A" to contain MQ "B", "A" must be at least as specific as "B".
 *
 * @example
 *   // returns `true`
 *   queryCoversRange('(min-width: 600px)', '(min-width: 600px) and (max-width: 800px)');
 *
 * @example
 *   // returns `false`
 *   queryCoversRange('(min-width: 600px), (max-width: 700px)', '(min-width: 600px) and (max-width: 800px)');
 *
 * @param {string} lessRestrictive
 * @param {string} moreRestrictive the media query to check membership of
 * @return {boolean}
 */
function queryCoversRange(lessRestrictive, moreRestrictive) {
  // Short curcuit if there is an exact match
  if (lessRestrictive === moreRestrictive) {
    return true;
  }

  const lessRestrictiveParts = explodeMediaQuery(lessRestrictive);
  const moreRestrictiveParts = explodeMediaQuery(moreRestrictive);

  return lessRestrictiveParts.reduce((orPrevious, lessAndParts) => {
    // Short curcuit if a previous part was not satisfied
    if (!orPrevious) {
      return false;
    }

    return moreRestrictiveParts.reduce((prev, moreAndParts) => {
      return (
        prev || arrayContainsAllElementsOfArray(lessAndParts, moreAndParts)
      );
    }, false);
  }, true);
}

/**
 * Break a media query string into parts
 *
 * @example
 *   const q = '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)';
 *
 *   explodeMediaQuery(q);
 *   // => ['(-webkit-min-device-pixel-ratio: 2)', '(min-resolution: 192dpi)']
 *
 * @param {string} query the media query string to break apart
 * @return {array} the structure of the provided media query
 */
function explodeMediaQuery(query) {
  return query
    .split(',')
    .map(part => part.trim())
    .map(orSection => orSection.split('and').map(part => part.trim()));
}

/**
 * Verify that one array contains all the elements of another
 *
 * @example
 *   const smaller = ['a'];
 *   const larger = ['b'];
 *
 *   arrayContainsAllElementsOfArray(smaller, larger);
 *   // => true
 *
 * @param {array} smaller the array to ensure is contained by the other
 * @param {array} larger the array to ensure contains the other
 * @return {boolean}
 */
function arrayContainsAllElementsOfArray(smaller, larger) {
  return smaller.reduce((prev, element) => {
    return prev && larger.indexOf(element) >= 0;
  }, true);
}

/**
 * Perform a "logic AND" on the two media queries
 *
 * @example
 *   const a = '(min-width: 600px)';
 *   const b = '(max-width: 800px)';
 *
 *   distributeQueryAcrossQuery(a, b);
 *   // => '(min-width: 600px), (max-width: 800px)'
 *
 * @example
 *   const a = '(min-width: 600px)';
 *   const b = '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)';
 *
 *   distributeQueryAcrossQuery(a, b);
 *   // => '(-webkit-min-device-pixel-ratio: 2) and (min-width: 600px), (min-resolution: 192dpi) and (min-width: 600px)'
 *
 * @param {string} firstQuery the first query to include
 * @param {string} secondQuery the second query to include
 * @return {string} the combined query
 */
function distributeQueryAcrossQuery(firstQuery, secondQuery) {
  const aParts = explodeMediaQuery(firstQuery);
  const bParts = explodeMediaQuery(secondQuery);

  return aParts
    .map(aPart => bParts.map(bPart => `${aPart} and ${bPart}`).join(', '))
    .join(', ');
}

/**
 * Check if a given node is a media query
 *
 * @param {PostCSS.Node} node
 * @returns {boolean}
 */
function nodeIsMediaQuery(node) {
  return node.type === 'atrule' && node.name === 'media';
}

module.exports = {
  queryCoversRange,
  distributeQueryAcrossQuery,
  nodeIsMediaQuery
};
