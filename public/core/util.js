"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxify = exports.getJsonPromise = void 0;
/**
 * Equivalent to jQuery's getJSON but returns a promise instead of a special jQuery type.
 * @param url A URL to fetch from
 * @returns A promise with the returned JSON object
 */
function getJsonPromise(url) {
    return new Promise(function (resolve, reject) {
        $.getJSON(url, resolve).fail(reject);
    });
}
exports.getJsonPromise = getJsonPromise;
/**
 * Returns a URL routed through the Booring server's proxy. Use Site.proxyHeaders to control
 * what headers get included through the proxy
 * @param proxy The ID of the site whose headers should be used for the proxy
 * @param url The URL to access via proxy
 * @returns The given URL but routed through the Booring server as a proxy
 */
function proxify(proxy, url) {
    return "".concat(typeof window === "undefined" ? "" : window.location.origin, "/proxy/").concat(proxy, "/").concat(url);
}
exports.proxify = proxify;
//# sourceMappingURL=util.js.map