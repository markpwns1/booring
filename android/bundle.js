/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/frontend.ts":
/*!********************************!*\
  !*** ./src/client/frontend.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
var site_1 = __webpack_require__(/*! @booring/site */ "./src/core/site.ts");
var util_1 = __webpack_require__(/*! @booring/util */ "./src/core/util.ts");
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
        }, 
        // error => console.error(error)
        function (error) {
            throw error;
        });
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
        var urlParams = new URLSearchParams(window.location.search);
        var nsfw = urlParams.has("nsfw") ? urlParams.get("nsfw") === "true" : false;
        this.safeSearchEnabled = !nsfw;
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
exports["default"] = Frontend;


/***/ }),

/***/ "./src/core/autocomplete-tag.ts":
/*!**************************************!*\
  !*** ./src/core/autocomplete-tag.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Main class representing an autocomplete tag
 */
var AutocompleteTag = /** @class */ (function () {
    function AutocompleteTag(label, value, type) {
        this.label = label;
        this.value = value;
        this.type = type;
    }
    /**
     * Given a tag string like "-mytag", splits it into its components "-" and "mytag". If there
     * is no negation, then the negation part is an empty string "".
     * @param tag The tag
     * @returns The tag split into negation and base tag
     */
    AutocompleteTag.decompose = function (tag) {
        tag = tag.trim();
        var negation = "";
        if (tag.startsWith("-")) {
            negation = "-";
            tag = tag.substring(1).trim();
        }
        return { negation: negation, baseTag: tag };
    };
    return AutocompleteTag;
}());
exports["default"] = AutocompleteTag;


/***/ }),

/***/ "./src/core/cached-autocomplete.ts":
/*!*****************************************!*\
  !*** ./src/core/cached-autocomplete.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
var util_1 = __webpack_require__(/*! ./util */ "./src/core/util.ts");
var autocomplete_tag_1 = __webpack_require__(/*! ./autocomplete-tag */ "./src/core/autocomplete-tag.ts");
var tag_type_1 = __webpack_require__(/*! ./tag-type */ "./src/core/tag-type.ts");
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
exports["default"] = CachedAutocomplete;


/***/ }),

/***/ "./src/core/defines.ts":
/*!*****************************!*\
  !*** ./src/core/defines.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var defines =  false ? 0 : ({"android":true});
exports["default"] = defines;


/***/ }),

/***/ "./src/core/embed.ts":
/*!***************************!*\
  !*** ./src/core/embed.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
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
exports["default"] = Embed;


/***/ }),

/***/ "./src/core/get-json.ts":
/*!******************************!*\
  !*** ./src/core/get-json.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getJSON = void 0;
var defines_1 = __webpack_require__(/*! ./defines */ "./src/core/defines.ts");
var platformFetch;
if (defines_1.default === null || defines_1.default === void 0 ? void 0 : defines_1.default.android) {
    platformFetch = function (url, callback) {
        var result = Android.fetch(url);
        var json = JSON.parse(result);
        callback(json);
        return {
            abort: function () { },
            fail: function () { return this; }
        };
    };
}
else {
    platformFetch = $.getJSON;
}
exports.getJSON = platformFetch;


/***/ }),

/***/ "./src/core/post.ts":
/*!**************************!*\
  !*** ./src/core/post.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
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
exports["default"] = Post;


/***/ }),

/***/ "./src/core/site-builder.ts":
/*!**********************************!*\
  !*** ./src/core/site-builder.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SiteBuilder = void 0;
var autocomplete_tag_1 = __webpack_require__(/*! ./autocomplete-tag */ "./src/core/autocomplete-tag.ts");
var cached_autocomplete_1 = __webpack_require__(/*! ./cached-autocomplete */ "./src/core/cached-autocomplete.ts");
var site_1 = __webpack_require__(/*! ./site */ "./src/core/site.ts");
var get_json_1 = __webpack_require__(/*! ./get-json */ "./src/core/get-json.ts");
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
            return (0, get_json_1.getJSON)(endpoint, function (json) {
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


/***/ }),

