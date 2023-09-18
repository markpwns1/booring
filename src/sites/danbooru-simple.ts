import Post from "../post";
import Site from "../site";
import AutocompleteTag from "../autocomplete-tag";
import TagType from "../tag-type";

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

export default class Danbooru extends Site {

    public override name = "Danbooru";
    public override id = "danbooru";

    public override autocompleteEnabled = true;
    public override isPorn = false;

    private activeAutocompleteRequest: JQuery.jqXHR | null = null;
    private activeSearchRequest: JQuery.jqXHR | null = null;

    public override abortAutocomplete(): void {
        if(this.activeAutocompleteRequest) {
            this.activeAutocompleteRequest.abort();
        }
    }

    public override autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {

        this.abortAutocomplete();

        tag = tag.trim();
        let negation = "";
        if(tag.startsWith("-")) {
            negation = "-";
            tag = tag.substring(1);
        }

        if(tag.length < 3) {
            complete();
            return;
        }

        const url = encodeURI(`https://danbooru.donmai.us/autocomplete.json?only=name,post_count,category&limit=10&search[type]=tag_query&search[query]=${tag}`);
        this.activeAutocompleteRequest = $.getJSON(url, json => {
            const tags: AutocompleteTag[] = [];

            for(const result of json) {
                const tag = new AutocompleteTag();
                tag.value = negation + result.value;
                tag.type = TYPE_TO_ENUM[result.category] || TagType.Other;
                tag.count = result.post_count;
                tags.push(tag);
            }

            send(tags);
            complete();
        })
        .fail(err => {
            if(err.statusText === "abort") return;
            error(err);
        });
    }

    public override abortSearch(): void {
        if(this.activeSearchRequest) {
            this.activeSearchRequest.abort();
        }
    }

    public override search(tags: string[], page: number, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) {
        this.abortSearch();

        const url = encodeURI(`https://danbooru.donmai.us/posts.json?page=${page+1}&limit=20&tags=${tags.join(" ")}`);
        console.log("Searching Danbooru... " + url);

        this.activeSearchRequest = $.getJSON(url, json => {
            const posts: Post[] = [];

            for(const result of json) {

                if(!result.preview_file_url && !result.large_file_url && !result.file_url) continue;

                const post = new Post();

                post.site = this;
                post.id = result.id.toString();

                post.imageResolutions = [ result.preview_file_url, result.large_file_url, result.file_url ];

                post.fullWidth = result.image_width;
                post.fullHeight = result.image_height;

                post.originalPost = `https://danbooru.donmai.us/posts/${result.id}`;

                post.properties = {
                    "Date": result.created_at.split("T")[0],
                    "Size": `${Math.round(result.file_size / 1000)} KB (${result.image_width}x${result.image_height})`,
                    "Source": result.source,
                    "Rating": RATINGS_TO_STRING[result.rating],
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

                posts.push(post);
            }

            console.log("Search successful");
            send(posts);
            complete(page, posts.length < 20);
        })
        .fail(error);
    }
}