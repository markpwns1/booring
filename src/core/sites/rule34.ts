import Post from "../post";
import TagType from "../tag-type";
import { SiteBuilder } from "../site-builder";
import AutocompleteTag from "../autocomplete-tag";
import { proxify } from "../util";

const RATINGS_TO_STRING: { [key: string]: string } = {
    "general": "General",
    "sensitive": "Sensitive",
    "questionable": "Questionable",
    "explicit": "Explicit"
};

function autocompleteTransformFunction(json: any): AutocompleteTag {
    return {
        label: json.label,
        value: json.value,
        type: TagType.General
    } as AutocompleteTag;
}

function postTransformFunction(json: any): Post {
    const post = new Post(Rule34);

    post.id = json.id.toString();

    post.imageResolutions = [ json.preview_url, json.file_url ];

    if(json.sample && json.sample_url) {
        post.imageResolutions.splice(1, 0, json.sample_url);
    }

    for(let i = 0; i < post.imageResolutions.length; i++) {
        const image = post.imageResolutions[i];
        if(image.includes("mp4") || image.includes("webm")) {
            var uri = new URL(image);
            post.imageResolutions[i] = proxify("rule34", "https://ahri2mp4.rule34.xxx/" + uri.pathname + "?" + post.id + "=");
        }
    }

    post.fullWidth = json.width;
    post.fullHeight = json.height;

    post.originalPost = `https://rule34.xxx/index.php?page=post&s=view&id=${json.id}`;

    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": `${json.width}x${json.height}`,
        "Source": json.source,
        "Uploader": json.owner || "Unknown",
        "Score": json.score.toString(),
        "Last Updated": new Date(json.change * 1000).toISOString().split("T")[0]
    }

    post.tagTypes = {
        "Tags": json.tags.split(" ")
    }

    post.requiresVideoPlayer = json.image.endsWith(".mp4") 
        || json.image.endsWith(".webm");

    return post;
}

const Rule34 = SiteBuilder.Generate({
    name: "Rule 34",
    id: "rule34",
    isPorn: true,
    proxyHeaders: {
        "Referrer": "https://rule34.xxx/",
        "Referer": "https://rule34.xxx/",
        "Host": "rule34.xxx",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
    },
    autocompleteModule: {
        url: proxify("rule34", "https://rule34.xxx/public/autocomplete.php?q={tag}"),
        transformer: autocompleteTransformFunction
    },
    searchUrl: "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=20&&pid={page}&tags={tags}",
    searchTransformer: postTransformFunction
});

export default Rule34;
