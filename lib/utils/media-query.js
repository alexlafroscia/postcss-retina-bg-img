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
export function queryCoversRange(lessRestrictive, moreRestrictive) {
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
      return prev || arrayContainsAllElementsOfArray(lessAndParts, moreAndParts);
    }, false);
  }, true);
}

function explodeMediaQuery(query) {
  return query
    .split(',')
    .map((part) => part.trim())
    .map((orSection) => orSection
      .split('and')
      .map((part) => part.trim())
    );
}

function arrayContainsAllElementsOfArray(smaller, larger) {
  return smaller.reduce((prev, element) => {
    return prev && larger.indexOf(element) >= 0;
  }, true);
}

/**
 * Perform a "logic AND" on the two media queries
 *
 * @param {string} retinaQuery
 * @param {string} parentQuery
 * @return {string} the combined query
 */
export function distributeQueryAcrossQuery(a, b) {
  const aParts = explodeMediaQuery(a);
  const bParts = explodeMediaQuery(b);

  return aParts
    .map((aPart) => bParts
      .map((bPart) => `${aPart} and ${bPart}`)
      .join(', ')
    )
    .join(', ');
}

/**
 * Check if a given node is a media query
 *
 * @param {PostCSS.Node} node
 * @returns {boolean}
 */
export function nodeIsMediaQuery(node) {
  return node.type === 'atrule' && node.name === 'media';
}
