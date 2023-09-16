import type AutocompleteTag from "./autocomplete-tag";
import type Post from "./post";

export default class Site {

    public static sites: Site[] = [];
    public static current: Site;

    public name: string;
    public id: string;
    public autocompleteEnabled: boolean = false;
    public isPorn: boolean = false;

    public onRegistered() { }
    public onSelected() { }

    public autocomplete(tag: string, onComplete: (tags: AutocompleteTag[]) => void, onError: (error: any) => void) {
        onError("Autocomplete not implemented");
    }

    public abortAutocomplete() { }

    public search(tags: string[], page: number, onComplete: (posts: Post[], endOfResults: boolean) => void, onError: (error: any) => void) { 
        onError("Search not implemented");
    }

    public abortSearch() { }
}