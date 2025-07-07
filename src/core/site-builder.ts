
import AutocompleteTag from "./autocomplete-tag";
import CachedAutocomplete from "./cached-autocomplete";
import Post from "./post";
import Site from "./site";
import TagType from "./tag-type";
import { getJsonPromise } from "./util";

/**
 * Represents an autocomplete system that queries a URL for its results. Used in Danbooru, for example
 */
export interface SiteNetworkAutocompleteModule {
    /** The URL to query */
    url: string;
    /** Preprocessor function that turns the raw query result into a list of JSON objects */
    preprocessor?: (json: any) => any[];
    /** Function that transforms a JSON object representing an autocomplete tag into a proper `AutocompleteTag` */
    transformer: (jsonResult: any) => AutocompleteTag;
    /** The minimum length of the input before the autocomplete takes effect. 3 is a good number usually */
    minLength?: number;
    /** The delay (in ms) after a keypress before the autocomplete takes effect. 300 is a good number usually. */
    delay?: number;
}

/**
 * Represents an autocomplete system that queries a URL once to obtain a local cache, and uses that cache for
 * all autocomplete operations. Note that this **ONLY** works for caches of the format: 
 * ```text
 * 3`firsttag`alias` 0`secondtag` 4`thirdtag`
 * ```
 * Used in Konachan for example.
 */
export interface SiteCachedAutocompleteModule {
    /** The url to query to get the cache. Usually called a "summary" of tags */
    summaryUrl: string;
    /** Each tag in the cache is prepended with a number. This field should be a dictionary of numbers to tag types  */
    typeToEnum: { [key: string | number]: TagType };
    /** 
     * An arbitrary string representing the version of this autocomplete, so that in the future, you can change 
     * this value and it'll regenerate the cache instead of using the cache from the old version.
     */
    version: string;
    /** The minimum length of the input before the autocomplete takes effect. 3 is a good number usually */
    minLength?: number;
    /** The delay (in ms) after a keypress before the autocomplete takes effect. 300 is a good number usually. */
    delay?: number;
}

/**
 * Site options to pass to the site builder
 */
export interface SiteTemplateOptions {
    /** The site's name */
    name: string;
    /** The site's ID */
    id: string;
    /** See `Site.isPorn` */
    isPorn: boolean;
    /** See `Site.proxyHeaders` */
    proxyHeaders?: { [key: string]: string };
    /** See `Site.proxyEnvVariables` */
    proxyEnvVariables?: string[];
    /** The autocomplete module to use, if any */
    autocompleteModule?: SiteNetworkAutocompleteModule | SiteCachedAutocompleteModule;
    /** 
     * A URL to query for searches, where {tags} and {page} are replaced with the list of tags and page number.
     * Example: `https://mysite.com/search?q={tags}&p={page}`
     */
    searchUrl: string;
    /** The tag to append when safe search is enabled. Usually this is "rating:general" */
    safeSearchTag?: string;
    /**
     * A function that transforms the raw JSON result of a query to `searchUrl` into a list of raw JSON posts.
     * This function is useful if your website's API returns the results in a special field like "posts" or 
     * something. This function is optional. 
     * @param json The raw JSON returned from a query to `searchUrl`
     * @returns A list of JSON objects representing posts
     */
    searchPreprocessor?: (json: any) => any[];
    /**
     * A function that transforms a raw JSON object into a Post usable by the frontend
     * @param jsonResult A JSON object representing a post
     * @returns A Post usable by the frontend
     */
    searchTransformer: (jsonResult: any) => Post;
    /**
     * Booring's page numbers are 0-indexed. Set `searchPageOffset` to 1 if your site uses 1-indexed pages, or 
     * any other value 
     */
    searchPageOffset?: number;
    /**
     * The delimiter for search tags in the fetch URL. Typically this is space.
     */
    searchTagDelimiter?: string;
}

function dummyAutocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void): NodeJS.Timeout { 
    return setTimeout(() => {}, 0); 
}

function dummyPreprocessor(json: any): any[] {
    return json;
}

export class SiteBuilder {

