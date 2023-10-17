
export function asyncGetJSON(url) {
    return new Promise((resolve, reject) => {
        $.getJSON(url, resolve).fail(reject);
    });
}
