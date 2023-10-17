
import AutocompleteTag from "../autocomplete-tag";
import Post from "../post";
import { SiteBuilder } from "../site-builder";
import TagType from "../tag-type";
import { asyncGetJSON, proxify } from "../util";

const TYPE_TO_ENUM: { [key: string]: TagType } = {
    "theme": TagType.General,
    "game": TagType.Copyright,
    "character": TagType.Character,
    "mangaka": TagType.Artist,
    "source": TagType.Meta,
    "Character Group": TagType.Character,
};

function autocompleteTransformFunction(json: any): AutocompleteTag {
    return {
        label: json.value,
        value: json.value,
        type: TYPE_TO_ENUM[json.icon || json.type] || TagType.General
    } as AutocompleteTag;
}

function postTransformFunction(json: any): Post {
    const post = new Post();

    post.site = Zerochan;
    post.id = json.id.toString();

    post.imageResolutions = [ 
        json.thumbnail || json.small,
    ];

    post.fullWidth = json.width;
    post.fullHeight = json.height;

    post.originalPost = `https://www.zerochan.net/${json.id}`;

    post.properties = {
        "Rating": "General",
        "Source": json.source == "" ? "Unknown" : json.source,
        "Size": `${json.width}x${json.height}`,
    }

    post.tagTypes = {
        "Tags": json.tags
    }

    $.getJSON(proxify("generic", `https://www.zerochan.net/${json.id}?json`), json => {
        post.imageResolutions.push(json.medium);
        post.imageResolutions.push(json.large);
        post.imageResolutions.push(json.full);
        post.properties["Size"] = `${Math.round(json.size / 1000)} KB (${json.width}x${json.height})`;
    });

    return post;
}

const Zerochan = SiteBuilder.Generate({
    name: "Zerochan",
    id: "zerochan",
    isPorn: false,
    autocompleteModule: {
        url: proxify("generic", "https://www.zerochan.net/suggest?q={tag}&json=1&limit=10"),
        preprocessor: json => json.suggestions,
        transformer: autocompleteTransformFunction
    },
    searchUrl: proxify("generic", "https://www.zerochan.net/{tags}?l=20&p={page}&json"),
    searchPageOffset: 1,
    searchTagDelimiter: ",",
    searchPreprocessor: json => json.items,
    searchTransformer: postTransformFunction
});

export default Zerochan;