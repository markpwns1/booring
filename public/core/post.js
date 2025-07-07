"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The main class representing a Post
 */
var Post = /** @class */ (function () {
    function Post(site) {
        /** This post's ID from its origin site */
        this.id = "";
        /** True if this post requires a video player */
        this.requiresVideoPlayer = false;
        /** A list of image URLs, in order of smallest to largest, to display in the frontent */
        this.imageResolutions = [];
        /** The width of the post's full size image (or largest image) */
        this.fullWidth = -1;
        /** The height of the post's full size image (or largest image) */
        this.fullHeight = -1;
        /** The URL leading to the original post on the origin site */
        this.originalPost = "";
        /** A set of information to display in the frontend about the post, like author, creation date, etc. */
        this.properties = {};
        /**
         * A set of headers and tags to display in the frontend about the post. For example,
         * ```"Copyright": [ "genshin_impact" ],
         * "Artist": [ "da_vinci", "michaelangelo" ],```
         * etc.
         */
        this.tagTypes = {};
        this.site = site;
    }
    /**
     * Returns the post's height divided by its width
     */
    Post.prototype.normalisedHeight = function () {
        return this.fullHeight / this.fullWidth;
    };
    /**
     * Returns the post's smallest size image
     */
    Post.prototype.getThumbnail = function () {
        return this.imageResolutions[0];
    };
    /**
     * Returns the post's second smallest image
     */
    Post.prototype.getLargeImage = function () {
        return this.imageResolutions[1] || this.imageResolutions[0];
    };
    /**
     * Returns the post's largest image
     */
    Post.prototype.getFullSizeImage = function () {
        return this.imageResolutions[this.imageResolutions.length - 1];
    };
    return Post;
}());
exports.default = Post;
//# sourceMappingURL=post.js.map