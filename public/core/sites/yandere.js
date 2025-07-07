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
var YANDERE_VERSION = "1";
function postTransformFunction(json) {
    var post = new post_1.default(Yandere);
    post.id = json.id.toString();
    post.imageResolutions = [
        json.preview_url,
        (0, util_1.proxify)("yandere", json.sample_url),
        (0, util_1.proxify)("yandere", json.jpeg_url),
        (0, util_1.proxify)("yandere", json.file_url)
    ];
    post.fullWidth = json.width;
    post.fullHeight = json.height;
    post.originalPost = "https://yande.re/post/show/".concat(json.id);
    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": "".concat(Math.round(json.file_size / 1000), " KB (").concat(json.width, "x").concat(json.height, ")"),
        "Source": json.source == "" ? "Unknown" : json.source,
        "Uploader": json.author,
        "Date": new Date(json.created_at).toISOString().split('T')[0],
        "Last Updated": new Date(json.updated_at).toISOString().split("T")[0],
        "Score": json.score.toString()
    };
    post.tagTypes = {
        "Tags": json.tags.split(" ")
    };
    return post;
}
var Yandere = site_builder_1.SiteBuilder.buildSite({
    name: "Yande.re",
    id: "yandere",
    isPorn: false,
    autocompleteModule: {
        summaryUrl: "https://yande.re/tag/summary.json",
        version: YANDERE_VERSION,
        typeToEnum: {
            "0": tag_type_1.default.General,
            "1": tag_type_1.default.Artist,
            "3": tag_type_1.default.Copyright,
            "4": tag_type_1.default.Character,
            "5": tag_type_1.default.Circle
        },
        delay: 333
    },
    searchUrl: "https://yande.re/post.json?limit=20&page={page}&tags={tags}",
    safeSearchTag: "rating:s",
    searchPageOffset: 1,
    searchTransformer: postTransformFunction
});
exports.default = Yandere;
//# sourceMappingURL=yandere.js.map