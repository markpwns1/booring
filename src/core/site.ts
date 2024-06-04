import type AutocompleteTag from "./autocomplete-tag";
import Embed from "./embed";
import type Post from "./post";

export default class Site {

    private static sites: Site[] = [];
    public static current: Site;

    public static find(id: string): Site | undefined {
        return Site.sites.find(x => x.id === id);
    }

    public static getAll(): ReadonlyArray<Site> {
        return Site.sites;
    }

    public static register(site: Site) {
        Site.sites.push(site);
        site.onRegistered();
    }

    public name: string;
    public id: string;
    public autocompleteEnabled: boolean = false;
    public isPorn: boolean = false;

    public proxyHeaders: { [key: string]: string } = { }

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }

    public onRegistered() { }
    public onSelected() { }
    
    public parsePost(json: any): Post {
        throw new Error("parsePost not implemented");
    }

    public autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {
        throw new Error("Autocomplete not implemented");
    }

    public abortAutocomplete() { }

    public search(tags: string[], page: number, safeSearch: boolean, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) { 
        throw new Error("Search not implemented");
    }

    public abortSearch() { }

    public getPostByID(fetchJSON: (url: string) => Promise<any>, id: string): Promise<Post> {
        return new Promise((resolve, reject) => {
            reject("getPostByID not implemented");
        });
    }

    public generateEmbed(post: Post): Embed {
        throw new Error("generateEmbed not implemented");
    }
}