/***/ "./src/core/site-registry.ts":
/*!***********************************!*\
  !*** ./src/core/site-registry.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var danbooru_1 = __webpack_require__(/*! ./sites/danbooru */ "./src/core/sites/danbooru.ts");
var gelbooru_1 = __webpack_require__(/*! ./sites/gelbooru */ "./src/core/sites/gelbooru.ts");
var yandere_1 = __webpack_require__(/*! ./sites/yandere */ "./src/core/sites/yandere.ts");
var safebooru_1 = __webpack_require__(/*! ./sites/safebooru */ "./src/core/sites/safebooru.ts");
var rule34_1 = __webpack_require__(/*! ./sites/rule34 */ "./src/core/sites/rule34.ts");
var konachan_1 = __webpack_require__(/*! ./sites/konachan */ "./src/core/sites/konachan.ts");
var zerochan_1 = __webpack_require__(/*! ./sites/zerochan */ "./src/core/sites/zerochan.ts");
var site_1 = __webpack_require__(/*! ./site */ "./src/core/site.ts");
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
exports["default"] = registerAll;


/***/ }),

/***/ "./src/core/site.ts":
/*!**************************!*\
  !*** ./src/core/site.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Main class representing site functionality
 */
var Site = /** @class */ (function () {
    function Site(name, id) {
        /** True if autocomplete functionality should be enabled by calling `this.autocomplete(...)` */
        this.autocompleteEnabled = false;
        /** True if this site should be hidden when safe search is on */
        this.isPorn = false;
        /**
         * A set of HTTP headers to include in this site's proxy. Calling `proxify(this.id, url)`
         * will create a URL using the Booring server as a proxy, and it will include these headers.
         * A typical example is something like "Referrer": "http://example.com/" as sometimes sites
         * will not serve API calls unless it contains the right headers
         */
        this.proxyHeaders = {};
        this.name = name;
        this.id = id;
    }
    /**
     * Returns a site with a given ID
     * @param id The site's ID
     * @returns The site with the ID given, or undefined if it was not found
     */
    Site.find = function (id) {
        return Site.sites.find(function (x) { return x.id === id; });
    };
    /**
     * Returns a list of all currently registered sites
     * @returns The aforementioned list
     */
    Site.getAll = function () {
        return Site.sites;
    };
    /**
     * Registers a site with the frontend, and adds it to the site selection dropdown
     * @param site The site to register
     */
    Site.register = function (site) {
        Site.sites.push(site);
        site.onRegistered();
    };
    /**
     * Called when the site is first registered. Use this to initialise anything you need to
     */
    Site.prototype.onRegistered = function () { };
    /**
     * Called when the site is selected in search box's dropdown menu. Use this to initialise
     * autocomplete or anything else you need
     */
    Site.prototype.onSelected = function () { };
    /**
     * This function should take in a JSON object representing a post, and parse it into a Post
     * object that is usable by the Booru frontend. Implementing this function is entirely optional.
     * @param json The JSON object representing a post
     * @returns A parsed post
     * @throws If the post is not parseable, or if this function is not implemented.
     */
    Site.prototype.parsePost = function (json) {
        throw new Error("parsePost not implemented");
    };
    /**
     * Given a phrase, this function should call the `send()` and `complete()` functions to return a list of
     * autocomplete tags. This function should be asynchronous. This function does not need to be implemented
     * if autocompleteEnabled is false.
     * @param tag The phrase to autocomplete
     * @param send A function to send a set of autocomplete tags to the frontend. Can be called multiple times
     * @param complete A function to indicate that the autocomplete operation has finished
     * @param error A function to indicate that an error has occured, and that the autocomplete operation has ended
     */
    Site.prototype.autocomplete = function (tag, send, complete, error) {
        error("Autocomplete not implemented");
    };
    /**
     * Abort any current autocomplete operation, if any exist
     */
    Site.prototype.abortAutocomplete = function () { };
    /**
     * Searches a site and returns a `Post[]` containing the posts
     * @param tags The list of tags to search
     * @param page The page number of the search (essentially, how many times the user clicked "load more" in the frontend)
     * @param safeSearch Whether or not safe search is enabled. When true, the search should not display sensitive or NSFW results
     * @param send A function to send a set of posts to the frontend. Can be called multiple times
     * @param complete A function to indicate that the search operation has finished
     * @param error A function to indicate that an error has occured, and that the search operation has ended
     */
    Site.prototype.search = function (tags, page, safeSearch, send, complete, error) {
        error("Search not implemented");
    };
    /**
     * Abort any current search operation, if any exist
     */
    Site.prototype.abortSearch = function () { };
    /**
     * Given an ID, returns a promise for a Post with the given ID. This function may be called by the server, so do not use any browser-specific code here, like window or jQuery.
     * @param fetchJSON The fetch function to use. This is provided since jQuery is not available in this function.
     * @param id The post's ID
     * @returns A promise for a Post
     */
    Site.prototype.getPostByID = function (fetchJSON, id) {
        return new Promise(function (resolve, reject) {
            reject("getPostByID not implemented");
        });
    };
    /**
     * Given a post, generates an embed for things like Discord and Twitter.
     * @param post The post
     */
    Site.prototype.generateEmbed = function (post) {
        throw new Error("generateEmbed not implemented");
    };
    /**
     * List of all registered sites
     */
    Site.sites = [];
    return Site;
}());
exports["default"] = Site;


