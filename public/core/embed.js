"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main class representing an embed, as seen in Discord or Twitter
 */
var Embed = /** @class */ (function () {
    function Embed(title, description) {
        /**
         * A set of key-value pairs to include in the embed. For each entry, the following will
         * be appended: `<meta property="[key]" contents="[value]" />`
         */
        this.properties = {};
        /** Extra HTML code for the embed, usually containing more meta properties. Use responsibly */
        this.extra = "";
        this.title = title;
        this.description = description;
    }
    /**
     * Constructs a set of meta tags to include in a site's `<head>` to enable embeds on sites
     * like Twitter or Discord.
     * @returns The HTML code to include
     */
    Embed.prototype.build = function () {
        return "\n            <!-- Primary Meta Tags -->\n            <title>".concat(this.title, "</title>\n            <meta name=\"title\" content=\"").concat(this.title, "\" />\n            <meta name=\"description\" content=\"").concat(this.description, "\" />\n\n            <!-- Open Graph / Facebook -->\n            <meta property=\"og:type\" content=\"website\" />\n            ").concat(this.url ? "<meta property=\"og:url\" content=\"".concat(this.url, " />") : "", "\n            <meta property=\"og:title\" content=\"").concat(this.title, "\" />\n            <meta property=\"og:description\" content=\"").concat(this.description, "\" />\n            ").concat(this.imageUrl ? "<meta property=\"og:image\" content=\"".concat(this.imageUrl, "\" />") : "", "\n\n            <!-- Twitter -->\n            <meta property=\"twitter:card\" content=\"summary_large_image\" />\n            ").concat(this.url ? "<meta property=\"twitter:url\" content=\"".concat(this.url, " />") : "", "\n            <meta property=\"twitter:title\" content=\"").concat(this.title, "\" />\n            <meta property=\"twitter:description\" content=\"").concat(this.description, "\" />\n            ").concat(this.imageUrl ? "<meta property=\"twitter:image\" content=\"".concat(this.imageUrl, "\" />") : "", "\n\n            <!-- Extra -->\n            <meta name=\"twitter:card\" content=\"summary_large_image\" />\n            ").concat(this.extra, "\n        ");
    };
    return Embed;
}());
exports.default = Embed;
//# sourceMappingURL=embed.js.map