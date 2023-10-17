import AutocompleteTag from "./autocomplete-tag";
import Post from "./post";
import Site from "./site";

export interface SiteAutocompleteModule {
    url: string;
    transformer: (jsonResult: any) => AutocompleteTag;
    minLength?: number;
    delay?: number;
}

export interface SiteTemplateOptions {
    name: string;
    id: string;
    isPorn: boolean;
    autocompleteModule?: SiteAutocompleteModule;
    searchUrl: string;
    searchTransformer: (jsonResult: any) => Post;
}

function dummyAutocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void): NodeJS.Timeout { 
    return setTimeout(() => {}, 0); 
}

export class SiteTemplate {

    public static generateAutocompleterFromURL(url: string, transformer: (jsonResult: any) => AutocompleteTag, options: { minLength?: number, delay?: number } = {}) {
        options.delay = options.delay || 0;
        options.minLength = options.minLength || 1;

        if(options.delay > 0) {
            return (tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void): NodeJS.Timeout => {
                const f = this.generateAutocompleterFromURL(url, transformer, { ...options, delay: 0 });
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

                    for(const result of json) {
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

    public static generateSearcherFromURL(url: string, transformer: (json: any) => Post) {
        return (
            tags: string[], 
            page: number, 
            send: (posts: Post[]) => void, 
            complete: (newPage: number, endOfResults: boolean) => void, 
            error: (error: any) => void
        ): JQuery.jqXHR<any> => {

            const endpoint = encodeURI(url.replace("{tags}", tags.join(" ")).replace("{page}", page.toString()));
            console.log("Searching... " + endpoint);

            return $.getJSON(endpoint, json => {
                const posts: Post[] = [];

                for(const result of json.post) {
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

    public static GenerateSimpleBooru(options: SiteTemplateOptions): Site {
        return new class {

            public name = options.name;
            public id = options.id;
            public isPorn = options.isPorn;
            public autocompleteEnabled = options.autocompleteModule !== undefined;

            public constructor() { }

            public onRegistered() { }
            public onSelected() { }

            private activeAutocompleteRequest: JQuery.jqXHR | null = null;
            private activeSearchRequest: JQuery.jqXHR | null = null;

            public abortAutocomplete(): void {
                if(this.activeAutocompleteRequest) {
                    this.activeAutocompleteRequest.abort();
                    this.activeAutocompleteRequest = null;
                }
            }

            private autocompleter = options.autocompleteModule? SiteTemplate.generateAutocompleterFromURL(
                options.autocompleteModule.url,
                options.autocompleteModule.transformer,
                { 
                    minLength: options.autocompleteModule.minLength, 
                    delay: options.autocompleteModule.delay 
                }
            ) : dummyAutocomplete;

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

            public search(tags: string[], page: number, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) {
                this.abortSearch();
                this.activeSearchRequest = this.searcher(tags, page, send, complete, error);
            }

            private searcher = SiteTemplate.generateSearcherFromURL(
                options.searchUrl,
                options.searchTransformer
            );
        }
    }
}
