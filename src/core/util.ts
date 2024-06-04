
export function jQueryFetch(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        $.getJSON(url, resolve).fail(reject);
    });
}

export function proxify(proxy: string, url: string): string {
    return `${typeof window === "undefined"? "" : window.location.origin}/proxy/${proxy}/${url}`;
}
