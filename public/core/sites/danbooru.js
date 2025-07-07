"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var post_1 = require("../post");
var site_1 = require("../site");
var autocomplete_tag_1 = require("../autocomplete-tag");
var tag_type_1 = require("../tag-type");
var util_1 = require("../util");
var site_builder_1 = require("../site-builder");
var embed_1 = require("@booring/embed");
var RATINGS_TO_STRING = {
    "g": "General",
    "s": "Sensitive",
    "q": "Questionable",
    "e": "Explicit"
};
var TYPE_TO_ENUM = {
    0: tag_type_1.default.General,
    1: tag_type_1.default.Artist,
    3: tag_type_1.default.Copyright,
    4: tag_type_1.default.Character,
    5: tag_type_1.default.Meta
};
var Danbooru = /** @class */ (function (_super) {
    __extends(Danbooru, _super);
    function Danbooru() {
        var _this = _super.call(this, "Danbooru", "danbooru") || this;
        _this.autocompleteEnabled = true;
        _this.isPorn = false;
        _this.activeAutocompleteRequest = null;
        _this.activeSearchRequest = null;
        _this.autocompleter = site_builder_1.SiteBuilder.buildNetworkAutocomplete("https://danbooru.donmai.us/autocomplete.json?only=name,post_count,category&limit=10&search[type]=tag_query&search[query]={tag}", Danbooru.autocompleteTransformFunction, { minLength: 3 });
        return _this;
    }
    Danbooru.prototype.wait = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    Danbooru.prototype.abortAutocomplete = function () {
        if (this.activeAutocompleteRequest) {
            this.activeAutocompleteRequest.abort();
            this.activeAutocompleteRequest = null;
        }
    };
    Danbooru.autocompleteTransformFunction = function (json) {
        return new autocomplete_tag_1.default(json.post_count ? "".concat(json.label, " (").concat(json.post_count, ")") : json.label, json.value, TYPE_TO_ENUM[json.category] || tag_type_1.default.Other);
    };
    Danbooru.prototype.autocomplete = function (tag, send, complete, error) {
        this.abortAutocomplete();
        this.activeSearchRequest = this.autocompleter(tag, send, complete, error) || this.activeSearchRequest;
    };
    Danbooru.prototype.abortSearch = function () {
        if (this.activeSearchRequest) {
            this.activeSearchRequest.abort();
        }
    };
    Danbooru.prototype.parsePost = function (json) {
        if (!json.preview_file_url && !json.large_file_url && !json.file_url) {
            throw new Error("Post does not contain any image");
        }
        var post = new post_1.default(this);
        post.id = json.id.toString();
        post.imageResolutions = [json.preview_file_url, json.large_file_url, json.file_url];
        post.fullWidth = json.image_width;
        post.fullHeight = json.image_height;
        post.originalPost = "https://danbooru.donmai.us/posts/".concat(json.id);
        post.properties = {
            "Rating": RATINGS_TO_STRING[json.rating],
            "Size": "".concat(Math.round(json.file_size / 1000), " KB (").concat(json.image_width, "x").concat(json.image_height, ")"),
            "Source": json.source,
            "Date": json.created_at.split("T")[0],
            "Score": json.score.toString(),
            "Favourites": json.fav_count.toString()
        };
        post.tagTypes = {
            "Artist": json.tag_string_artist.split(" "),
            "Copyright": json.tag_string_copyright.split(" "),
            "Character": json.tag_string_character.split(" "),
            "General": json.tag_string_general.split(" "),
            "Meta": json.tag_string_meta.split(" ")
        };
        post.requiresVideoPlayer = json.large_file_url.endsWith(".webm")
            || json.large_file_url.endsWith(".mp4")
            || json.file_url.endsWith(".webm")
            || json.file_url.endsWith(".mp4");
        return post;
    };
    Danbooru.prototype.rawSearch = function (tags, page, limit) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.abortSearch();
            var url = encodeURI("https://danbooru.donmai.us/posts.json?page=".concat(page + 1, "&limit=").concat(limit, "&tags=").concat(tags.join(" ")));
            _this.activeSearchRequest = $.getJSON(url, function (json) {
                resolve({
                    results: json,
                    endOfResults: json.length < limit
                });
            })
                .fail(reject);
        });
    };
    Danbooru.prototype.simpleSearch = function (tags, page) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.abortSearch();
            var url = encodeURI("https://danbooru.donmai.us/posts.json?page=".concat(page + 1, "&limit=20&tags=").concat(tags.join(" ")));
            _this.activeSearchRequest = $.getJSON(url, function (json) {
                var posts = [];
                for (var _i = 0, json_1 = json; _i < json_1.length; _i++) {
                    var result = json_1[_i];
                    try {
                        var post = _this.parsePost(result);
                        if (post)
                            posts.push(post);
                    }
                    catch (e) { }
                }
                resolve({
                    posts: posts,
                    endOfResults: json.length < 20
                });
            })
                .fail(reject);
        });
    };
    Danbooru.prototype.analyseTags = function (tags) {
        var untaxedTags = [];
        var taxedTags = [];
        var negatedTags = [];
        for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
            var tag = tags_1[_i];
            if (tag.startsWith("-")) {
                negatedTags.push(tag.substring(1));
            }
            else if (tag.startsWith("rating:")) {
                untaxedTags.push(tag);
            }
            else {
                taxedTags.push(tag);
            }
        }
        return {
            untaxedTags: untaxedTags,
            taxedTags: taxedTags,
            negatedTags: negatedTags
        };
    };
    Danbooru.prototype.search = function (tags, page, safeSearch, send, complete, error) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, untaxedTags, taxedTags, negatedTags, result, err_1, allTaxedTags, tagsInfo, err_2, includeTagInfo, excludeTagInfo, includeSorted, excludeSorted, twoLeastPopularIncludes, twoMostPopularExcludes, searchTags, manualIncludeTags, manualExcludeTags, successfulPosts, pageIncrement, emptyPages, result, posts, _loop_1, this_1, _i, _b, post, err_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (safeSearch && !tags.includes("rating:general")) {
                            tags.push("rating:general");
                        }
                        _a = this.analyseTags(tags), untaxedTags = _a.untaxedTags, taxedTags = _a.taxedTags, negatedTags = _a.negatedTags;
                        if (!(taxedTags.length + negatedTags.length < 3)) return [3 /*break*/, 5];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.simpleSearch(tags, page)];
                    case 2:
                        result = _c.sent();
                        send(result.posts);
                        complete(page, result.endOfResults);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _c.sent();
                        error(err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                    case 5:
                        allTaxedTags = Array.from(new Set(__spreadArray(__spreadArray([], taxedTags, true), negatedTags, true)));
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, (0, util_1.getJsonPromise)("https://danbooru.donmai.us/tags.json?search[name_comma]=".concat(allTaxedTags.join(",")))];
                    case 7:
                        tagsInfo = (_c.sent());
                        return [3 /*break*/, 9];
                    case 8:
                        err_2 = _c.sent();
                        error(err_2);
                        return [2 /*return*/];
                    case 9:
                        includeTagInfo = tagsInfo.filter(function (x) { return taxedTags.includes(x.name); });
                        excludeTagInfo = tagsInfo.filter(function (x) { return negatedTags.includes(x.name); });
                        includeSorted = Array.from(includeTagInfo).sort(function (a, b) { return a.post_count - b.post_count; }).map(function (x) { return x.name; });
                        excludeSorted = Array.from(excludeTagInfo).sort(function (a, b) { return b.post_count - a.post_count; }).map(function (x) { return x.name; });
                        twoLeastPopularIncludes = includeSorted.slice(0, 2);
                        twoMostPopularExcludes = excludeSorted.slice(0, Math.max(0, 2 - twoLeastPopularIncludes.length));
                        searchTags = __spreadArray(__spreadArray(__spreadArray([], twoLeastPopularIncludes, true), twoMostPopularExcludes.map(function (x) { return "-" + x; }), true), untaxedTags, true);
                        manualIncludeTags = includeSorted.slice(twoLeastPopularIncludes.length);
                        manualExcludeTags = excludeSorted.slice(twoMostPopularExcludes.length);
                        successfulPosts = 0;
                        pageIncrement = 0;
                        emptyPages = 0;
                        _c.label = 10;
                    case 10:
                        if (!true) return [3 /*break*/, 16];
                        _c.label = 11;
                    case 11:
                        _c.trys.push([11, 14, , 15]);
                        return [4 /*yield*/, this.wait(250)];
                    case 12:
                        _c.sent();
                        return [4 /*yield*/, this.rawSearch(searchTags, page + pageIncrement, 30)];
                    case 13:
                        result = _c.sent();
                        posts = [];
                        _loop_1 = function (post) {
                            var tags_2 = post.tag_string.split(" ");
                            if (manualIncludeTags.some(function (x) { return !tags_2.includes(x); }))
                                return "continue";
                            if (manualExcludeTags.some(function (x) { return tags_2.includes(x); }))
                                return "continue";
                            try {
                                var booringPost = this_1.parsePost(post);
                                if (booringPost)
                                    posts.push(booringPost);
                            }
                            catch (e) { }
                        };
                        this_1 = this;
                        for (_i = 0, _b = result.results; _i < _b.length; _i++) {
                            post = _b[_i];
                            _loop_1(post);
                        }
                        if (posts.length === 0)
                            emptyPages++;
                        else
                            emptyPages = 0;
                        send(posts);
                        successfulPosts += posts.length;
                        if (emptyPages >= 5 || successfulPosts >= 20 || result.endOfResults) {
                            complete(page + pageIncrement, result.endOfResults);
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 15];
                    case 14:
                        err_3 = _c.sent();
                        error(err_3);
                        return [2 /*return*/];
                    case 15:
                        pageIncrement++;
                        return [3 /*break*/, 10];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    Danbooru.prototype.getPostByID = function (fetchJSON, id) {
        return __awaiter(this, void 0, void 0, function () {
            var json, first;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchJSON("https://danbooru.donmai.us/posts.json?tags=id:" + id)];
                    case 1:
                        json = _a.sent();
                        first = json[0];
                        if (first) {
                            try {
                                return [2 /*return*/, this.parsePost(first)];
                            }
                            catch (e) {
                                throw new Error("Could not parse returned JSON with error '" + e + "' and JSON: " + JSON.stringify(json, null, 2));
                            }
                        }
                        else
                            throw new Error("Post with ID '" + id + "' not found. Received: " + JSON.stringify(json, null, 2));
                        return [2 /*return*/];
                }
            });
        });
    };
    Danbooru.prototype.generateEmbed = function (post) {
        var embed = new embed_1.default("Danbooru #" + post.id, Object.values(post.tagTypes).join(" "));
        embed.url = "https://danbooru.donmai.us/posts/" + post.id;
        embed.imageUrl = post.getLargeImage();
        return embed;
    };
    return Danbooru;
}(site_1.default));
exports.default = Danbooru;
//# sourceMappingURL=danbooru.js.map