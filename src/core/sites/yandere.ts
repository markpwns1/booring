
import Post from "../post";
import { SiteBuilder } from "../site-builder";
import TagType from "../tag-type";
import { proxify } from "../util";

const RATINGS_TO_STRING: { [key: string]: string } = {
    "s": "Safe",
    "q": "Questionable",
    "e": "Explicit"
};

const YANDERE_VERSION = "1";

function postTransformFunction(json: any): Post {
    const post = new Post(Yandere);

    post.id = json.id.toString();

    post.imageResolutions = [ 
        json.preview_url, 
        proxify("yandere", json.sample_url),
        proxify("yandere", json.jpeg_url),
        proxify("yandere", json.file_url)
    ];

    post.fullWidth = json.width;
    post.fullHeight = json.height;

    post.originalPost = `https://yande.re/post/show/${json.id}`;

    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": `${Math.round(json.file_size / 1000)} KB (${json.width}x${json.height})`,
        "Source": json.source == "" ? "Unknown" : json.source,
        "Uploader": json.author,
        "Date": new Date(json.created_at).toISOString().split('T')[0],
        "Last Updated": new Date(json.updated_at).toISOString().split("T")[0],
        "Score": json.score.toString()
    }

    post.tagTypes = {
        "Tags": json.tags.split(" ")
    }

    return post;
}

const Yandere = SiteBuilder.Generate({
    name: "Yande.re",
    id: "yandere",
    isPorn: false,
    autocompleteModule: {
        summaryUrl: "https://yande.re/tag/summary.json",
        version: YANDERE_VERSION,
        typeToEnum: {
            "0": TagType.General,
            "1": TagType.Artist,
        
            "3": TagType.Copyright,
            "4": TagType.Character,
            "5": TagType.Circle
        },
        delay: 333
    },
    searchUrl: "https://yande.re/post.json?limit=20&page={page}&tags={tags}",
    safeSearchTag: "rating:s",
    searchPageOffset: 1,
    searchTransformer: postTransformFunction
});

export default Yandere;