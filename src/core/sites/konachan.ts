
import Post from "../post";
import { SiteBuilder } from "../site-builder";
import TagType from "../tag-type";
import { proxify } from "../util";

const RATINGS_TO_STRING: { [key: string]: string } = {
    "s": "Safe",
    "q": "Questionable",
    "e": "Explicit"
};

const KONACHAN_VERSION = "1";

function postTransformFunction(json: any): Post {
    const post = new Post(Konachan);

    post.id = json.id.toString();

    post.imageResolutions = [ 
        json.preview_url, 
        proxify("konachan", json.sample_url), 
        proxify("konachan", json.jpeg_url),
        proxify("konachan", json.file_url)
    ];

    post.fullWidth = json.width;
    post.fullHeight = json.height;

    post.originalPost = `https://konachan.com/post/show/${json.id}`;

    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": `${Math.round(json.file_size / 1000)} KB (${json.width}x${json.height})`,
        "Source": json.source == "" ? "Unknown" : json.source,
        "Uploader": json.author,
        "Date": new Date(json.created_at * 1000).toISOString().split('T')[0],
        "Score": json.score.toString()
    }

    post.tagTypes = {
        "Tags": json.tags.split(" ")
    }

    return post;
}

const Konachan = SiteBuilder.buildSite({
    name: "Konachan",
    id: "konachan",
    isPorn: false,
    proxyHeaders: {
        "Referrer": "https://konachan.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0"
    },
    autocompleteModule: {
        summaryUrl: proxify("json", "https://konachan.com/tag/summary.json"),
        version: KONACHAN_VERSION,
        typeToEnum: {
            "0": TagType.General,
            "1": TagType.Artist,
        
            "3": TagType.Copyright,
            "4": TagType.Character,
            "5": TagType.Meta
        },
        delay: 333
    },
    searchUrl: proxify("json", "https://konachan.com/post.json?limit=20&page={page}&tags={tags}"),
    safeSearchTag: "rating:s",
    searchPageOffset: 1,
    searchTransformer: postTransformFunction
});

export default Konachan;