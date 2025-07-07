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
var site_1 = require("@booring/site");
var util_1 = require("@booring/util");
var Frontend = /** @class */ (function () {
    function Frontend() {
    }
    Frontend.onHeaderSearchClick = function (event) {
        event.stopPropagation();
        if (!this.searchViewOpen) {
            this.showSearchView();
        }
        else {
            this.hideSearchView();
        }
    };
    Frontend.closeSearchByClick = function (event) {
        if (this.searchViewOpen && !this.$viewSearch[0].contains(event.target)) {
            this.$viewSearch.hide();
            this.searchViewOpen = false;
            event.preventDefault();
        }
    };
    Frontend.onSearchInputKeyDown = function (event) {
        if (event.key === "Enter") {
            if (this.$searchInput.val() === "") {
                this.search();
                return;
            }
            else if (this.selectedAutocompleteTag > -1) {
                var children = this.$autocompleteTags.children();
                var $tag = children.eq(this.selectedAutocompleteTag);
                $tag.trigger("click");
            }
            else {
                this.suppressAutocomplete = true;
                var tag = this.$searchInput.val();
                this.addSearchTag(tag);
                this.$searchInput.val("");
                this.$autocompleteTags.empty();
                this.$autocompleteTags.hide();
            }
        }
        else if (event.key == "ArrowDown") {
            event.preventDefault();
            this.selectedAutocompleteTag++;
            var children = this.$autocompleteTags.children();
            if (this.selectedAutocompleteTag >= children.length) {
                this.selectedAutocompleteTag = 0;
            }
            this.selectAutocompleteTag(this.selectedAutocompleteTag);
        }
        else if (event.key == "ArrowUp") {
            event.preventDefault();
            this.selectedAutocompleteTag--;
            if (this.selectedAutocompleteTag < 0) {
                this.selectedAutocompleteTag = this.$autocompleteTags.children().length - 1;
            }
            this.selectAutocompleteTag(this.selectedAutocompleteTag);
        }
        else if (event.key == "Escape") {
            if (this.selectedAutocompleteTag > -1) {
                this.unselectAutocompleteTags();
            }
            else {
                this.hideSearchView();
            }
        }
    };
    Frontend.onSearchInputChange = function () {
        var _this = this;
        if (this.suppressAutocomplete) {
            this.suppressAutocomplete = false;
            return;
        }
        if (!site_1.default.current.autocompleteEnabled) {
            this.$autocompleteTags.hide();
            return;
        }
        site_1.default.current.autocomplete(this.$searchInput.val(), function (tags) {
            _this.updateAutocompleteTags(tags);
        }, function () { }, function (error) {
            console.error(error);
        });
    };
    Frontend.onSearchCancelClick = function (event) {
        event.stopPropagation();
        this.$resultsFooterText.text("Currently showing " + this.posts.length + " images.\n\nNote that due to technical limitations, if you click \"Show more...\", you will get some repeat posts.");
        this.$btnFooterSearch.hide();
        this.$btnLoadMore.show();
        this.$btnCancelSearch.hide();
        site_1.default.current.abortSearch();
    };
    Frontend.onNextPostClick = function (event) {
        var _this = this;
        event === null || event === void 0 ? void 0 : event.stopPropagation();
        if (this.currentPost < this.posts.length - 1) {
            this.openPost(this.posts[++this.currentPost], function () {
                if (_this.currentPost < _this.posts.length - 1) {
                    _this.preloadImage(_this.posts[_this.currentPost + 1].getLargeImage(), function (img) {
                        _this.cachedImage = img;
                    });
                }
            });
        }
        this.$btnNextPost.trigger("blur");
    };
    Frontend.onPrevPostClick = function (event) {
        var _this = this;
        event === null || event === void 0 ? void 0 : event.stopPropagation();
        if (this.currentPost > 0) {
            this.openPost(this.posts[--this.currentPost], function () {
                if (_this.currentPost > 0) {
                    _this.preloadImage(_this.posts[_this.currentPost - 1].getLargeImage(), function (img) {
                        _this.cachedImage = img;
                    });
                }
            });
        }
        this.$btnPrevPost.trigger("blur");
    };
    Frontend.onWindowKeyDown = function (event) {
        if (this.openedPost) {
            if (event.key === "ArrowRight") {
                this.onNextPostClick();
            }
            else if (event.key === "ArrowLeft") {
                this.onPrevPostClick();
            }
        }
    };
    Frontend.onCopyButtonPressed = function (event) {
        var _this = this;
        event.stopPropagation();
        var url = "".concat(window.location.origin, "/post/").concat(this.openedPost.site.id, "/").concat(this.openedPost.id);
        var textArea = document.createElement("textarea");
        // Place in the top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = "0";
        textArea.style.left = "0";
        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = "0";
        // Clean up any borders.
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        // Avoid flash of the white box if rendered for any reason.
        textArea.style.background = 'transparent';
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        }
        catch (err) {
            console.log('Oops, unable to copy');
        }
        document.body.removeChild(textArea);
        this.$btnCopyLink.text("Copied!");
        setTimeout(function () {
            _this.$btnCopyLink.text("Copy link");
        }, 2000);
        this.$btnCopyLink.trigger("blur");
    };
    Frontend.onDownloadButtonPressed = function (event) {
        event.stopPropagation();
        var url = (0, util_1.proxify)(site_1.default.current.id, this.openedPost.getFullSizeImage());
        var fileExtension = url.split(".").pop();
        var filename = "".concat(this.openedPost.site.id, "-").concat(this.openedPost.id, ".").concat(fileExtension);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.$btnDownload.trigger("blur");
    };
    Frontend.onClosePostClick = function (event) {
        event.stopPropagation();
        this.$postPlaceholder.show();
        this.$post.hide();
        this.$postVideo.trigger("pause");
        this.$postVideo.attr("src", "");
        this.$postVideo.attr("poster", "");
        this.$postImage.attr("src", "");
        this.$postDownscaleWarning.hide();
        if (window.innerWidth < 1000) {
            this.$paneLeft.show();
            this.$paneRight.hide();
        }
        this.openedPost = undefined;
    };
    Frontend.onWindowResize = function () {
        if (!this.openedPost && window.innerWidth < 1000) {
            this.$paneRight.hide();
        }
    };
    Frontend.arraySetEquals = function (a, b) {
        if (a === undefined || b === undefined)
            return false;
        if (a === b)
            return true;
        if (a.length !== b.length)
            return false;
        for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
            var item = a_1[_i];
            if (!b.includes(item))
                return false;
        }
        for (var _a = 0, b_1 = b; _a < b_1.length; _a++) {
            var item = b_1[_a];
            if (!a.includes(item))
                return false;
        }
        return true;
    };
    Frontend.preloadImage = function (file, onComplete) {
        var img = new Image();
        img.onload = onComplete.bind(this, img);
        img.src = file;
    };
    Frontend.search = function (additive) {
        var _this = this;
        if (additive === void 0) { additive = false; }
        if (!additive
            && this.lastSearch
            && site_1.default.current == this.lastSearch.site
            && this.arraySetEquals(this.searchTags, this.lastSearch.tags)
            && this.currentPage == this.lastSearch.page
            && this.safeSearchEnabled == this.lastSearch.safeSearch) {
            console.log("Same search. Cancelling.");
            return;
        }
        console.log("Searching: " + this.searchTags.join(", "));
        // Set URL to reflect search
        window.history.replaceState({}, "", "?".concat(this.safeSearchEnabled ? "" : "nsfw=true&", "site=").concat(site_1.default.current.id, "&tags=").concat(this.searchTags.join(",")));
        if (!additive)
            this.currentPage = 0;
        this.$resultsPlaceholder.hide();
        this.$results.show();
        this.$resultsFooter.show();
        this.$resultsFooterText.text("Loading...");
        this.$btnFooterSearch.hide();
        this.$btnLoadMore.hide();
        this.$btnCancelSearch.show();
        if (!additive)
            this.clearResults();
        var selectPost = this.searchTags.some(function (x) { return x.startsWith("id:"); });
        this.lastSearch = {
            tags: __spreadArray([], this.searchTags, true),
            page: this.currentPage,
            safeSearch: this.safeSearchEnabled,
            site: site_1.default.current
        };
        site_1.default.current.search(__spreadArray([], this.searchTags, true), this.currentPage, this.safeSearchEnabled && !selectPost, function (posts) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(posts.map(this.addPost.bind(this)))];
                    case 1:
                        _a.sent();
                        if (selectPost && this.posts.length > 0) {
                            this.openPost(this.posts[0]);
                            selectPost = false;
                        }
                        return [2 /*return*/];
                }
            });
        }); }, function (newPage, endOfResults) {
            _this.currentPage = newPage;
            if (endOfResults) {
                _this.$resultsFooterText.text("No more images found.");
                _this.$btnFooterSearch.show();
                _this.$btnLoadMore.hide();
                _this.$btnCancelSearch.hide();
            }
            else {
                _this.$resultsFooterText.text("");
                _this.$btnFooterSearch.hide();
                _this.$btnLoadMore.show();
                _this.$btnCancelSearch.hide();
            }
        }, function (error) { return console.error(error); });
        this.hideSearchView();
    };
    Frontend.clearResults = function () {
        this.$resultsLeftColumn.empty();
        this.$resultsRightColumn.empty();
        this.leftColumnHeight = 0;
        this.rightColumnHeight = 0;
        this.posts = [];
    };
    Frontend.addPost = function (post) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var postImg = new Image();
            postImg.onload = function () {
                if (_this.leftColumnHeight <= _this.rightColumnHeight) {
                    _this.$resultsLeftColumn.append(postImg);
                    _this.leftColumnHeight += post.normalisedHeight();
                }
                else {
                    _this.$resultsRightColumn.append(postImg);
                    _this.rightColumnHeight += post.normalisedHeight();
                }
                _this.posts.push(post);
                resolve();
            };
            postImg.onclick = function (event) {
                event.stopPropagation();
                _this.openPost(post);
            };
            postImg.onerror = reject;
            postImg.src = post.getThumbnail();
            postImg.className = "results-image";
        });
    };
    // public static async populateResults(posts: Post[], endOfResults = false) {
    //     await Promise.all(posts.map(this.addPost.bind(this)));
    //     if(endOfResults) {
    //         this.$resultsFooterText.text("No more images found.");
    //         this.$btnFooterSearch.show();
    //         this.$btnLoadMore.hide();
    //         this.$btnCancelSearch.hide();
    //     }
    //     else {
    //         this.$resultsFooterText.text("Currently showing " + this.posts.length + " images.");
    //         this.$btnFooterSearch.hide();
    //         this.$btnLoadMore.show();
    //         this.$btnCancelSearch.hide();
    //     }
    // }
    Frontend.unselectAutocompleteTags = function () {
        this.selectedAutocompleteTag = -1;
        this.$autocompleteTags.children().removeClass("selected");
    };
    Frontend.selectAutocompleteTag = function (index) {
        this.selectedAutocompleteTag = index;
        if (this.selectedAutocompleteTag < 0)
            return;
        var children = this.$autocompleteTags.children();
        if (this.selectedAutocompleteTag >= children.length)
            return;
        children.removeClass("selected");
        children.eq(this.selectedAutocompleteTag).addClass("selected");
    };
    Frontend.updateAutocompleteTags = function (tags) {
        var _this = this;
        this.unselectAutocompleteTags();
        if (tags.length == 0) {
            this.$autocompleteTags.hide();
            return;
        }
        else {
            this.$autocompleteTags.show();
        }
        this.$autocompleteTags.empty();
        var _loop_1 = function (tag) {
            var $tag = $("<button class=\"autocomplete-tag tag-".concat(tag.type, "\">").concat(tag.label, "</button>"));
            $tag.on("click touchstart", function (event) {
                _this.suppressAutocomplete = true;
                event.stopPropagation();
                event.preventDefault();
                _this.addSearchTag(tag.value);
                _this.$searchInput.val("");
                _this.$autocompleteTags.empty();
                _this.$autocompleteTags.hide();
            });
            this_1.$autocompleteTags.append($tag);
        };
        var this_1 = this;
        for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
            var tag = tags_1[_i];
            _loop_1(tag);
        }
    };
    Frontend.showSearchView = function () {
        this.$viewSearch.show();
        this.searchViewOpen = true;
        this.$searchInput.trigger("focus");
    };
    Frontend.hideSearchView = function () {
        this.$viewSearch.hide();
        this.searchViewOpen = false;
        this.$searchInput.val("");
        this.$autocompleteTags.hide();
        this.$autocompleteTags.empty();
        this.unselectAutocompleteTags();
    };
    Frontend.addSearchTag = function (tag) {
        var _this = this;
        tag = tag.trim();
        if (this.searchTags.includes(tag))
            return;
        this.searchTags.push(tag);
        var $tag = $("<span class=\"search-tag\">".concat(tag, " <span class=\"search-tag-close\">&#x2715</span></span>"));
        $tag.one("click", function (event) {
            event.stopPropagation();
            _this.searchTags.splice(_this.searchTags.indexOf(tag), 1);
            $tag.remove();
            if (_this.searchTags.length === 0) {
                _this.$searchTagDisplay.hide();
                _this.$searchTagHeaderNoTags.show();
            }
        });
        this.$searchTagHeaderNoTags.hide();
        this.$searchCurrentTags.append($tag);
        this.$searchTagDisplay.show();
    };
    Frontend.clearSearchTags = function () {
        this.searchTags = [];
        this.$searchCurrentTags.empty();
        this.$searchTagDisplay.hide();
        this.$searchTagHeaderNoTags.show();
    };
    Frontend.setSafeSearchEnabled = function (enabled) {
        this.safeSearchEnabled = enabled;
        this.$btnSafeSearch.text(this.safeSearchEnabled ? "Safe Search: ON" : "Safe Search: OFF");
        var nsfwSites = this.$selectSearchSite.children(".nsfw-site");
        if (this.safeSearchEnabled) {
            nsfwSites.attr("disabled", "");
            nsfwSites.attr("hidden", "");
        }
        else {
            nsfwSites.removeAttr("disabled");
            nsfwSites.removeAttr("hidden");
        }
    };
    Frontend.openPost = function (post, onComplete) {
        var _this = this;
        if (this.openedPost && this.openedPost.id === post.id)
            return;
        if (window.innerWidth < 1000) {
            this.$paneLeft.hide();
        }
        else {
            this.$paneLeft.show();
        }
        this.$postPlaceholder.hide();
        this.$post.show();
        this.$paneRight.show();
        this.currentPost = this.posts.indexOf(post);
        console.log("Opening post " + this.currentPost);
        this.$postPlaceholder.hide();
        this.$post.show();
        if (post.requiresVideoPlayer) {
            this.$postImage.hide();
            this.$postVideo.show();
            this.$postVideo.attr("poster", post.getThumbnail());
            this.$postVideo.attr("src", post.getLargeImage());
            this.$postVideo.trigger("play");
        }
        else {
            this.$postVideo.hide();
            this.$postImage.show();
            var imageResolutionIndex_1 = (this.cachedImage && this.cachedImage.src === post.getLargeImage()) ? 1 : 0;
            this.$postImage.attr("src", post.imageResolutions[imageResolutionIndex_1]);
            var postImg_1 = this.$postImage[0];
            postImg_1.onload = function () {
                if (imageResolutionIndex_1 > 0) {
                    if (onComplete)
                        onComplete();
                }
                var scale = Math.round(postImg_1.height / postImg_1.naturalHeight * 100);
                var fullSizeScale = Math.round(postImg_1.naturalHeight / post.fullHeight * 100);
                if (postImg_1.naturalHeight < postImg_1.height) {
                    if (scale > 150 && imageResolutionIndex_1 < post.imageResolutions.length - 1) {
                        imageResolutionIndex_1++;
                        _this.$postImage.attr("src", post.imageResolutions[imageResolutionIndex_1]);
                    }
                }
                if (fullSizeScale < 100) {
                    _this.$postDownscaleWarning.show();
                    _this.$postDownscaleWarning.text("Resized to ".concat(fullSizeScale, "% of original"));
                }
                else {
                    _this.$postDownscaleWarning.hide();
                }
            };
            postImg_1.onerror = function () {
                _this.$postImage.attr("src", post.getThumbnail());
            };
        }
        this.$postInfoHeader.text("".concat(post.site.name, " #").concat(post.id));
        // this.$postPropertySite.text(post.site.name);
        // this.$postPropertyId.text(post.id);
        if (!this.openedPost || this.openedPost.site !== post.site) {
            this.$postInfo.empty();
            for (var key in post.properties) {
                if (!post.properties[key])
                    continue;
                var $property = $("<span class=\"post-property\"><b>".concat(key, "</b>: ").concat(post.properties[key], "</span>"));
                this.postProperties[key] = $property;
                this.$postInfo.append($property);
            }
            this.$postTagTypes.empty();
            for (var key in post.tagTypes) {
                var tags = post.tagTypes[key];
                if (!tags || tags.length == 0)
                    continue;
                var $tagType = $("<div class=\"post-tag-type\"></div>");
                var $header = $("<h3 class=\"post-tag-type-header\"><b>".concat(key, "</b></h3>"));
                $tagType.append($header);
                var $tagList = $("<span class=\"post-tag-list tag-".concat(key.toLowerCase(), "\">").concat(tags.join(" "), "</span>"));
                $tagType.append($tagList);
                this.postTagTypes[key] = $tagList;
                this.$postTagTypes.append($tagType);
            }
        }
        else {
            for (var key in post.properties) {
                this.postProperties[key].html("<b>".concat(key, "</b>: ").concat(post.properties[key]));
            }
            for (var key in post.tagTypes) {
                this.postTagTypes[key].text(post.tagTypes[key].join(" "));
            }
        }
        if (this.currentPost === 0) {
            this.$btnPrevPost.addClass("invisible");
        }
        else {
            this.$btnPrevPost.removeClass("invisible");
        }
        if (this.currentPost === this.posts.length - 1) {
            this.$btnNextPost.addClass("invisible");
        }
        else {
            this.$btnNextPost.removeClass("invisible");
        }
        this.openedPost = post;
    };
    Frontend.main = function () {
        var _this = this;
        this.$btnHeaderSearch = $("#header-search, #results-placeholder, #btn-different-search");
        this.$viewSearch = $("#view-search");
        this.$viewSearch.hide();
        this.$searchInput = $("#search-input");
        this.$searchCurrentTags = $("#search-current-tags");
        this.$searchTagHeaderNoTags = $("#search-tag-header-no-tags");
        this.$searchTagDisplay = $("#search-tag-display");
        this.$searchTagDisplay.hide();
        this.$btnClearTags = $("#btn-clear");
        this.$btnExitSearch = $("#btn-exit-search");
        this.$selectSearchSite = $("#search-site");
        this.$btnSearch = $("#btn-search");
        this.$resultsLeftColumn = $("#results-column-left");
        this.$resultsRightColumn = $("#results-column-right");
        this.$resultsPlaceholder = $("#results-placeholder");
        this.$results = $("#results");
        this.$resultsFooter = $("#results-footer");
        this.$resultsFooterText = $("#results-footer-text");
        this.$btnFooterSearch = $("#btn-different-search");
        this.$btnLoadMore = $("#btn-load-more");
        this.$autocompleteTags = $("#search-autocomplete");
        this.$btnCancelSearch = $("#btn-cancel-search");
        this.$postPlaceholder = $("#post-placeholder");
        this.$post = $("#post");
        this.$postImage = $("#post-image");
        this.$postDownscaleWarning = $("#post-downscale-warning");
        this.$btnPrevPost = $("#btn-prev-post");
        this.$btnViewFullsize = $("#btn-view-fullsize");
        this.$btnOpenOriginalPost = $("#btn-open-original");
        this.$btnNextPost = $("#btn-next-post");
        this.$btnCopyLink = $("#btn-copy-link");
        this.$btnDownload = $("#btn-download");
        this.$btnClosePost = $("#btn-close-post");
        this.$postInfo = $("#post-info");
        this.$postPropertySite = $("#post-property-site");
        this.$postPropertyId = $("#post-property-id");
        this.$postTagTypes = $("#post-tag-types");
        this.$postVideo = $("#post-video");
        this.$postInfoHeader = $("#post-info-header");
        this.$paneLeft = $("#pane-left");
        this.$paneRight = $("#pane-right");
        this.$btnSafeSearch = $("#btn-safe-search");
        this.$btnHeaderSearch.on("click", this.onHeaderSearchClick.bind(this));
        this.$searchInput.on("keydown", this.onSearchInputKeyDown.bind(this));
        this.$searchInput.on("input", this.onSearchInputChange.bind(this));
        window.addEventListener("click", this.closeSearchByClick.bind(this));
        this.$btnClearTags.on("click", function (event) {
            event.stopPropagation();
            _this.clearSearchTags();
        });
        this.$btnExitSearch.on("click", function (event) {
            event.stopPropagation();
            _this.hideSearchView();
        });
        this.$selectSearchSite.append(site_1.default.getAll().map(function (site) { return "<option value=\"".concat(site.id, "\" ").concat(site.isPorn ? 'class="nsfw-site"' : "", ">").concat(site.name, "</option>"); }).join(""));
        this.$selectSearchSite.on("change", function (event) {
            var site = site_1.default.find(_this.$selectSearchSite.val());
            site_1.default.current = site;
            site_1.default.current.onSelected();
            _this.$autocompleteTags.empty();
            _this.$autocompleteTags.hide();
        });
        var urlParams = new URLSearchParams(window.location.search);
        var nsfw = urlParams.has("nsfw") ? urlParams.get("nsfw") === "true" : false;
        this.safeSearchEnabled = !nsfw;
        if (this.safeSearchEnabled) {
            var nsfwSites = this.$selectSearchSite.children(".nsfw-site");
            nsfwSites.attr("disabled", "");
            nsfwSites.attr("hidden", "");
        }
        site_1.default.current = site_1.default.getAll()[0];
        this.$btnSearch.on("click", function (event) {
            event.stopPropagation();
            _this.search();
        });
        this.$btnLoadMore.on("click", function (event) {
            event.stopPropagation();
            _this.currentPage++;
            _this.search(true);
        });
        this.$btnViewFullsize.on("click", function (event) {
            event.stopPropagation();
            window.open(_this.openedPost.getFullSizeImage(), "_blank");
            _this.$btnViewFullsize.trigger("blur");
        });
        this.$btnOpenOriginalPost.on("click", function (event) {
            event.stopPropagation();
            window.open(_this.openedPost.originalPost, "_blank");
            _this.$btnOpenOriginalPost.trigger("blur");
        });
        this.$btnCancelSearch.on("click", this.onSearchCancelClick.bind(this));
        this.$btnPrevPost.on("click", this.onPrevPostClick.bind(this));
        this.$btnNextPost.on("click", this.onNextPostClick.bind(this));
        this.$btnCopyLink.on("click", this.onCopyButtonPressed.bind(this));
        this.$btnDownload.on("click", this.onDownloadButtonPressed.bind(this));
        this.$btnClosePost.on("click", this.onClosePostClick.bind(this));
        $(window).on("keydown", this.onWindowKeyDown.bind(this));
        $(window).on("resize", this.onWindowResize.bind(this));
        this.onWindowResize();
        this.$postInfoHeader.on("click", function (event) {
            console.log(_this.openedPost);
        });
        this.$btnSafeSearch.on("click", function (event) {
            event.stopPropagation();
            if (_this.safeSearchEnabled && !confirm("Are you sure you want to disable safe search?\n\nThis will allow sensitive or pornographic content to be displayed, as well as include new sites in the site dropdown that contain such content.")) {
                return;
            }
            _this.setSafeSearchEnabled(!_this.safeSearchEnabled);
        });
        this.$btnSafeSearch.text(this.safeSearchEnabled ? "Safe Search: ON" : "Safe Search: OFF");
        if (urlParams.has("domain") || urlParams.has("site")) {
            var siteId = (urlParams.get("domain") || urlParams.get("site"));
            var site = site_1.default.find(siteId);
            if (site) {
                site_1.default.current = site;
                site.onSelected();
                this.$selectSearchSite.val(siteId);
            }
        }
        if (urlParams.has("tags") || urlParams.has("q")) {
            var tags = (urlParams.get("tags") || urlParams.get("q")).split(",").map(function (tag) { return tag.trim(); });
            if (tags.length == 1 && tags[0] == "landscape")
                tags.push("no_humans");
            for (var _i = 0, tags_2 = tags; _i < tags_2.length; _i++) {
                var tag = tags_2[_i];
                if (tag.trim() !== "")
                    this.addSearchTag(tag);
            }
            this.search();
        }
        console.log("Frontend ready!");
    };
    Frontend.posts = [];
    Frontend.searchTags = [];
    Frontend.currentPage = 0;
    Frontend.currentPost = -1;
    Frontend.selectedAutocompleteTag = -1;
    Frontend.searchViewOpen = false;
    Frontend.suppressAutocomplete = false;
    Frontend.leftColumnHeight = 0;
    Frontend.rightColumnHeight = 0;
    Frontend.safeSearchEnabled = true;
    Frontend.postTagTypes = {};
    Frontend.postProperties = {};
    return Frontend;
}());
exports.default = Frontend;
//# sourceMappingURL=frontend.js.map