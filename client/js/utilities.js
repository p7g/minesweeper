let cookies = null;
/**
 * Get a cookie
 *
 * @param {string} name The name of the cookie to get
 * @returns {string} The value of the cookie
 */
export function getCookie(name) { // eslint-disable-line import/prefer-default-export
  // lazily get cookies
  if (cookies === null) {
    cookies = {};
    document.cookie
      .split(/;\s*/)
      .map(s => s.split('=').map(decodeURIComponent))
      .forEach(([key, value]) => { cookies[key] = value; });
  }
  return cookies[name];
}
