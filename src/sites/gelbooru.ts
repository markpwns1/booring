import Post from "../post";
// import Site from "../site";
// import AutocompleteTag from "../autocomplete-tag";
import TagType from "../tag-type";
// import AutocompleteHelper from "../autocomplete-helper";
// import SearchHelper from "../search-helper";

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

// export default class Gelbooru extends Site {

//     public override name = "Gelbooru";
//     public override id = "gelbooru";

//     public override autocompleteEnabled = true;
//     public override isPorn = false;

//     private activeAutocompleteRequest: JQuery.jqXHR | null = null;
//     private activeSearchRequest: JQuery.jqXHR | null = null;

//     public override abortAutocomplete(): void {
//         if(this.activeAutocompleteRequest) {
//             this.activeAutocompleteRequest.abort();
//             this.activeAutocompleteRequest = null;
//         }
//     }

//     private static autocompleteTransformFunction(json: any): AutocompleteTag {
//         const tag = new AutocompleteTag();
//         tag.label = `${json.label} (${json.post_count})`;
//         tag.value = json.value;
//         tag.type = TYPE_TO_ENUM[json.category as string];
//         return tag;
//     }

//     private autocompleter = AutocompleteHelper.generateAutocompleterFromURL(
//         window.location.origin + "/proxy/json/https://gelbooru.com/index.php?page=autocomplete2&type=tag_query&limit=10&term={tag}",
//         Gelbooru.autocompleteTransformFunction,
//         { minLength: 1 }
//     );

//     public override autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {
//         this.abortAutocomplete();
//         this.activeAutocompleteRequest = this.autocompleter(tag, send, complete, error) as JQuery.jqXHR || this.activeAutocompleteRequest;
//     }

//     public override abortSearch(): void {
//         if(this.activeSearchRequest) {
//             this.activeSearchRequest.abort();
//             this.activeSearchRequest = null;
//         }
//     }

//     public postTransformFunction(json: any): Post {
//         const post = new Post();

//         post.site = this;
//         post.id = json.id.toString();

//         post.imageResolutions = [ 
//             json.preview_url, 
//             `${window.location.origin}/gelbooru-img/${json.sample_url}`, 
//             `${window.location.origin}/gelbooru-img/${json.file_url}`
//         ];

//         post.fullWidth = json.width;
//         post.fullHeight = json.height;

//         post.originalPost = `https://gelbooru.com/index.php?page=post&s=view&id=${json.id}`;

//         const parts = json.created_at.split(" ");
//         const month = MONTHS.indexOf(parts[1]) + 1;
//         const day = parts[2];
//         const year = parts[5];
//         const date = year.padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + day.padStart(2, "0");

//         post.properties = {
//             "Date": date,
//             "Size": `${json.width}x${json.height}`,
//             "Source": json.source,
//             "Rating": RATINGS_TO_STRING[json.rating],
//             "Score": json.score.toString()
//         }

//         post.tagTypes = {
//             "Tags": json.tags.split(" ")
//         }

//         post.requiresVideoPlayer = json.sample_url.endsWith(".mp4") 
//             || json.sample_url.endsWith(".webm") 
//             || json.file_url.endsWith(".mp4") 
//             || json.file_url.endsWith(".webm");

//         return post;
//     }

//     private searcher = SearchHelper.generateSearcherFromURL(
//         window.location.origin + "/proxy/json/https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=20&pid={page}&tags={tags}",
//         this.postTransformFunction.bind(this)
//     );

//     public override search(tags: string[], page: number, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) {
//         this.abortSearch();

//         this.activeSearchRequest = this.searcher(tags, page, send, complete, error);

//         // const url = encodeURI(`/proxy/json/https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=20&pid=${page}&tags=${tags.join(" ")}`);
//         // console.log("Searching Gelbooru... " + url);

//         // this.activeSearchRequest = $.getJSON(url, json => {
//         //     const posts: Post[] = [];

//         //     for(const result of json.post) {

//         //         const post = new Post();

//         //         post.site = this;
//         //         post.id = result.id.toString();

//         //         post.imageResolutions = [ 
//         //             result.preview_url, 
//         //             `${window.location.origin}/gelbooru-img/${result.sample_url}`, 
//         //             `${window.location.origin}/gelbooru-img/${result.file_url}`
//         //         ];

//         //         post.fullWidth = result.width;
//         //         post.fullHeight = result.height;

//         //         post.originalPost = `https://gelbooru.com/index.php?page=post&s=view&id=${result.id}`;

//         //         const parts = result.created_at.split(" ");
//         //         const month = MONTHS.indexOf(parts[1]) + 1;
//         //         const day = parts[2];
//         //         const year = parts[5];
//         //         const date = year.padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + day.padStart(2, "0");

//         //         post.properties = {
//         //             "Date": date,
//         //             "Size": `${result.width}x${result.height}`,
//         //             "Source": result.source,
//         //             "Rating": RATINGS_TO_STRING[result.rating],
//         //             "Score": result.score.toString()
//         //         }

//         //         post.tagTypes = {
//         //             "Tags": result.tags.split(" ")
//         //         }

//         //         post.requiresVideoPlayer = result.sample_url.endsWith(".mp4") 
//         //             || result.sample_url.endsWith(".webm") 
//         //             || result.file_url.endsWith(".mp4") 
//         //             || result.file_url.endsWith(".webm");

//         //         posts.push(post);
//         //     }

//         //     console.log("Search successful");

//         //     send(posts);
//         //     complete(page, posts.length < 20);
//         // })
//         // .fail(error);
//     }
// }

import { SiteTemplate, SiteTemplateOptions, SiteAutocompleteModule } from "../site-template";
import AutocompleteTag from "../autocomplete-tag";

function autocompleteTransformFunction(json: any): AutocompleteTag {
    return {
        label: `${json.label} (${json.post_count})`,
        value: json.value,
        type: TYPE_TO_ENUM[json.category as string]
    } as AutocompleteTag;
}

function postTransformFunction(json: any): Post {
    const post = new Post();

    post.site = Gelbooru;
    post.id = json.id.toString();

    post.imageResolutions = [ 
        json.preview_url, 
        `${window.location.origin}/gelbooru-img/${json.sample_url}`, 
        `${window.location.origin}/gelbooru-img/${json.file_url}`
    ];

    post.fullWidth = json.width;
    post.fullHeight = json.height;

    post.originalPost = `https://gelbooru.com/index.php?page=post&s=view&id=${json.id}`;

    const parts = json.created_at.split(" ");
    const month = MONTHS.indexOf(parts[1]) + 1;
    const day = parts[2];
    const year = parts[5];
    const date = year.padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + day.padStart(2, "0");

    post.properties = {
        "Date": date,
        "Size": `${json.width}x${json.height}`,
        "Source": json.source,
        "Rating": RATINGS_TO_STRING[json.rating],
        "Score": json.score.toString()
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

const Gelbooru = SiteTemplate.GenerateSimpleBooru({
    name: "Gelbooru",
    id: "gelbooru",
    isPorn: false,
    autocompleteModule: {
        url: window.location.origin + "/proxy/json/https://gelbooru.com/index.php?page=autocomplete2&type=tag_query&limit=10&term={tag}",
        transformer: autocompleteTransformFunction
    },
    searchUrl: window.location.origin + "/proxy/json/https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=20&pid={page}&tags={tags}",
    searchTransformer: postTransformFunction
});

export default Gelbooru;
