import Post from "../post";
import Site from "../site";
import AutocompleteTag from "../autocomplete-tag";
import TagType from "../tag-type";
import { getJsonPromise } from "../util";
import { SiteBuilder } from "../site-builder";
import Embed from "@booring/embed";

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

    public override autocompleteEnabled = true;
    public override isPorn = false;

    private activeAutocompleteRequest: JQuery.jqXHR | null = null;
    private activeSearchRequest: JQuery.jqXHR | null = null;

    public constructor() {
        super("Danbooru", "danbooru");
    }

    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public override abortAutocomplete(): void {
        if(this.activeAutocompleteRequest) {
            this.activeAutocompleteRequest.abort();
            this.activeAutocompleteRequest = null;
        }
    }

    private static autocompleteTransformFunction(json: any): AutocompleteTag {
        return new AutocompleteTag(
            json.post_count? `${json.label} (${json.post_count})` : json.label,
            json.value,
            TYPE_TO_ENUM[json.category] || TagType.Other
        );
    }

    private autocompleter = SiteBuilder.buildNetworkAutocomplete(
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

    public override parsePost(json: any): Post {
        if(!json.preview_file_url && !json.large_file_url && !json.file_url) {
            throw new Error("Post does not contain any image");
        }

        const post = new Post(this);

        post.id = json.id.toString();

        post.imageResolutions = [ json.preview_file_url, json.large_file_url, json.file_url ];

        post.fullWidth = json.image_width;
        post.fullHeight = json.image_height;

        post.originalPost = `https://danbooru.donmai.us/posts/${json.id}`;

        post.properties = {
            "Rating": RATINGS_TO_STRING[json.rating],
            "Size": `${Math.round(json.file_size / 1000)} KB (${json.image_width}x${json.image_height})`,
            "Source": json.source,
            "Date": json.created_at.split("T")[0],
            "Score": json.score.toString(),
            "Favourites": json.fav_count.toString()
        };

        post.tagTypes = {
            "Artist": json.tag_string_artist.split(" "),
            "Copyright": json.tag_string_copyright.split(" "),
            "Character": json.tag_string_character.split(" "),
            "General": json.tag_string_general.split(" "),
            "Meta": json.tag_string_meta.split(" ")
        }

        post.requiresVideoPlayer = json.large_file_url.endsWith(".webm") 
            || json.large_file_url.endsWith(".mp4") 
            || json.file_url.endsWith(".webm") 
            || json.file_url.endsWith(".mp4");

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
                    try { 
                        const post = this.parsePost(result);
                        if(post) posts.push(post);
                    } catch (e: any) { }
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
            tagsInfo = await getJsonPromise(`https://danbooru.donmai.us/tags.json?search[name_comma]=${allTaxedTags.join(",")}`) as { name: string, post_count: number }[];
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

                    try {
                        const booringPost = this.parsePost(post);
                        if(booringPost) posts.push(booringPost);
                    } catch (e: any) { }
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

    public override async getPostByID(fetchJSON: (url: string) => Promise<any>, id: string): Promise<Post> {
        const json = await fetchJSON("https://danbooru.donmai.us/posts.json?tags=id:" + id);
        const first = json[0];
        if(first) {
            try {
                return this.parsePost(first);
            } catch (e: any) {
                throw new Error("Could not parse returned JSON with error '" + e + "' and JSON: " + JSON.stringify(json, null, 2));
            }
        }
        else throw new Error("Post with ID '" + id + "' not found. Received: " + JSON.stringify(json, null, 2));
    }

    public override generateEmbed(post: Post): Embed {
        const embed = new Embed("Danbooru #" + post.id, Object.values(post.tagTypes).join(" "));
        embed.url = "https://danbooru.donmai.us/posts/" + post.id;
        embed.imageUrl = post.getLargeImage();
        return embed;
    }
}