    /**
     * Given a set of parameters, generates a function that autocompletes a search term via network query to the specified URL
     * @param url The URL to query for the autocomplete operation
     * @param transformer A function that transforms a JSON object representing an autocomplete tag into a proper `AutocompleteTag`
     * @param options Miscellaneous options for the generator
     * @returns A function that performs a search asynchronously at the specified query and returns a `NodeJS.Timeout` or a `JQueryjqXHR?` which can be used to cancel the operation
     */
    public static buildNetworkAutocomplete(
        url: string, 
        transformer: (jsonResult: any) => AutocompleteTag, 
        options: { 
            minLength?: number, 
            delay?: number, 
            preprocessor?: (json: any) => any[] 
        } = { }): (tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) => NodeJS.Timeout | JQuery.jqXHR | null
    {
        options.delay = options.delay || 0;
        options.minLength = options.minLength || 1;
        const preprocessor = options.preprocessor || dummyPreprocessor;

        if(options.delay > 0) {
            return (tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void): NodeJS.Timeout => {
                const f = SiteBuilder.buildNetworkAutocomplete(url, transformer, { ...options, delay: 0 });
                return setTimeout(() => f(tag, send, complete, error), options.delay);
            }
        }
        else {
            return (tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void): JQuery.jqXHR | null => {
                const { negation, baseTag } = AutocompleteTag.decompose(tag);

                if(baseTag.length < (options.minLength || 1)) {
                    send([]);
                    complete();
                    return null;
                }

                const getURL = encodeURI(url.replace("{tag}", baseTag));
                return $.getJSON(getURL, json => {
                    const tags: AutocompleteTag[] = [];
                    const processed = preprocessor(json);
                    for(const result of processed) {
                        const tag = transformer(result);
                        tag.label = negation + tag.label;
                        tag.value = negation + tag.value;
                        tags.push(tag);
                    }

                    send(tags);
                    complete();
                });
            }
        }
    }

    /**
     * Generates a function that performs a search at a specified URL.
     * @param url The URL to query for a search
     * @param transformer A function that turns a JSON object representing a post, into a proper `Post`
     * @param options Miscellaneous options for the generator
     * @returns A function that asynchronously performs a search at the specified URL and returns a `jQuery.jqXHR<any>` to cancel the operation
     */
    public static buildSearcher(
        url: string, 
        transformer: (json: any) => Post, 
        options: { 
            /** The tag to include when safe search is enabled */
            safeSearchTag?: string,
            /** A function that turns the raw JSON result into a list of JSON objects to pass to `transformer` */
            preprocessor?: (json: any) => any[], 
            /** The page to start at when searching. For some sites this is 0, for others it's 1. */
            pageOffset?: number,
            /** The delimiter to use in the URL for the search. For example, if using "," it would be: `http://mysite.com/search?tags=first,second,third` */
            delimiter?: string
        } = { 
            preprocessor: dummyPreprocessor, 
            pageOffset: 0,
            delimiter: " "
        }
    ) {
        return (
            tags: string[], 
            page: number, 
            safeSearch: boolean,
            send: (posts: Post[]) => void, 
            complete: (newPage: number, endOfResults: boolean) => void, 
            error: (error: any) => void
        ): JQuery.jqXHR<any> => {

            if(options.safeSearchTag && safeSearch) {
                tags = tags.concat(options.safeSearchTag);
            }

            const endpoint = encodeURI(url.replace("{tags}", tags.join(options.delimiter || " ")).replace("{page}", (page + (options.pageOffset || 0)).toString()));
            console.log("Searching... " + endpoint);

            return $.getJSON(endpoint, json => {
                const posts: Post[] = [];
                const processed = options.preprocessor!(json);

                for(const result of processed) {
                    const post = transformer(result);
                    if(post) posts.push(post);
                }

                console.log("Search successful");

                send(posts);
                complete(page, posts.length < 20);
            })
            .fail(error);
        }
    }

