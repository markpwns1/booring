"use strict";
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
var util_1 = require("./util");
var autocomplete_tag_1 = require("./autocomplete-tag");
var tag_type_1 = require("./tag-type");
/**
 * A static class containing functionality for cached autocomplete styles, where the cache is of the format:
 * ```text
 * 3`firsttag`alias` 0`secondtag` 4`thirdtag` ...
 * ```
 */
var CachedAutocomplete = /** @class */ (function () {
    function CachedAutocomplete() {
    }
    /**
     * Given a site and a summary URL to query a new cache from, updates the cache if necessary
     * @param site The cache
     * @param summaryUrl
     * @param referenceVersion
     * @returns A promise for a string with the cache in it
     */
    CachedAutocomplete.verifyCache = function (site, summaryUrl, referenceVersion) {
        return __awaiter(this, void 0, void 0, function () {
            var tags, response, e_1, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(localStorage.getItem(site.id + "-version") != referenceVersion || Date.now() - parseInt(localStorage.getItem(site.id + "-last-update") || "0") > 1000 * 60 * 60 * 24 * 7)) return [3 /*break*/, 5];
                        console.log("Fetching ".concat(site.name, " tags from summary page: ").concat(summaryUrl));
                        response = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, util_1.getJsonPromise)(summaryUrl)];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        msg = "Could not fetch ".concat(site.name, " (").concat(site.id, ") tags from summary page");
                        console.log(msg);
                        console.error(e_1);
                        throw new Error(msg);
                    case 4:
                        localStorage.setItem(site.id + "-version", referenceVersion);
                        localStorage.setItem(site.id + "-last-update", Date.now().toString());
                        localStorage.setItem(site.id + "-tags", response.data);
                        tags = response.data;
                        console.log("Updated ".concat(site.name, " (").concat(site.id, ") tag cache"));
                        return [3 /*break*/, 6];
                    case 5:
                        console.log("Found ".concat(site.name, " (").concat(site.id, ") tag cache"));
                        tags = localStorage.getItem(site.id + "-tags");
                        _a.label = 6;
                    case 6: return [2 /*return*/, tags];
                }
            });
        });
    };
    /**
     * Given a partial tag, returns a list of autocomplete tags
     * @param tag The partial tag
     * @param cachedTags The cache to grab potential tags from
     * @param tagTypeMap A map of number to TagType
     * @returns A list of autocomplete tags to autocomplete the given tag
     */
    CachedAutocomplete.complete = function (tag, cachedTags, tagTypeMap) {
        var _a = autocomplete_tag_1.default.decompose(tag), negation = _a.negation, baseTag = _a.baseTag;
        if (baseTag.length == 0 || cachedTags == "") {
            return [];
        }
        var regex = this.createTagSearchRegex(baseTag, { global: true });
        var results = this.retrieveTagSearch(regex, cachedTags, { max_results: 100 });
        results = this.reorderSearchResults(baseTag, results);
        results = results.slice(0, 10);
        if ('sqe'.indexOf(baseTag) != -1)
            results.unshift('0`' + baseTag + '` ');
        var tags = [];
        for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
            var match = results_1[_i];
            var m = match.match(/(\d+)`([^`]*)`(([^ ]*)`)? /);
            if (!m) {
                console.error('Unparsable cached tag: \'' + match + '\'');
                return [];
            }
            var value = negation + m[2];
            tags.push(new autocomplete_tag_1.default(value, value, tagTypeMap[m[1]] || tag_type_1.default.Other));
        }
        return tags;
    };
    CachedAutocomplete.createTagSearchRegex = function (tag, options) {
        if (options === void 0) { options = {}; }
        // Split the tag by character.
        var letters = tag.split('');
        // We can do a few search methods:
        //
        // 1: Ordinary prefix search.
        // 2: Name search. "aaa_bbb" -> "aaa*_bbb*|bbb*_aaa*".
        // 3: Contents search; "tgm" -> "t*g*m*" -> "tagme".  The first character is still always
        // matched exactly.
        //
        // Avoid running multiple expressions.  Instead, combine these into a single one, then run
        // each part on the results to determine which type of result it is.  Always show prefix and
        // name results before contents results.
        var regexParts = [];
        // Allow basic word prefix matches.  "tag" matches at the beginning of any word
        // in a tag, e.g., both "tagme" and "dont_tagme".
        // Add the regex for ordinary prefix matches.
        var s = '(([^`]*_)?';
        letters.forEach(function (letter) {
            var escapedLetter = letter.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escaping special regex characters
            s += escapedLetter;
        });
        s += ')';
        regexParts.push(s);
        // Allow "fir_las" to match both "first_last" and "last_first".
        if (tag.indexOf('_') !== -1) {
            var first = tag.split('_', 1)[0];
            var last = tag.slice(first.length + 1);
            var escapedFirst = first.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            var escapedLast = last.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            s = '(';
            s += '(' + escapedFirst + '[^`]*_' + escapedLast + ')';
            s += '|';
            s += '(' + escapedLast + '[^`]*_' + escapedFirst + ')';
            s += ')';
            regexParts.push(s);
        }
        // Allow "tgm" to match "tagme".  If top_results_only is set, we only want primary results,
        // so omit this match.
        if (!options.top_results_only && letters.length < 12) {
            s = '(';
            letters.forEach(function (letter) {
                var escapedLetter = letter.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                s += escapedLetter;
                s += '[^`]*';
            });
            s += ')';
            regexParts.push(s);
        }
        // The space is included in the result, so the result tags can be matched with the
        // same regexes, for in reorder_search_results.
        //
        // (\d)+  match the alias ID                      1`
        // [^ ]*: start at the beginning of any alias     1`foo`bar`
        // ... match ...
        // [^`]*` all matches are prefix matches          1`foo`bar`tagme`
        // [^ ]*  match any remaining aliases             1`foo`bar`tagme`tag_me`
        var regexString = regexParts.join('|');
        var globalFlag = 'g';
        var finalRegexString = '(\\d+)[^ ]*`(' + regexString + ')[^`]*`[^ ]* ';
        return new RegExp(finalRegexString, globalFlag);
    };
    CachedAutocomplete.retrieveTagSearch = function (re, source, options) {
        if (options === void 0) { options = {}; }
        var results = [];
        var maxResults = 10;
        if (options.max_results !== undefined) {
            maxResults = options.max_results;
        }
        while (results.length < maxResults) {
            var m = re.exec(source);
            if (!m) {
                break;
            }
            var tag = m[0];
            // Ignore this tag.  We need a better way to blackhole tags.
            if (tag.indexOf(':deletethistag:') !== -1) {
                continue;
            }
            if (results.indexOf(tag) === -1) {
                results.push(tag);
            }
        }
        return results;
    };
    CachedAutocomplete.reorderSearchResults = function (tag, results) {
        var re = CachedAutocomplete.createTagSearchRegex(tag, { top_results_only: true, global: false });
        var topResults = [];
        var bottomResults = [];
        results.forEach(function (result) {
            if (re.test(result)) {
                topResults.push(result);
            }
            else {
                bottomResults.push(result);
            }
        });
        return topResults.concat(bottomResults);
    };
    return CachedAutocomplete;
}());
exports.default = CachedAutocomplete;
//# sourceMappingURL=cached-autocomplete.js.map