
import DEFINES from "./defines"
import { getJSON } from "./get-json";

/**
 * Equivalent to jQuery's getJSON but returns a promise instead of a special jQuery type.
 * @param url A URL to fetch from
 * @returns A promise with the returned JSON object
 */
export function getJsonPromise(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        getJSON(url, resolve).fail(reject);
    });
}

let platformProxify: (proxy: string, url: string) => string;

if(DEFINES?.android) {
    platformProxify = (proxy: string, url: string): string => {
        return url;
    }
}
else {
    platformProxify = (proxy: string, url: string): string => {
        return `${typeof window === "undefined"? "" : window.location.origin}/proxy/${proxy}/${url}`;
    }
}
    
/**
 * Returns a URL routed through the Booring server's proxy. Use Site.proxyHeaders to control
 * what headers get included through the proxy
 * @param proxy The ID of the site whose headers should be used for the proxy
 * @param url The URL to access via proxy
 * @returns The given URL but routed through the Booring server as a proxy
 */
export const proxify = platformProxify;