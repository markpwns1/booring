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
function autocompleteTransformFunction(json) {
    return {
        label: json.label,
        value: json.value,
        type: tag_type_1.default.General
    };
}
function postTransformFunction(json) {
    var post = new post_1.default(Rule34);
    post.id = json.id.toString();
    post.imageResolutions = [json.preview_url, json.file_url];
    if (json.sample && json.sample_url) {
        post.imageResolutions.splice(1, 0, json.sample_url);
    }
    for (var i = 0; i < post.imageResolutions.length; i++) {
        var image = post.imageResolutions[i];
        if (image.includes("mp4") || image.includes("webm")) {
            var uri = new URL(image);
            post.imageResolutions[i] = (0, util_1.proxify)("rule34", "https://ahri2mp4.rule34.xxx/" + uri.pathname + "?" + post.id + "=");
        }
    }
    post.fullWidth = json.width;
    post.fullHeight = json.height;
    post.originalPost = "https://rule34.xxx/index.php?page=post&s=view&id=".concat(json.id);
    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": "".concat(json.width, "x").concat(json.height),
        "Source": json.source,
        "Uploader": json.owner || "Unknown",
        "Score": json.score.toString(),
        "Last Updated": new Date(json.change * 1000).toISOString().split("T")[0]
    };
    post.tagTypes = {
        "Tags": json.tags.split(" ")
    };
    post.requiresVideoPlayer = json.image.endsWith(".mp4")
        || json.image.endsWith(".webm");
    return post;
}
var Rule34 = site_builder_1.SiteBuilder.buildSite({
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
        url: (0, util_1.proxify)("rule34", "https://rule34.xxx/public/autocomplete.php?q={tag}"),
        transformer: autocompleteTransformFunction
    },
    searchUrl: "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=20&&pid={page}&tags={tags}",
    searchTransformer: postTransformFunction
});
exports.default = Rule34;
//# sourceMappingURL=rule34.js.map