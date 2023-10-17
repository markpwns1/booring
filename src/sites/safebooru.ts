import Post from "../post";
import TagType from "../tag-type";
import { SiteBuilder } from "../site-builder";
import AutocompleteTag from "../autocomplete-tag";
import { proxify } from "../util";

function autocompleteTransformFunction(json: any): AutocompleteTag {
    return {
        label: json.label,
        value: json.value,
        type: TagType.General
    } as AutocompleteTag;
}

function postTransformFunction(json: any): Post {
    const post = new Post();

    post.site = Safebooru;
    post.id = json.id.toString();

    post.imageResolutions = [
        `https://safebooru.org/thumbnails/${json.directory}/thumbnail_${json.image}`,
        `https://safebooru.org/images/${json.directory}/${json.image}`
    ];

    if(json.sample) {
        post.imageResolutions.splice(1, 0, `https://safebooru.org/samples/${json.directory}/sample_${json.image}`);
    }

    post.fullWidth = json.width;
    post.fullHeight = json.height;

    post.originalPost = `https://safebooru.org/index.php?page=post&s=view&id=${json.id}`;

    post.properties = {
        "Last Updated": new Date(json.change * 1000).toISOString().split("T")[0],
        "Size": `${json.width}x${json.height}`,
        "Owner": json.owner || "Unknown",
        "Rating": "General",
        "Score": json.score?.toString() ?? "0"
    }

    post.tagTypes = {
        "Tags": json.tags.split(" ")
    }

    post.requiresVideoPlayer = json.image.endsWith(".mp4") 
        || json.image.endsWith(".webm");

    return post;
}

const Safebooru = SiteBuilder.Generate({
    name: "Safebooru",
    id: "safebooru",
    isPorn: false,
    autocompleteModule: {
        url: proxify("json", "https://safebooru.org/autocomplete.php?q={tag}"),
        transformer: autocompleteTransformFunction
    },
    searchUrl: proxify("json", "https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=20&&pid={page}&tags={tags}"),
    safeSearchTag: "rating:general",
    searchTransformer: postTransformFunction
});

export default Safebooru;
