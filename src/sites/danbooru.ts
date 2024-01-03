import Post from "../post";
import Site from "../site";
import AutocompleteTag from "../autocomplete-tag";
import TagType from "../tag-type";
import { asyncGetJSON } from "../util";
import { SiteBuilder } from "../site-builder";

const RATINGS_TO_STRING: { [key: string]: string } = {
    "g": "General",
    "s": "Sensitive",
    "q": "Questionable",
    "e": "Explicit"
};

const TYPE_TO_ENUM: { [key: number]: TagType } = {
    0: TagType.General,
    1: TagType.Artist,
    3: TagType.Copyright,
    4: TagType.Character,
    5: TagType.Meta
}

interface SearchResult {
    posts: Post[];
    endOfResults: boolean;
}

export default class Danbooru extends Site {

    public override name = "Danbooru";
    public override id = "danbooru";

    public override autocompleteEnabled = true;
    public override isPorn = false;

    private activeAutocompleteRequest: JQuery.jqXHR | null = null;
    private activeSearchRequest: JQuery.jqXHR | null = null;

    private wait(ms): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public override abortAutocomplete(): void {
        if(this.activeAutocompleteRequest) {
            this.activeAutocompleteRequest.abort();
            this.activeAutocompleteRequest = null;
        }
    }

    private static autocompleteTransformFunction(json: any): AutocompleteTag {
        const tag = new AutocompleteTag();
        if(json.post_count) {
            tag.label = `${json.label} (${json.post_count})`;
        }
        else {
            tag.label = json.label;
        }
        tag.value = json.value;
        tag.type = TYPE_TO_ENUM[json.category] || TagType.Other;
        return tag;
    }

    private autocompleter = SiteBuilder.generateNetworkAutocompleter(
        "https://danbooru.donmai.us/autocomplete.json?only=name,post_count,category&limit=10&search[type]=tag_query&search[query]={tag}",
        Danbooru.autocompleteTransformFunction,
        { minLength: 3 }
    );

    public override autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {
        this.abortAutocomplete();
        this.activeSearchRequest = this.autocompleter(tag, send, complete, error) as JQuery.jqXHR || this.activeSearchRequest;
    }

    public override abortSearch(): void {
        if(this.activeSearchRequest) {
            this.activeSearchRequest.abort();
        }
    }

    private danbooruPostToBooringPost(result: any): Post {
        if(!result.preview_file_url && !result.large_file_url && !result.file_url) {
            return null;
        }

        const post = new Post();

        post.site = this;
        post.id = result.id.toString();

        post.imageResolutions = [ result.preview_file_url, result.large_file_url, result.file_url ];

        post.fullWidth = result.image_width;
        post.fullHeight = result.image_height;

        post.originalPost = `https://danbooru.donmai.us/posts/${result.id}`;

        post.properties = {
            "Rating": RATINGS_TO_STRING[result.rating],
            "Size": `${Math.round(result.file_size / 1000)} KB (${result.image_width}x${result.image_height})`,
            "Source": result.source,
            "Date": result.created_at.split("T")[0],
            "Score": result.score.toString(),
            "Favourites": result.fav_count.toString()
        };

        post.tagTypes = {
            "Artist": result.tag_string_artist.split(" "),
            "Copyright": result.tag_string_copyright.split(" "),
            "Character": result.tag_string_character.split(" "),
            "General": result.tag_string_general.split(" "),
            "Meta": result.tag_string_meta.split(" ")
        }

        post.requiresVideoPlayer = result.large_file_url.endsWith(".webm") 
            || result.large_file_url.endsWith(".mp4") 
            || result.file_url.endsWith(".webm") 
            || result.file_url.endsWith(".mp4");

        return post;
    }

    private rawSearch(tags: string[], page: number, limit: number): Promise<{ results: any[], endOfResults: boolean}> {
        return new Promise((resolve, reject) => {
            this.abortSearch();

            const url = encodeURI(`https://danbooru.donmai.us/posts.json?page=${page+1}&limit=${limit}&tags=${tags.join(" ")}`);
            this.activeSearchRequest = $.getJSON(url, json => {
                resolve({
                    results: json,
                    endOfResults: json.length < limit
                });
            })
            .fail(reject);
        });
    }

