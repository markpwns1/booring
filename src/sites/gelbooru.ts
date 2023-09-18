import Post from "../post";
import Site from "../site";
import AutocompleteTag from "../autocomplete-tag";
import TagType from "../tag-type";

const RATINGS_TO_STRING: { [key: string]: string } = {
    "general": "General",
    "questionable": "Questionable",
    "explicit": "Explicit"
};

const TYPE_TO_ENUM: { [key: string]: TagType } = {
    "tag": TagType.General,
    "artist": TagType.Artist,
    "copyright": TagType.Copyright,
    "character": TagType.Character,
    "metadata": TagType.Meta
}

const MONTHS = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

export default class Gelbooru extends Site {

    public override name = "Gelbooru";
    public override id = "gelbooru";

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

        const url = encodeURI(`/proxy/json/https://gelbooru.com/index.php?page=autocomplete2&type=tag_query&limit=10&term=${tag}`);
        this.activeAutocompleteRequest = $.getJSON(url, json => {
            const tags: AutocompleteTag[] = [];

            for(const result of json) {
                const tag = new AutocompleteTag();
                tag.value = negation + result.value;
                tag.count = parseInt(result.post_count as string);
                tag.type = TYPE_TO_ENUM[result.category as string];
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

        const url = encodeURI(`/proxy/json/https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=20&pid=${page}&tags=${tags.join(" ")}`);
        console.log("Searching Gelbooru... " + url);

        this.activeSearchRequest = $.getJSON(url, json => {
            const posts: Post[] = [];

            for(const result of json.post) {

                const post = new Post();

                post.site = this;
                post.id = result.id.toString();

                post.imageResolutions = [ 
                    result.preview_url, 
                    `${window.location.origin}/gelbooru-img/${result.sample_url}`, 
                    `${window.location.origin}/gelbooru-img/${result.file_url}`
                ];

                post.fullWidth = result.width;
                post.fullHeight = result.height;

                post.originalPost = `https://gelbooru.com/index.php?page=post&s=view&id=${result.id}`;

                const parts = result.created_at.split(" ");
                const month = MONTHS.indexOf(parts[1]) + 1;
                const day = parts[2];
                const year = parts[5];
                const date = year.padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + day.padStart(2, "0");

                post.properties = {
                    "Date": date,
                    "Size": `${result.width}x${result.height}`,
                    "Source": result.source,
                    "Rating": RATINGS_TO_STRING[result.rating],
                    "Score": result.score.toString()
                }

                post.tagTypes = {
                    "Tags": result.tags.split(" ")
                }

                posts.push(post);
            }

            console.log("Search successful");

            send(posts);
            complete(page, posts.length < 20);
        })
        .fail(error);
    }
}