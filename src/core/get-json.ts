
import DEFINES from "./defines"

declare const Android: {
    fetch(url: string): string
}

export interface GetJSONResult {
    abort(): void
    fail(callback: (error: any) => void): GetJSONResult
}

export type JSONFetch = (url: string, callback: (json: any) => void) => GetJSONResult;

let platformFetch: JSONFetch;

if(DEFINES?.android) {
    platformFetch = (url: string, callback: (json: any) => void) => {
        const result = Android.fetch(url);
        const json = JSON.parse(result);
        callback(json);
        return {
            abort() { },
            fail() { return this }
        }
    }
}
else {
    platformFetch = $.getJSON;
}

export const getJSON = platformFetch;