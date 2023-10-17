
export function asyncGetJSON(url) {
    return new Promise((resolve, reject) => {
        $.getJSON(url, resolve).fail(reject);
    });
}

export function proxify(proxy, url) {
    return `${window.location.origin}/proxy/${proxy}/${url}`;
}
