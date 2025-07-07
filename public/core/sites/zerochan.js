"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var post_1 = require("../post");
var site_builder_1 = require("../site-builder");
var tag_type_1 = require("../tag-type");
var util_1 = require("../util");
var TYPE_TO_ENUM = {
    "theme": tag_type_1.default.General,
    "game": tag_type_1.default.Copyright,
    "character": tag_type_1.default.Character,
    "mangaka": tag_type_1.default.Artist,
    "source": tag_type_1.default.Meta,
    "Character Group": tag_type_1.default.Character,
};
function autocompleteTransformFunction(json) {
    return {
        label: json.value,
        value: json.value,
        type: TYPE_TO_ENUM[json.icon || json.type] || tag_type_1.default.General
    };
}
function postTransformFunction(json) {
    var post = new post_1.default(Zerochan);
    post.id = json.id.toString();
    post.imageResolutions = [
        json.thumbnail || json.small,
    ];
    post.fullWidth = json.width;
    post.fullHeight = json.height;
    post.originalPost = "https://www.zerochan.net/".concat(json.id);
    post.properties = {
        "Rating": "General",
        "Source": json.source == "" ? "Unknown" : json.source,
        "Size": "".concat(json.width, "x").concat(json.height),
    };
    post.tagTypes = {
        "Tags": json.tags
    };
    $.getJSON((0, util_1.proxify)("generic", "https://www.zerochan.net/".concat(json.id, "?json")), function (json) {
        post.imageResolutions.push(json.medium);
        post.imageResolutions.push(json.large);
        post.imageResolutions.push(json.full);
        post.properties["Size"] = "".concat(Math.round(json.size / 1000), " KB (").concat(json.width, "x").concat(json.height, ")");
    });
    return post;
}
var Zerochan = site_builder_1.SiteBuilder.buildSite({
    name: "Zerochan",
    id: "zerochan",
    isPorn: false,
    proxyHeaders: {
        "Referrer": "https://www.zerochan.net/"
    },
    autocompleteModule: {
        url: (0, util_1.proxify)("generic", "https://www.zerochan.net/suggest?q={tag}&json=1&limit=10"),
        preprocessor: function (json) { return json.suggestions; },
        transformer: autocompleteTransformFunction
    },
    searchUrl: (0, util_1.proxify)("generic", "https://www.zerochan.net/{tags}?l=20&p={page}&json"),
    searchPageOffset: 1,
    searchTagDelimiter: ",",
    searchPreprocessor: function (json) { return json.items; },
    searchTransformer: postTransformFunction
});
exports.default = Zerochan;
//# sourceMappingURL=zerochan.js.map