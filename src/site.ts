import type AutocompleteTag from "./autocomplete-tag";
import type Post from "./post";

export default class Site {

    public static sites: Site[] = [];
    public static current: Site;

    public name: string;
    public id: string;
    public autocompleteEnabled: boolean = false;
    public isPorn: boolean = false;

    constructor() { }

    public onRegistered() { }
    public onSelected() { }

    public autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {
        error("Autocomplete not implemented");
    }

    public abortAutocomplete() { }

    public search(tags: string[], page: number, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) { 
        error("Search not implemented");
    }

    public abortSearch() { }
}