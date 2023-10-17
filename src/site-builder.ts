
import AutocompleteTag from "./autocomplete-tag";
import CachedAutocomplete from "./cached-autocomplete";
import Post from "./post";
import Site from "./site";
import TagType from "./tag-type";
import { asyncGetJSON } from "./util";

export interface SiteNetworkAutocompleteModule {
    url: string;
    preprocessor?: (json: any) => any[];
    transformer: (jsonResult: any) => AutocompleteTag;
    minLength?: number;
    delay?: number;
}

export interface SiteCachedAutocompleteModule {
    summaryUrl: string;
    typeToEnum: { [key: string | number]: TagType };
    version: string;
    minLength?: number;
    delay?: number;
}

export interface SiteTemplateOptions {
    name: string;
    id: string;
    isPorn: boolean;
    autocompleteModule?: SiteNetworkAutocompleteModule | SiteCachedAutocompleteModule;
    searchUrl: string;
    safeSearchTag?: string;
    searchPreprocessor?: (json: any) => any[];
    searchTransformer: (jsonResult: any) => Post;
    searchPageOffset?: number;
    searchTagDelimiter?: string;
}

function dummyAutocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void): NodeJS.Timeout { 
    return setTimeout(() => {}, 0); 
}

function dummyPreprocessor(json: any): any[] {
    return json;
}

export class SiteBuilder {

    public static generateNetworkAutocompleter(url: string, transformer: (jsonResult: any) => AutocompleteTag, options: { minLength?: number, delay?: number, preprocessor?: (json: any) => any[] } = {}) {
        options.delay = options.delay || 0;
        options.minLength = options.minLength || 1;
        options.preprocessor = options.preprocessor || dummyPreprocessor;

        if(options.delay > 0) {
            return (tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void): NodeJS.Timeout => {
                const f = this.generateNetworkAutocompleter(url, transformer, { ...options, delay: 0 });
                return setTimeout(f.bind(tag, send, complete, error), options.delay);
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
                    const processed = options.preprocessor(json);
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

    public static generateSearcher(
        url: string, 
        transformer: (json: any) => Post, 
        options: { 
            safeSearchTag?: string,
            preprocessor?: (json: any) => any[], 
            pageOffset?: number,
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
                const processed = options.preprocessor(json);

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

    public static Generate(options: SiteTemplateOptions): Site {
        if(!options.autocompleteModule) {
            return new class extends Site {

                public name = options.name;
                public id = options.id;
                public isPorn = options.isPorn;
                public autocompleteEnabled = false;
    
                private activeSearchRequest: JQuery.jqXHR | null = null;
    
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
    
                private searcher = SiteBuilder.generateSearcher(
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
        else if("url" in options.autocompleteModule) {
            const autocompleteModule = options.autocompleteModule as SiteNetworkAutocompleteModule;
            return new class extends Site {

                public name = options.name;
                public id = options.id;
                public isPorn = options.isPorn;
                public autocompleteEnabled = true;
    
                private activeAutocompleteRequest: JQuery.jqXHR | null = null;
                private activeSearchRequest: JQuery.jqXHR | null = null;
    
                public abortAutocomplete(): void {
                    if(this.activeAutocompleteRequest) {
                        this.activeAutocompleteRequest.abort();
                        this.activeAutocompleteRequest = null;
                    }
                }
    
                private autocompleter = SiteBuilder.generateNetworkAutocompleter(
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
    
                private searcher = SiteBuilder.generateSearcher(
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

                public name = options.name;
                public id = options.id;
                public isPorn = options.isPorn;
                public autocompleteEnabled = false;
    
                private tagCache: string;

                private activeAutocompleteRequest: NodeJS.Timeout | null = null;
                private activeSearchRequest: JQuery.jqXHR | null = null;
    
                public async onSelected() {
                    this.tagCache = await CachedAutocomplete.verifyCache(this, autocompleteModule.summaryUrl, autocompleteModule.version);
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
                    }, options.autocompleteModule.delay || 0);
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
    
                private searcher = SiteBuilder.generateSearcher(
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

    public static ExtractImagesGelboorulike(json: any): string[] {
        const images = [ json.preview_url, json.file_url ];
        if(json.sample && json.sample_url) images.push(json.sample_url);
        return images;
    }
}
