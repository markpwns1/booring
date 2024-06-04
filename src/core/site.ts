import type AutocompleteTag from "./autocomplete-tag";
import Embed from "./embed";
import type Post from "./post";

/**
 * Main class representing site functionality
 */
export default class Site {

    /**
     * List of all registered sites
     */
    private static sites: Site[] = [];

    /**
     * The current site selected in the frontend
     */
    public static current: Site;

    /**
     * Returns a site with a given ID
     * @param id The site's ID
     * @returns The site with the ID given, or undefined if it was not found
     */
    public static find(id: string): Site | undefined {
        return Site.sites.find(x => x.id === id);
    }

    /**
     * Returns a list of all currently registered sites
     * @returns The aforementioned list
     */
    public static getAll(): ReadonlyArray<Site> {
        return Site.sites;
    }

    /**
     * Registers a site with the frontend, and adds it to the site selection dropdown
     * @param site The site to register
     */
    public static register(site: Site) {
        Site.sites.push(site);
        site.onRegistered();
    }

    /** The name of the site. Can be anything */
    public name: string;

    /** The unique ID of the site. Can be anything, as long as it's unique */
    public id: string;

    /** True if autocomplete functionality should be enabled by calling `this.autocomplete(...)` */
    public autocompleteEnabled: boolean = false;

    /** True if this site should be hidden when safe search is on */
    public isPorn: boolean = false;

    /** 
     * A set of HTTP headers to include in this site's proxy. Calling `proxify(this.id, url)` 
     * will create a URL using the Booring server as a proxy, and it will include these headers.
     * A typical example is something like "Referrer": "http://example.com/" as sometimes sites
     * will not serve API calls unless it contains the right headers
     */
    public proxyHeaders: { [key: string]: string } = { }

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }

    /**
     * Called when the site is first registered. Use this to initialise anything you need to
     */
    public onRegistered() { }

    /**
     * Called when the site is selected in search box's dropdown menu. Use this to initialise
     * autocomplete or anything else you need
     */
    public onSelected() { }
    
    /**
     * This function should take in a JSON object representing a post, and parse it into a Post
     * object that is usable by the Booru frontend. Implementing this function is entirely optional.
     * @param json The JSON object representing a post
     * @returns A parsed post
     * @throws If the post is not parseable, or if this function is not implemented.
     */
    public parsePost(json: any): Post {
        throw new Error("parsePost not implemented");
    }

    /**
     * Given a phrase, this function should call the `send()` and `complete()` functions to return a list of 
     * autocomplete tags. This function should be asynchronous. This function does not need to be implemented
     * if autocompleteEnabled is false.
     * @param tag The phrase to autocomplete
     * @param send A function to send a set of autocomplete tags to the frontend. Can be called multiple times
     * @param complete A function to indicate that the autocomplete operation has finished
     * @param error A function to indicate that an error has occured, and that the autocomplete operation has ended
     */
    public autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {
        error("Autocomplete not implemented");
    }

    /**
     * Abort any current autocomplete operation, if any exist
     */
    public abortAutocomplete() { }

    /**
     * Searches a site and returns a `Post[]` containing the posts
     * @param tags The list of tags to search
     * @param page The page number of the search (essentially, how many times the user clicked "load more" in the frontend)
     * @param safeSearch Whether or not safe search is enabled. When true, the search should not display sensitive or NSFW results
     * @param send A function to send a set of posts to the frontend. Can be called multiple times
     * @param complete A function to indicate that the search operation has finished
     * @param error A function to indicate that an error has occured, and that the search operation has ended
     */
    public search(tags: string[], page: number, safeSearch: boolean, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) { 
        error("Search not implemented");
    }

    /**
     * Abort any current search operation, if any exist
     */
    public abortSearch() { }

    /**
     * Given an ID, returns a promise for a Post with the given ID. This function may be called by the server, so do not use any browser-specific code here, like window or jQuery.
     * @param fetchJSON The fetch function to use. This is provided since jQuery is not available in this function.
     * @param id The post's ID
     * @returns A promise for a Post
     */
    public getPostByID(fetchJSON: (url: string) => Promise<any>, id: string): Promise<Post> {
        return new Promise((resolve, reject) => {
            reject("getPostByID not implemented");
        });
    }

    /**
     * Given a post, generates an embed for things like Discord and Twitter.
     * @param post The post
     */
    public generateEmbed(post: Post): Embed {
        throw new Error("generateEmbed not implemented");
    }
}