/***/ }),

/***/ "./src/core/sites/danbooru.ts":
/*!************************************!*\
  !*** ./src/core/sites/danbooru.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
var post_1 = __webpack_require__(/*! ../post */ "./src/core/post.ts");
var site_1 = __webpack_require__(/*! ../site */ "./src/core/site.ts");
var autocomplete_tag_1 = __webpack_require__(/*! ../autocomplete-tag */ "./src/core/autocomplete-tag.ts");
var tag_type_1 = __webpack_require__(/*! ../tag-type */ "./src/core/tag-type.ts");
var util_1 = __webpack_require__(/*! ../util */ "./src/core/util.ts");
var site_builder_1 = __webpack_require__(/*! ../site-builder */ "./src/core/site-builder.ts");
var embed_1 = __webpack_require__(/*! @booring/embed */ "./src/core/embed.ts");
var get_json_1 = __webpack_require__(/*! @booring/get-json */ "./src/core/get-json.ts");
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
            _this.activeSearchRequest = (0, get_json_1.getJSON)(url, function (json) {
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
            _this.activeSearchRequest = (0, get_json_1.getJSON)(url, function (json) {
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
                        throw err_1;
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
                        throw err_2;
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
                        if (false) {}
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
                        throw err_3;
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
exports["default"] = Danbooru;


/***/ }),

/***/ "./src/core/sites/gelbooru.ts":
/*!************************************!*\
  !*** ./src/core/sites/gelbooru.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var post_1 = __webpack_require__(/*! ../post */ "./src/core/post.ts");
var tag_type_1 = __webpack_require__(/*! ../tag-type */ "./src/core/tag-type.ts");
var site_builder_1 = __webpack_require__(/*! ../site-builder */ "./src/core/site-builder.ts");
var util_1 = __webpack_require__(/*! ../util */ "./src/core/util.ts");
var RATINGS_TO_STRING = {
    "general": "General",
    "sensitive": "Sensitive",
    "questionable": "Questionable",
    "explicit": "Explicit"
};
var TYPE_TO_ENUM = {
    "tag": tag_type_1.default.General,
    "artist": tag_type_1.default.Artist,
    "copyright": tag_type_1.default.Copyright,
    "character": tag_type_1.default.Character,
    "metadata": tag_type_1.default.Meta
};
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function autocompleteTransformFunction(json) {
    return {
        label: "".concat(json.label, " (").concat(json.post_count, ")"),
        value: json.value,
        type: TYPE_TO_ENUM[json.category]
    };
}
function postTransformFunction(json) {
    var post = new post_1.default(Gelbooru);
    post.id = json.id.toString();
    post.imageResolutions = [
        json.preview_url,
        (0, util_1.proxify)("gelbooru", json.file_url)
    ];
    if (json.sample == 1 && json.sample_url) {
        post.imageResolutions.splice(1, 0, (0, util_1.proxify)("gelbooru", json.sample_url));
    }
    post.fullWidth = json.width;
    post.fullHeight = json.height;
    post.originalPost = "https://gelbooru.com/index.php?page=post&s=view&id=".concat(json.id);
    var parts = json.created_at.split(" ");
    var month = MONTHS.indexOf(parts[1]) + 1;
    var day = parts[2];
    var year = parts[5];
    var date = year.padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + day.padStart(2, "0");
    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": "".concat(json.width, "x").concat(json.height),
        "Source": json.source,
        "Date": date,
        "Score": json.score.toString(),
        "Last Updated": new Date(json.change * 1000).toISOString().split("T")[0]
    };
    post.tagTypes = {
        "Tags": json.tags.split(" ")
    };
    post.requiresVideoPlayer = json.sample_url.endsWith(".mp4")
        || json.sample_url.endsWith(".webm")
        || json.file_url.endsWith(".mp4")
        || json.file_url.endsWith(".webm");
    return post;
}
var Gelbooru = site_builder_1.SiteBuilder.buildSite({
    name: "Gelbooru",
    id: "gelbooru",
    isPorn: false,
    proxyHeaders: {
        "Referrer": "https://gelbooru.com/"
    },
    autocompleteModule: {
        url: (0, util_1.proxify)("json", "https://gelbooru.com/index.php?page=autocomplete2&type=tag_query&limit=10&term={tag}"),
        transformer: autocompleteTransformFunction
    },
    searchUrl: (0, util_1.proxify)("json", "https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=20&pid={page}&tags={tags}"),
    safeSearchTag: "rating:general",
    searchPreprocessor: function (json) { return json.post || []; },
    searchTransformer: postTransformFunction
});
exports["default"] = Gelbooru;


