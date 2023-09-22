import Post from "../post";
import Site from "../site";
import AutocompleteTag from "../autocomplete-tag";
import TagType from "../tag-type";
import { SiteTemplate } from "../site-template";

export default class Safebooru extends Site {

    public override name = "Safebooru";
    public override id = "safebooru";

    public override autocompleteEnabled = true;
    public override isPorn = false;

    private activeAutocompleteRequest: JQuery.jqXHR | null = null;
    private activeSearchRequest: JQuery.jqXHR | null = null;

    public override abortAutocomplete(): void {
        if(this.activeAutocompleteRequest) {
            this.activeAutocompleteRequest.abort();
            this.activeAutocompleteRequest = null;
        }
    }

    private static autocompleteTransformFunction(json: any): AutocompleteTag {
        const tag = new AutocompleteTag();
        tag.label = json.label;
        tag.value = json.value;
        tag.type = TagType.General;
        return tag;
    }

    private autocompleter = SiteTemplate.generateAutocompleterFromURL(
        window.location.origin + "/proxy/json/https://safebooru.org/autocomplete.php?q={tag}",
        Safebooru.autocompleteTransformFunction,
        { minLength: 1 }
    );

    public override autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {
        this.abortAutocomplete();
        this.activeAutocompleteRequest = this.autocompleter(tag, send, complete, error) as JQuery.jqXHR || this.activeAutocompleteRequest;
    }

    public override abortSearch(): void {
        if(this.activeSearchRequest) {
            this.activeSearchRequest.abort();
            this.activeSearchRequest = null;
        }
    }

    public override search(tags: string[], page: number, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) {
        this.abortSearch();

        const url = encodeURI(`${window.location.origin}/proxy/json/https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=20&pid=${page}&tags=${tags.join(" ")}`);
        console.log("Searching Safebooru... " + url);

        this.activeSearchRequest = $.getJSON(url, json => {
            const posts: Post[] = [];

            for(const result of json) {

                const post = new Post();

                post.site = this;
                post.id = result.id.toString();

                post.imageResolutions = [
                    `https://safebooru.org/thumbnails/${result.directory}/thumbnail_${result.image}`
                ];

                if(result.sample)
                    post.imageResolutions.push(`https://safebooru.org/samples/${result.directory}/sample_${result.image}`);

                post.imageResolutions.push(`https://safebooru.org/images/${result.directory}/${result.image}`);

                post.fullWidth = result.width;
                post.fullHeight = result.height;

                post.originalPost = `https://safebooru.org/index.php?page=post&s=view&id=${result.id}`;

                post.properties = {
                    "Last Updated": new Date(result.change * 1000).toISOString().split("T")[0],
                    "Size": `${result.width}x${result.height}`,
                    "Owner": result.owner || "Unknown",
                    "Rating": "General",
                    "Score": result.score?.toString() ?? "0"
                }

                post.tagTypes = {
                    "Tags": result.tags.split(" ")
                }

                post.requiresVideoPlayer = result.image.endsWith(".mp4") 
                    || result.image.endsWith(".webm");

                posts.push(post);
            }

            console.log("Search successful");

            send(posts);
            complete(page, posts.length < 20);
        })
        .fail(error);
    }
}