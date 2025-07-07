"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var post_1 = require("../post");
var tag_type_1 = require("../tag-type");
var site_builder_1 = require("../site-builder");
var util_1 = require("../util");
var RATINGS_TO_STRING = {
    "general": "General",
    "sensitive": "Sensitive",
    "questionable": "Questionable",
    "explicit": "Explicit"
};
var TYPE_TO_ENUM = {
    "tag": tag_type_1.default.General,
    "artist": tag_type_1.default.Artist,
    "copyright": tag_type_1.default.Copyright,
    "character": tag_type_1.default.Character,
    "metadata": tag_type_1.default.Meta
};
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function autocompleteTransformFunction(json) {
    return {
        label: "".concat(json.label, " (").concat(json.post_count, ")"),
        value: json.value,
        type: TYPE_TO_ENUM[json.category]
    };
}
function postTransformFunction(json) {
    var post = new post_1.default(Gelbooru);
    post.id = json.id.toString();
    post.imageResolutions = [
        json.preview_url,
        (0, util_1.proxify)("gelbooru", json.file_url)
    ];
    if (json.sample == 1 && json.sample_url) {
        post.imageResolutions.splice(1, 0, (0, util_1.proxify)("gelbooru", json.sample_url));
    }
    post.fullWidth = json.width;
    post.fullHeight = json.height;
    post.originalPost = "https://gelbooru.com/index.php?page=post&s=view&id=".concat(json.id);
    var parts = json.created_at.split(" ");
    var month = MONTHS.indexOf(parts[1]) + 1;
    var day = parts[2];
    var year = parts[5];
    var date = year.padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + day.padStart(2, "0");
    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": "".concat(json.width, "x").concat(json.height),
        "Source": json.source,
        "Date": date,
        "Score": json.score.toString(),
        "Last Updated": new Date(json.change * 1000).toISOString().split("T")[0]
    };
    post.tagTypes = {
        "Tags": json.tags.split(" ")
    };
    post.requiresVideoPlayer = json.sample_url.endsWith(".mp4")
        || json.sample_url.endsWith(".webm")
        || json.file_url.endsWith(".mp4")
        || json.file_url.endsWith(".webm");
    return post;
}
var Gelbooru = site_builder_1.SiteBuilder.buildSite({
    name: "Gelbooru",
    id: "gelbooru",
    isPorn: false,
    proxyHeaders: {
        "Referrer": "https://gelbooru.com/"
    },
    proxyEnvVariables: ["GELBOORU_API_KEY", "GELBOORU_USER_ID"],
    autocompleteModule: {
        url: (0, util_1.proxify)("json", "https://gelbooru.com/index.php?page=autocomplete2&type=tag_query&limit=10&term={tag}"),
        transformer: autocompleteTransformFunction
    },
    searchUrl: (0, util_1.proxify)("json-for/gelbooru", "https://gelbooru.com/index.php?&api_key={GELBOORU_API_KEY}&user_id={GELBOORU_USER_ID}&page=dapi&s=post&q=index&json=1&limit=20&pid={page}&tags={tags}"),
    safeSearchTag: "rating:general",
    searchPreprocessor: function (json) { return json.post || []; },
    searchTransformer: postTransformFunction
});
exports.default = Gelbooru;
//# sourceMappingURL=gelbooru.js.map