/***/ }),

/***/ "./src/core/sites/konachan.ts":
/*!************************************!*\
  !*** ./src/core/sites/konachan.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var post_1 = __webpack_require__(/*! ../post */ "./src/core/post.ts");
var site_builder_1 = __webpack_require__(/*! ../site-builder */ "./src/core/site-builder.ts");
var tag_type_1 = __webpack_require__(/*! ../tag-type */ "./src/core/tag-type.ts");
var util_1 = __webpack_require__(/*! ../util */ "./src/core/util.ts");
var RATINGS_TO_STRING = {
    "s": "Safe",
    "q": "Questionable",
    "e": "Explicit"
};
var KONACHAN_VERSION = "1";
function postTransformFunction(json) {
    var post = new post_1.default(Konachan);
    post.id = json.id.toString();
    post.imageResolutions = [
        json.preview_url,
        (0, util_1.proxify)("konachan", json.sample_url),
        (0, util_1.proxify)("konachan", json.jpeg_url),
        (0, util_1.proxify)("konachan", json.file_url)
    ];
    post.fullWidth = json.width;
    post.fullHeight = json.height;
    post.originalPost = "https://konachan.com/post/show/".concat(json.id);
    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": "".concat(Math.round(json.file_size / 1000), " KB (").concat(json.width, "x").concat(json.height, ")"),
        "Source": json.source == "" ? "Unknown" : json.source,
        "Uploader": json.author,
        "Date": new Date(json.created_at * 1000).toISOString().split('T')[0],
        "Score": json.score.toString()
    };
    post.tagTypes = {
        "Tags": json.tags.split(" ")
    };
    return post;
}
var Konachan = site_builder_1.SiteBuilder.buildSite({
    name: "Konachan",
    id: "konachan",
    isPorn: false,
    proxyHeaders: {
        "Referrer": "https://konachan.com/"
    },
    autocompleteModule: {
        summaryUrl: (0, util_1.proxify)("json", "https://konachan.com/tag/summary.json"),
        version: KONACHAN_VERSION,
        typeToEnum: {
            "0": tag_type_1.default.General,
            "1": tag_type_1.default.Artist,
            "3": tag_type_1.default.Copyright,
            "4": tag_type_1.default.Character,
            "5": tag_type_1.default.Meta
        },
        delay: 333
    },
    searchUrl: (0, util_1.proxify)("json", "https://konachan.com/post.json?limit=20&page={page}&tags={tags}"),
    safeSearchTag: "rating:s",
    searchPageOffset: 1,
    searchTransformer: postTransformFunction
});
exports["default"] = Konachan;


