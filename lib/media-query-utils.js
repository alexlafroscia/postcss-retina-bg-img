/**
 * Determine if one media query is "contained" by another
 *
 * For MQ "A" to contain MQ "B", "A" must be at least as specific as "B".
 *
 * @example
 *   // returns `true`
 *   containsRetinaMediaQuery('(min-width: 600px) and (max-width: 800px)', '(min-width: 600px)');
 *
 * @example
 *   // returns `false`
 *   containsRetinaMediaQuery('(min-width: 600px) and (max-width: 800px)', '(min-width: 600px), (max-width: 700px)');
 *
 * @param {string} params
 * @param {string} retinaMediaQuery the media query to check membership of
 * @return {boolean}
 */
export function containsRetinaMediaQuery(params, retinaMediaQuery) {
  if (params === retinaMediaQuery) {
    return true;
  }

  return retinaMediaQuery
    .split(',')
    .map((part) => part.trim())
    .reduce((prev, part) => {
      return prev && params.indexOf(part) >= 0;
    }, true);
}

/**
 * Perform a "logic AND" on the two media queries
 *
 * @param {string} retinaQuery
 * @param {string} parentQuery
 * @return {string} the combined query
 */
export function combineMediaQueries(retinaQuery, parentQuery) {
  return retinaQuery
    .split(', ')
    .map((segment) => `${segment} and ${parentQuery}`)
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
