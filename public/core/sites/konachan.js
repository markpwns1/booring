"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var post_1 = require("../post");
var site_builder_1 = require("../site-builder");
var tag_type_1 = require("../tag-type");
var util_1 = require("../util");
var RATINGS_TO_STRING = {
    "s": "Safe",
    "q": "Questionable",
    "e": "Explicit"
};
var KONACHAN_VERSION = "1";
function postTransformFunction(json) {
    var post = new post_1.default(Konachan);
    post.id = json.id.toString();
    post.imageResolutions = [
        json.preview_url,
        (0, util_1.proxify)("konachan", json.sample_url),
        (0, util_1.proxify)("konachan", json.jpeg_url),
        (0, util_1.proxify)("konachan", json.file_url)
    ];
    post.fullWidth = json.width;
    post.fullHeight = json.height;
    post.originalPost = "https://konachan.com/post/show/".concat(json.id);
    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": "".concat(Math.round(json.file_size / 1000), " KB (").concat(json.width, "x").concat(json.height, ")"),
        "Source": json.source == "" ? "Unknown" : json.source,
        "Uploader": json.author,
        "Date": new Date(json.created_at * 1000).toISOString().split('T')[0],
        "Score": json.score.toString()
    };
    post.tagTypes = {
        "Tags": json.tags.split(" ")
    };
    return post;
}
var Konachan = site_builder_1.SiteBuilder.buildSite({
    name: "Konachan",
    id: "konachan",
    isPorn: false,
    proxyHeaders: {
        "Referrer": "https://konachan.com/"
    },
    autocompleteModule: {
        summaryUrl: (0, util_1.proxify)("json", "https://konachan.com/tag/summary.json"),
        version: KONACHAN_VERSION,
        typeToEnum: {
            "0": tag_type_1.default.General,
            "1": tag_type_1.default.Artist,
            "3": tag_type_1.default.Copyright,
            "4": tag_type_1.default.Character,
            "5": tag_type_1.default.Meta
        },
        delay: 333
    },
    searchUrl: (0, util_1.proxify)("json", "https://konachan.com/post.json?limit=20&page={page}&tags={tags}"),
    safeSearchTag: "rating:s",
    searchPageOffset: 1,
    searchTransformer: postTransformFunction
});
exports.default = Konachan;
//# sourceMappingURL=konachan.js.map