/***/ }),

/***/ "./src/core/sites/rule34.ts":
/*!**********************************!*\
  !*** ./src/core/sites/rule34.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var post_1 = __webpack_require__(/*! ../post */ "./src/core/post.ts");
var tag_type_1 = __webpack_require__(/*! ../tag-type */ "./src/core/tag-type.ts");
var site_builder_1 = __webpack_require__(/*! ../site-builder */ "./src/core/site-builder.ts");
var util_1 = __webpack_require__(/*! ../util */ "./src/core/util.ts");
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
exports["default"] = Rule34;


/***/ }),

/***/ "./src/core/sites/safebooru.ts":
/*!*************************************!*\
  !*** ./src/core/sites/safebooru.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var post_1 = __webpack_require__(/*! ../post */ "./src/core/post.ts");
var tag_type_1 = __webpack_require__(/*! ../tag-type */ "./src/core/tag-type.ts");
var site_builder_1 = __webpack_require__(/*! ../site-builder */ "./src/core/site-builder.ts");
var util_1 = __webpack_require__(/*! ../util */ "./src/core/util.ts");
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
exports["default"] = Safebooru;


/***/ }),

/***/ "./src/core/sites/yandere.ts":
/*!***********************************!*\
  !*** ./src/core/sites/yandere.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var post_1 = __webpack_require__(/*! ../post */ "./src/core/post.ts");
var site_builder_1 = __webpack_require__(/*! ../site-builder */ "./src/core/site-builder.ts");
var tag_type_1 = __webpack_require__(/*! ../tag-type */ "./src/core/tag-type.ts");
var util_1 = __webpack_require__(/*! ../util */ "./src/core/util.ts");
var RATINGS_TO_STRING = {
    "s": "Safe",
    "q": "Questionable",
    "e": "Explicit"
};
var YANDERE_VERSION = "1";
function postTransformFunction(json) {
    var post = new post_1.default(Yandere);
    post.id = json.id.toString();
    post.imageResolutions = [
        json.preview_url,
        (0, util_1.proxify)("yandere", json.sample_url),
        (0, util_1.proxify)("yandere", json.jpeg_url),
        (0, util_1.proxify)("yandere", json.file_url)
    ];
    post.fullWidth = json.width;
    post.fullHeight = json.height;
    post.originalPost = "https://yande.re/post/show/".concat(json.id);
    post.properties = {
        "Rating": RATINGS_TO_STRING[json.rating],
        "Size": "".concat(Math.round(json.file_size / 1000), " KB (").concat(json.width, "x").concat(json.height, ")"),
        "Source": json.source == "" ? "Unknown" : json.source,
        "Uploader": json.author,
        "Date": new Date(json.created_at).toISOString().split('T')[0],
        "Last Updated": new Date(json.updated_at).toISOString().split("T")[0],
        "Score": json.score.toString()
    };
    post.tagTypes = {
        "Tags": json.tags.split(" ")
    };
    return post;
}
var Yandere = site_builder_1.SiteBuilder.buildSite({
    name: "Yande.re",
    id: "yandere",
    isPorn: false,
    autocompleteModule: {
        summaryUrl: "https://yande.re/tag/summary.json",
        version: YANDERE_VERSION,
        typeToEnum: {
            "0": tag_type_1.default.General,
            "1": tag_type_1.default.Artist,
            "3": tag_type_1.default.Copyright,
            "4": tag_type_1.default.Character,
            "5": tag_type_1.default.Circle
        },
        delay: 333
    },
    searchUrl: "https://yande.re/post.json?limit=20&page={page}&tags={tags}",
    safeSearchTag: "rating:s",
    searchPageOffset: 1,
    searchTransformer: postTransformFunction
});
exports["default"] = Yandere;


