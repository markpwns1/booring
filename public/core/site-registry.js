"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var danbooru_1 = require("./sites/danbooru");
var gelbooru_1 = require("./sites/gelbooru");
var yandere_1 = require("./sites/yandere");
var safebooru_1 = require("./sites/safebooru");
var rule34_1 = require("./sites/rule34");
var konachan_1 = require("./sites/konachan");
var zerochan_1 = require("./sites/zerochan");
var site_1 = require("./site");
/**
 * Registers all the supported sites
 */
function registerAll() {
    site_1.default.register(new danbooru_1.default());
    site_1.default.register(gelbooru_1.default);
    site_1.default.register(yandere_1.default);
    site_1.default.register(safebooru_1.default);
    site_1.default.register(konachan_1.default);
    site_1.default.register(zerochan_1.default);
    site_1.default.register(rule34_1.default);
}
exports.default = registerAll;
//# sourceMappingURL=site-registry.js.map