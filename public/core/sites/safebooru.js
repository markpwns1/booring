"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var post_1 = require("../post");
var tag_type_1 = require("../tag-type");
var site_builder_1 = require("../site-builder");
var util_1 = require("../util");
function autocompleteTransformFunction(json) {
    return {
        label: json.label,
        value: json.value,
        type: tag_type_1.default.General
    };
}
function postTransformFunction(json) {
    var _a, _b;
    var post = new post_1.default(Safebooru);
    post.id = json.id.toString();
    post.imageResolutions = [
        "https://safebooru.org/thumbnails/".concat(json.directory, "/thumbnail_").concat(json.image),
        "https://safebooru.org/images/".concat(json.directory, "/").concat(json.image)
    ];
    if (json.sample) {
        post.imageResolutions.splice(1, 0, "https://safebooru.org/samples/".concat(json.directory, "/sample_").concat(json.image));
    }
    post.fullWidth = json.width;
    post.fullHeight = json.height;
    post.originalPost = "https://safebooru.org/index.php?page=post&s=view&id=".concat(json.id);
    post.properties = {
        "Last Updated": new Date(json.change * 1000).toISOString().split("T")[0],
        "Size": "".concat(json.width, "x").concat(json.height),
        "Owner": json.owner || "Unknown",
        "Rating": "General",
        "Score": (_b = (_a = json.score) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "0"
    };
    post.tagTypes = {
        "Tags": json.tags.split(" ")
    };
    post.requiresVideoPlayer = json.image.endsWith(".mp4")
        || json.image.endsWith(".webm");
    return post;
}
var Safebooru = site_builder_1.SiteBuilder.buildSite({
    name: "Safebooru",
    id: "safebooru",
    isPorn: false,
    autocompleteModule: {
        url: (0, util_1.proxify)("json", "https://safebooru.org/autocomplete.php?q={tag}"),
        transformer: autocompleteTransformFunction
    },
    searchUrl: (0, util_1.proxify)("json", "https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=20&&pid={page}&tags={tags}"),
    safeSearchTag: "rating:general",
    searchTransformer: postTransformFunction
});
exports.default = Safebooru;
//# sourceMappingURL=safebooru.js.map