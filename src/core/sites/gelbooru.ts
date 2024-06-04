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

const TYPE_TO_ENUM: { [key: string]: TagType } = {
    "tag": TagType.General,
    "artist": TagType.Artist,
    "copyright": TagType.Copyright,
    "character": TagType.Character,
    "metadata": TagType.Meta
}

const MONTHS = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

function autocompleteTransformFunction(json: any): AutocompleteTag {
    return {
        label: `${json.label} (${json.post_count})`,
        value: json.value,
        type: TYPE_TO_ENUM[json.category as string]
    } as AutocompleteTag;
}

function postTransformFunction(json: any): Post {
    const post = new Post(Gelbooru);

    post.id = json.id.toString();

    post.imageResolutions = [ 
        json.preview_url, 
        proxify("gelbooru", json.file_url)
    ];

    if(json.sample == 1 && json.sample_url) {
        post.imageResolutions.splice(1, 0, proxify("gelbooru", json.sample_url));
    }

    post.fullWidth = json.width;
    post.fullHeight = json.height;

    post.originalPost = `https://gelbooru.com/index.php?page=post&s=view&id=${json.id}`;

    const parts = json.created_at.split(" ");
    const month = MONTHS.indexOf(parts[1]) + 1;
    const day = parts[2];
    const year = parts[5];
    const date = year.padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + day.padStart(2, "0");

    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": `${json.width}x${json.height}`,
        "Source": json.source,
        "Date": date,
        "Score": json.score.toString(),
        "Last Updated": new Date(json.change * 1000).toISOString().split("T")[0]
    }

    post.tagTypes = {
        "Tags": json.tags.split(" ")
    }

    post.requiresVideoPlayer = json.sample_url.endsWith(".mp4") 
        || json.sample_url.endsWith(".webm") 
        || json.file_url.endsWith(".mp4") 
        || json.file_url.endsWith(".webm");

    return post;
}

const Gelbooru = SiteBuilder.Generate({
    name: "Gelbooru",
    id: "gelbooru",
    isPorn: false,
    proxyHeaders: {
        "Referrer": "https://gelbooru.com/"
    },
    autocompleteModule: {
        url: proxify("json", "https://gelbooru.com/index.php?page=autocomplete2&type=tag_query&limit=10&term={tag}"),
        transformer: autocompleteTransformFunction
    },
    searchUrl: proxify("json", "https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=20&pid={page}&tags={tags}"),
    safeSearchTag: "rating:general",
    searchPreprocessor: (json: any) => json.post || [],
    searchTransformer: postTransformFunction
});

export default Gelbooru;
