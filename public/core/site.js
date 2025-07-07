"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main class representing site functionality
 */
var Site = /** @class */ (function () {
    function Site(name, id) {
        /** True if autocomplete functionality should be enabled by calling `this.autocomplete(...)` */
        this.autocompleteEnabled = false;
        /** True if this site should be hidden when safe search is on */
        this.isPorn = false;
        /**
         * A set of HTTP headers to include in this site's proxy. Calling `proxify(this.id, url)`
         * will create a URL using the Booring server as a proxy, and it will include these headers.
         * A typical example is something like "Referrer": "http://example.com/" as sometimes sites
         * will not serve API calls unless it contains the right headers
         */
        this.proxyHeaders = {};
        /**
         * A list of environment variable names that will be substituted for their value if
         * encountered in a proxy query surrounded by curly braces. For example, including
         * "GELBOORU_API_KEY" in this array will replace all instances of "{GELBOORU_API_KEY}"
         * in a proxy URL with the value of the environment variable "GELBOORU_API_KEY"
         */
        this.proxyEnvVariables = [];
        this.name = name;
        this.id = id;
    }
    /**
     * Returns a site with a given ID
     * @param id The site's ID
     * @returns The site with the ID given, or undefined if it was not found
     */
    Site.find = function (id) {
        return Site.sites.find(function (x) { return x.id === id; });
    };
    /**
     * Returns a list of all currently registered sites
     * @returns The aforementioned list
     */
    Site.getAll = function () {
        return Site.sites;
    };
    /**
     * Registers a site with the frontend, and adds it to the site selection dropdown
     * @param site The site to register
     */
    Site.register = function (site) {
        Site.sites.push(site);
        site.onRegistered();
    };
    /**
     * Called when the site is first registered. Use this to initialise anything you need to
     */
    Site.prototype.onRegistered = function () { };
    /**
     * Called when the site is selected in search box's dropdown menu. Use this to initialise
     * autocomplete or anything else you need
     */
    Site.prototype.onSelected = function () { };
    /**
     * This function should take in a JSON object representing a post, and parse it into a Post
     * object that is usable by the Booru frontend. Implementing this function is entirely optional.
     * @param json The JSON object representing a post
     * @returns A parsed post
     * @throws If the post is not parseable, or if this function is not implemented.
     */
    Site.prototype.parsePost = function (json) {
        throw new Error("parsePost not implemented");
    };
    /**
     * Given a phrase, this function should call the `send()` and `complete()` functions to return a list of
     * autocomplete tags. This function should be asynchronous. This function does not need to be implemented
     * if autocompleteEnabled is false.
     * @param tag The phrase to autocomplete
     * @param send A function to send a set of autocomplete tags to the frontend. Can be called multiple times
     * @param complete A function to indicate that the autocomplete operation has finished
     * @param error A function to indicate that an error has occured, and that the autocomplete operation has ended
     */
    Site.prototype.autocomplete = function (tag, send, complete, error) {
        error("Autocomplete not implemented");
    };
    /**
     * Abort any current autocomplete operation, if any exist
     */
    Site.prototype.abortAutocomplete = function () { };
    /**
     * Searches a site and returns a `Post[]` containing the posts
     * @param tags The list of tags to search
     * @param page The page number of the search (essentially, how many times the user clicked "load more" in the frontend)
     * @param safeSearch Whether or not safe search is enabled. When true, the search should not display sensitive or NSFW results
     * @param send A function to send a set of posts to the frontend. Can be called multiple times
     * @param complete A function to indicate that the search operation has finished
     * @param error A function to indicate that an error has occured, and that the search operation has ended
     */
    Site.prototype.search = function (tags, page, safeSearch, send, complete, error) {
        error("Search not implemented");
    };
    /**
     * Abort any current search operation, if any exist
     */
    Site.prototype.abortSearch = function () { };
    /**
     * Given an ID, returns a promise for a Post with the given ID. This function may be called by the server, so do not use any browser-specific code here, like window or jQuery.
     * @param fetchJSON The fetch function to use. This is provided since jQuery is not available in this function.
     * @param id The post's ID
     * @returns A promise for a Post
     */
    Site.prototype.getPostByID = function (fetchJSON, id) {
        return new Promise(function (resolve, reject) {
            reject("getPostByID not implemented");
        });
    };
    /**
     * Given a post, generates an embed for things like Discord and Twitter.
     * @param post The post
     */
    Site.prototype.generateEmbed = function (post) {
        throw new Error("generateEmbed not implemented");
    };
    /**
     * List of all registered sites
     */
    Site.sites = [];
    return Site;
}());
exports.default = Site;
//# sourceMappingURL=site.js.map