    private simpleSearch(tags: string[], page: number): Promise<SearchResult> {
        return new Promise((resolve, reject) => {
            this.abortSearch();

            const url = encodeURI(`https://danbooru.donmai.us/posts.json?page=${page+1}&limit=20&tags=${tags.join(" ")}`);
            this.activeSearchRequest = $.getJSON(url, json => {
                const posts: Post[] = [];

                for(const result of json) {
                    const post = this.danbooruPostToBooringPost(result);
                    if(post) posts.push(post);
                }

                resolve({
                    posts: posts,
                    endOfResults: json.length < 20
                });
            })
            .fail(reject);
        });
    }

    private analyseTags(tags: string[]): { untaxedTags: string[], taxedTags: string[], negatedTags: string[] } {
        const untaxedTags: string[] = [];
        const taxedTags: string[] = [];
        const negatedTags: string[] = [];

        for(const tag of tags) {
            if(tag.startsWith("-")) {
                negatedTags.push(tag.substring(1));
            } else if(tag.startsWith("rating:")) {
                untaxedTags.push(tag);
            } else {
                taxedTags.push(tag);
            }
        }

        return {
            untaxedTags: untaxedTags,
            taxedTags: taxedTags,
            negatedTags: negatedTags
        };
    }

    public override async search(tags: string[], page: number, safeSearch: boolean, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) {
        
        if(safeSearch && !tags.includes("rating:general")) {
            tags.push("rating:general");
        }
        
        const { untaxedTags, taxedTags, negatedTags } = this.analyseTags(tags);

        if(taxedTags.length + negatedTags.length < 3) {
            try {
                const result = await this.simpleSearch(tags, page);
                send(result.posts);
                complete(page, result.endOfResults);
            } catch(err) {
                error(err);
            }
            return;
        }

        const allTaxedTags = Array.from(new Set([ ...taxedTags, ...negatedTags ]));
        
        let tagsInfo: { name: string, post_count: number }[];
        try {
            tagsInfo = await asyncGetJSON(`https://danbooru.donmai.us/tags.json?search[name_comma]=${allTaxedTags.join(",")}`) as { name: string, post_count: number }[];
        }
        catch (err) {
            error(err);
            return;
        }

        const includeTagInfo = tagsInfo.filter(x => taxedTags.includes(x.name));
        const excludeTagInfo = tagsInfo.filter(x => negatedTags.includes(x.name));

        const includeSorted = Array.from(includeTagInfo).sort((a, b) => a.post_count - b.post_count).map(x => x.name);
        const excludeSorted = Array.from(excludeTagInfo).sort((a, b) => b.post_count - a.post_count).map(x => x.name);
        
        const twoLeastPopularIncludes = includeSorted.slice(0, 2);
        const twoMostPopularExcludes = excludeSorted.slice(0, Math.max(0, 2 - twoLeastPopularIncludes.length));
        
        const searchTags = [ ...twoLeastPopularIncludes, ...twoMostPopularExcludes.map(x => "-" + x), ...untaxedTags ];
        const manualIncludeTags = includeSorted.slice(twoLeastPopularIncludes.length);
        const manualExcludeTags = excludeSorted.slice(twoMostPopularExcludes.length);

        // console.log(tags, searchTags, manualIncludeTags, manualExcludeTags);

        let successfulPosts = 0;
        let pageIncrement = 0;
        let emptyPages = 0;

        while(true) {
            try {

                await this.wait(250);

                const result = await this.rawSearch(searchTags, page + pageIncrement, 30);

                const posts: Post[] = [];
                for(const post of result.results) {
                    const tags = post.tag_string.split(" ");

                    if(manualIncludeTags.some(x => !tags.includes(x))) continue;
                    if(manualExcludeTags.some(x => tags.includes(x))) continue;

                    const booringPost = this.danbooruPostToBooringPost(post);
                    if(booringPost) posts.push(booringPost);
                }

                if(posts.length === 0) emptyPages++;
                else emptyPages = 0;

                send(posts);
                successfulPosts += posts.length;

                if(emptyPages >= 5 || successfulPosts >= 20 || result.endOfResults) {
                    complete(page + pageIncrement, result.endOfResults);
                    return;
                }
            }
            catch(err) {
                error(err);
                return;
            }
            pageIncrement++;
        }
    }
}