    /**
     * Generates a site given a set of Site template options
     * @param options The template options
     * @returns The generated site
     */
    public static buildSite(options: SiteTemplateOptions): Site {
        if(options.autocompleteModule) {
            if("url" in options.autocompleteModule) {
                const autocompleteModule = options.autocompleteModule as SiteNetworkAutocompleteModule;
                return new class extends Site {

                    public isPorn = options.isPorn;
                    public autocompleteEnabled = true;
                    public proxyHeaders = options.proxyHeaders || { };
                    public proxyEnvVariables = options.proxyEnvVariables || [ ];
        
                    private activeAutocompleteRequest: JQuery.jqXHR | null = null;
                    private activeSearchRequest: JQuery.jqXHR | null = null;
        
                    public constructor() {
                        super(options.name, options.id);
                    }

                    public parsePost = options.searchTransformer;

                    public abortAutocomplete(): void {
                        if(this.activeAutocompleteRequest) {
                            this.activeAutocompleteRequest.abort();
                            this.activeAutocompleteRequest = null;
                        }
                    }
        
                    private autocompleter = SiteBuilder.buildNetworkAutocomplete(
                        autocompleteModule.url,
                        autocompleteModule.transformer,
                        { 
                            minLength: autocompleteModule.minLength, 
                            delay: autocompleteModule.delay,
                            preprocessor: autocompleteModule.preprocessor
                        }
                    );
        
                    public autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {
                        this.abortAutocomplete();
                        this.activeAutocompleteRequest = this.autocompleter(tag, send, complete, error) as JQuery.jqXHR || this.activeAutocompleteRequest;
                    }
                    
                    public abortSearch(): void {
                        if(this.activeSearchRequest) {
                            this.activeSearchRequest.abort();
                            this.activeSearchRequest = null;
                        }
                    }
        
                    public search(tags: string[], page: number, safeSearch: boolean, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) {
                        this.abortSearch();
                        this.activeSearchRequest = this.searcher(tags, page, safeSearch, send, complete, error);
                    }
        
                    private searcher = SiteBuilder.buildSearcher(
                        options.searchUrl,
                        options.searchTransformer,
                        {
                            safeSearchTag: options.safeSearchTag,
                            preprocessor: options.searchPreprocessor || dummyPreprocessor,
                            pageOffset: options.searchPageOffset || 0,
                            delimiter: options.searchTagDelimiter || " "
                        }
                    );
                }
            }
            else if("summaryUrl" in options.autocompleteModule) {
                const autocompleteModule = options.autocompleteModule as SiteCachedAutocompleteModule;
                return new class extends Site {

                    public isPorn = options.isPorn;
                    public autocompleteEnabled = false;
                    public proxyHeaders = options.proxyHeaders || { };
                    public proxyEnvVariables = options.proxyEnvVariables || [ ];
        
                    private tagCache: string = "";

                    private activeAutocompleteRequest: NodeJS.Timeout | null = null;
                    private activeSearchRequest: JQuery.jqXHR | null = null;
        
                    public constructor() {
                        super(options.name, options.id);
                    }

                    public async onSelected() {
                        this.tagCache = await CachedAutocomplete.verifyCache(this, autocompleteModule.summaryUrl, autocompleteModule.version) || "";
                        this.autocompleteEnabled = true;
                    }

                    public abortAutocomplete(): void {
                        if(this.activeAutocompleteRequest) {
                            clearTimeout(this.activeAutocompleteRequest);
                            this.activeAutocompleteRequest = null;
                        }
                    }

                    public autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {
                        this.abortAutocomplete();
                        this.activeAutocompleteRequest = setTimeout(() => {
                            send(CachedAutocomplete.complete(tag, this.tagCache, autocompleteModule.typeToEnum));
                            complete();
                        }, options.autocompleteModule?.delay || 0);
                    }
                    
                    public abortSearch(): void {
                        if(this.activeSearchRequest) {
                            this.activeSearchRequest.abort();
                            this.activeSearchRequest = null;
                        }
                    }
        
                    public search(tags: string[], page: number, safeSearch: boolean, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) {
                        this.abortSearch();
                        this.activeSearchRequest = this.searcher(tags, page, safeSearch, send, complete, error);
                    }
        
                    private searcher = SiteBuilder.buildSearcher(
                        options.searchUrl,
                        options.searchTransformer,
                        {
                            safeSearchTag: options.safeSearchTag,
                            preprocessor: options.searchPreprocessor || dummyPreprocessor,
                            pageOffset: options.searchPageOffset || 0,
                            delimiter: options.searchTagDelimiter || " "
                        }
                    );
                }
            }
        }

        return new class extends Site {

            public isPorn = options.isPorn;
            public autocompleteEnabled = false;
            public proxyHeaders = options.proxyHeaders || { };
            public proxyEnvVariables = options.proxyEnvVariables || [ ];

            private activeSearchRequest: JQuery.jqXHR | null = null;

            public constructor() {
                super(options.name, options.id);
            }

            public abortSearch(): void {
                if(this.activeSearchRequest) {
                    this.activeSearchRequest.abort();
                    this.activeSearchRequest = null;
                }
            }

            public search(tags: string[], page: number, safeSearch: boolean, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) {
                this.abortSearch();
                this.activeSearchRequest = this.searcher(tags, page, safeSearch, send, complete, error);
            }

            private searcher = SiteBuilder.buildSearcher(
                options.searchUrl,
                options.searchTransformer,
                {
                    safeSearchTag: options.safeSearchTag,
                    preprocessor: options.searchPreprocessor || dummyPreprocessor,
                    pageOffset: options.searchPageOffset || 0,
                    delimiter: options.searchTagDelimiter || " "
                }
            );
        }
        
    }

    public static ExtractImagesGelboorulike(json: any): string[] {
        const images = [ json.preview_url, json.file_url ];
        if(json.sample && json.sample_url) images.push(json.sample_url);
        return images;
    }
}
