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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteBuilder = void 0;
var autocomplete_tag_1 = require("./autocomplete-tag");
var cached_autocomplete_1 = require("./cached-autocomplete");
var site_1 = require("./site");
function dummyAutocomplete(tag, send, complete, error) {
    return setTimeout(function () { }, 0);
}
function dummyPreprocessor(json) {
    return json;
}
var SiteBuilder = /** @class */ (function () {
    function SiteBuilder() {
    }
    /**
     * Given a set of parameters, generates a function that autocompletes a search term via network query to the specified URL
     * @param url The URL to query for the autocomplete operation
     * @param transformer A function that transforms a JSON object representing an autocomplete tag into a proper `AutocompleteTag`
     * @param options Miscellaneous options for the generator
     * @returns A function that performs a search asynchronously at the specified query and returns a `NodeJS.Timeout` or a `JQueryjqXHR?` which can be used to cancel the operation
     */
    SiteBuilder.buildNetworkAutocomplete = function (url, transformer, options) {
        if (options === void 0) { options = {}; }
        options.delay = options.delay || 0;
        options.minLength = options.minLength || 1;
        var preprocessor = options.preprocessor || dummyPreprocessor;
        if (options.delay > 0) {
            return function (tag, send, complete, error) {
                var f = SiteBuilder.buildNetworkAutocomplete(url, transformer, __assign(__assign({}, options), { delay: 0 }));
                return setTimeout(function () { return f(tag, send, complete, error); }, options.delay);
            };
        }
        else {
            return function (tag, send, complete, error) {
                var _a = autocomplete_tag_1.default.decompose(tag), negation = _a.negation, baseTag = _a.baseTag;
                if (baseTag.length < (options.minLength || 1)) {
                    send([]);
                    complete();
                    return null;
                }
                var getURL = encodeURI(url.replace("{tag}", baseTag));
                return $.getJSON(getURL, function (json) {
                    var tags = [];
                    var processed = preprocessor(json);
                    for (var _i = 0, processed_1 = processed; _i < processed_1.length; _i++) {
                        var result = processed_1[_i];
                        var tag_1 = transformer(result);
                        tag_1.label = negation + tag_1.label;
                        tag_1.value = negation + tag_1.value;
                        tags.push(tag_1);
                    }
                    send(tags);
                    complete();
                });
            };
        }
    };
    /**
     * Generates a function that performs a search at a specified URL.
     * @param url The URL to query for a search
     * @param transformer A function that turns a JSON object representing a post, into a proper `Post`
     * @param options Miscellaneous options for the generator
     * @returns A function that asynchronously performs a search at the specified URL and returns a `jQuery.jqXHR<any>` to cancel the operation
     */
    SiteBuilder.buildSearcher = function (url, transformer, options) {
        if (options === void 0) { options = {
            preprocessor: dummyPreprocessor,
            pageOffset: 0,
            delimiter: " "
        }; }
        return function (tags, page, safeSearch, send, complete, error) {
            if (options.safeSearchTag && safeSearch) {
                tags = tags.concat(options.safeSearchTag);
            }
            var endpoint = encodeURI(url.replace("{tags}", tags.join(options.delimiter || " ")).replace("{page}", (page + (options.pageOffset || 0)).toString()));
            console.log("Searching... " + endpoint);
            return $.getJSON(endpoint, function (json) {
                var posts = [];
                var processed = options.preprocessor(json);
                for (var _i = 0, processed_2 = processed; _i < processed_2.length; _i++) {
                    var result = processed_2[_i];
                    var post = transformer(result);
                    if (post)
                        posts.push(post);
                }
                console.log("Search successful");
                send(posts);
                complete(page, posts.length < 20);
            })
                .fail(error);
        };
    };
    /**
     * Generates a site given a set of Site template options
     * @param options The template options
     * @returns The generated site
     */
    SiteBuilder.buildSite = function (options) {
        if (options.autocompleteModule) {
            if ("url" in options.autocompleteModule) {
                var autocompleteModule_1 = options.autocompleteModule;
                return new /** @class */ (function (_super) {
                    __extends(class_1, _super);
                    function class_1() {
                        var _this = _super.call(this, options.name, options.id) || this;
                        _this.isPorn = options.isPorn;
                        _this.autocompleteEnabled = true;
                        _this.proxyHeaders = options.proxyHeaders || {};
                        _this.proxyEnvVariables = options.proxyEnvVariables || [];
                        _this.activeAutocompleteRequest = null;
                        _this.activeSearchRequest = null;
                        _this.parsePost = options.searchTransformer;
                        _this.autocompleter = SiteBuilder.buildNetworkAutocomplete(autocompleteModule_1.url, autocompleteModule_1.transformer, {
                            minLength: autocompleteModule_1.minLength,
                            delay: autocompleteModule_1.delay,
                            preprocessor: autocompleteModule_1.preprocessor
                        });
                        _this.searcher = SiteBuilder.buildSearcher(options.searchUrl, options.searchTransformer, {
                            safeSearchTag: options.safeSearchTag,
                            preprocessor: options.searchPreprocessor || dummyPreprocessor,
                            pageOffset: options.searchPageOffset || 0,
                            delimiter: options.searchTagDelimiter || " "
                        });
                        return _this;
                    }
                    class_1.prototype.abortAutocomplete = function () {
                        if (this.activeAutocompleteRequest) {
                            this.activeAutocompleteRequest.abort();
                            this.activeAutocompleteRequest = null;
                        }
                    };
                    class_1.prototype.autocomplete = function (tag, send, complete, error) {
                        this.abortAutocomplete();
                        this.activeAutocompleteRequest = this.autocompleter(tag, send, complete, error) || this.activeAutocompleteRequest;
                    };
                    class_1.prototype.abortSearch = function () {
                        if (this.activeSearchRequest) {
                            this.activeSearchRequest.abort();
                            this.activeSearchRequest = null;
                        }
                    };
                    class_1.prototype.search = function (tags, page, safeSearch, send, complete, error) {
                        this.abortSearch();
                        this.activeSearchRequest = this.searcher(tags, page, safeSearch, send, complete, error);
                    };
                    return class_1;
                }(site_1.default));
            }
            else if ("summaryUrl" in options.autocompleteModule) {
                var autocompleteModule_2 = options.autocompleteModule;
                return new /** @class */ (function (_super) {
                    __extends(class_2, _super);
                    function class_2() {
                        var _this = _super.call(this, options.name, options.id) || this;
                        _this.isPorn = options.isPorn;
                        _this.autocompleteEnabled = false;
                        _this.proxyHeaders = options.proxyHeaders || {};
                        _this.proxyEnvVariables = options.proxyEnvVariables || [];
                        _this.tagCache = "";
                        _this.activeAutocompleteRequest = null;
                        _this.activeSearchRequest = null;
                        _this.searcher = SiteBuilder.buildSearcher(options.searchUrl, options.searchTransformer, {
                            safeSearchTag: options.safeSearchTag,
                            preprocessor: options.searchPreprocessor || dummyPreprocessor,
                            pageOffset: options.searchPageOffset || 0,
                            delimiter: options.searchTagDelimiter || " "
                        });
                        return _this;
                    }
                    class_2.prototype.onSelected = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = this;
                                        return [4 /*yield*/, cached_autocomplete_1.default.verifyCache(this, autocompleteModule_2.summaryUrl, autocompleteModule_2.version)];
                                    case 1:
                                        _a.tagCache = (_b.sent()) || "";
                                        this.autocompleteEnabled = true;
                                        return [2 /*return*/];
                                }
                            });
                        });
                    };
                    class_2.prototype.abortAutocomplete = function () {
                        if (this.activeAutocompleteRequest) {
                            clearTimeout(this.activeAutocompleteRequest);
                            this.activeAutocompleteRequest = null;
                        }
                    };
                    class_2.prototype.autocomplete = function (tag, send, complete, error) {
                        var _this = this;
                        var _a;
                        this.abortAutocomplete();
                        this.activeAutocompleteRequest = setTimeout(function () {
                            send(cached_autocomplete_1.default.complete(tag, _this.tagCache, autocompleteModule_2.typeToEnum));
                            complete();
                        }, ((_a = options.autocompleteModule) === null || _a === void 0 ? void 0 : _a.delay) || 0);
                    };
                    class_2.prototype.abortSearch = function () {
                        if (this.activeSearchRequest) {
                            this.activeSearchRequest.abort();
                            this.activeSearchRequest = null;
                        }
                    };
                    class_2.prototype.search = function (tags, page, safeSearch, send, complete, error) {
                        this.abortSearch();
                        this.activeSearchRequest = this.searcher(tags, page, safeSearch, send, complete, error);
                    };
                    return class_2;
                }(site_1.default));
            }
        }
        return new /** @class */ (function (_super) {
            __extends(class_3, _super);
            function class_3() {
                var _this = _super.call(this, options.name, options.id) || this;
                _this.isPorn = options.isPorn;
                _this.autocompleteEnabled = false;
                _this.proxyHeaders = options.proxyHeaders || {};
                _this.proxyEnvVariables = options.proxyEnvVariables || [];
                _this.activeSearchRequest = null;
                _this.searcher = SiteBuilder.buildSearcher(options.searchUrl, options.searchTransformer, {
                    safeSearchTag: options.safeSearchTag,
                    preprocessor: options.searchPreprocessor || dummyPreprocessor,
                    pageOffset: options.searchPageOffset || 0,
                    delimiter: options.searchTagDelimiter || " "
                });
                return _this;
            }
            class_3.prototype.abortSearch = function () {
                if (this.activeSearchRequest) {
                    this.activeSearchRequest.abort();
                    this.activeSearchRequest = null;
                }
            };
            class_3.prototype.search = function (tags, page, safeSearch, send, complete, error) {
                this.abortSearch();
                this.activeSearchRequest = this.searcher(tags, page, safeSearch, send, complete, error);
            };
            return class_3;
        }(site_1.default));
    };
    SiteBuilder.ExtractImagesGelboorulike = function (json) {
        var images = [json.preview_url, json.file_url];
        if (json.sample && json.sample_url)
            images.push(json.sample_url);
        return images;
    };
    return SiteBuilder;
}());
exports.SiteBuilder = SiteBuilder;
//# sourceMappingURL=site-builder.js.map