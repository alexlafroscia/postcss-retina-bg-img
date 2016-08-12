const URL_REGEX = new RegExp(/http(s)?:\/\//);

/**
 * Check if the URL path is a full URL
 *
 * @param {string} path
 * @return {boolean}
 */
export function isFullUrlPath(path) {
  return URL_REGEX.test(path);
}