/***/ }),

/***/ "./src/core/sites/zerochan.ts":
/*!************************************!*\
  !*** ./src/core/sites/zerochan.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var post_1 = __webpack_require__(/*! ../post */ "./src/core/post.ts");
var site_builder_1 = __webpack_require__(/*! ../site-builder */ "./src/core/site-builder.ts");
var tag_type_1 = __webpack_require__(/*! ../tag-type */ "./src/core/tag-type.ts");
var util_1 = __webpack_require__(/*! ../util */ "./src/core/util.ts");
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
exports["default"] = Zerochan;


/***/ }),

/***/ "./src/core/tag-type.ts":
/*!******************************!*\
  !*** ./src/core/tag-type.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Represents a tag's type. Used pretty much just for colour
 */
var TagType;
(function (TagType) {
    TagType["Artist"] = "artist";
    TagType["Copyright"] = "copyright";
    TagType["Character"] = "character";
    TagType["General"] = "general";
    TagType["Meta"] = "meta";
    TagType["Circle"] = "circle";
    TagType["Other"] = "other";
})(TagType || (TagType = {}));
exports["default"] = TagType;


/***/ }),

/***/ "./src/core/util.ts":
/*!**************************!*\
  !*** ./src/core/util.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.proxify = exports.getJsonPromise = void 0;
var defines_1 = __webpack_require__(/*! ./defines */ "./src/core/defines.ts");
var get_json_1 = __webpack_require__(/*! ./get-json */ "./src/core/get-json.ts");
/**
 * Equivalent to jQuery's getJSON but returns a promise instead of a special jQuery type.
 * @param url A URL to fetch from
 * @returns A promise with the returned JSON object
 */
function getJsonPromise(url) {
    return new Promise(function (resolve, reject) {
        (0, get_json_1.getJSON)(url, resolve).fail(reject);
    });
}
exports.getJsonPromise = getJsonPromise;
var platformProxify;
if (defines_1.default === null || defines_1.default === void 0 ? void 0 : defines_1.default.android) {
    platformProxify = function (proxy, url) {
        return url;
    };
}
else {
    platformProxify = function (proxy, url) {
        return "".concat(typeof window === "undefined" ? "" : window.location.origin, "/proxy/").concat(proxy, "/").concat(url);
    };
}
/**
 * Returns a URL routed through the Booring server's proxy. Use Site.proxyHeaders to control
 * what headers get included through the proxy
 * @param proxy The ID of the site whose headers should be used for the proxy
 * @param url The URL to access via proxy
 * @returns The given URL but routed through the Booring server as a proxy
 */
exports.proxify = platformProxify;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*****************************!*\
  !*** ./src/client/index.ts ***!
  \*****************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var frontend_1 = __webpack_require__(/*! ./frontend */ "./src/client/frontend.ts");
var site_registry_1 = __webpack_require__(/*! @booring/site-registry */ "./src/core/site-registry.ts");
(0, site_registry_1.default)();
$(frontend_1.default.main.bind(frontend_1.default));

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map