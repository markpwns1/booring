const API_URL = "https://danbooru.donmai.us/posts.json?tags=";
const TAG_URL = "https://danbooru.donmai.us/tags.json?search[name_comma]=";
const AUTOCOMPLETE_URL = "https://danbooru.donmai.us/autocomplete.json?limit=10&search[type]=tag_query&search[query]=";

const CATEGORIES = [ "general", "artist", "", "copyright", "character", "meta" ];

let currentPage = 0;

let searchBox;
let leftColumn;
let rightColumn;
let moreButton;
let loadingMessage;
let appContent;
let lastSearch;
let searchPane;
let searchBtn;
let suggestionsPanel;

let danbooruPostID;
let danbooruOpenPost;
let danbooruPostDate;
let danbooruPostSource;
let danbooruPostFilesize;
let danbooruPostRating;
let danbooruPostScore;
let danbooruPostFavourites;
let copyLinkButton;

let fullscreenContainer;
let fullscreenImage;
let fullscreenVideo;
let fullscreenVideoSrc;

let downscaleWarning;
let viewOriginal;

let savedScrollCoords = { x: 0, y: 0 };

let leftHeight = 0;
let rightHeight = 0;

const cachedSearch = {
    searchTags: [],
    checkTagsInclude: [],
    checkTagsExclude: []
};

const metaTagSymbolRegex = new RegExp(/:|-/g);

function lastIndexOfRegex(str, regex, lowerBound, upperBound) {
    let lastIndex = -1;
    lowerBound = lowerBound || 0;
    let match;
    while (match = regex.exec(str)) {
        if (match.index >= lowerBound) {
            if(upperBound && match.index >= upperBound) {
                break;
            }
            lastIndex = match.index;
        }
    }
    return lastIndex;
}

$(document).ready(function () {

    searchBox = $("#search-box");
    leftColumn = $("#column-1");
    rightColumn = $("#column-2");
    moreButton = $("#more-btn");
    loadingMessage = $("#loading-msg");
    fullscreenContainer = $("#fullscreen-container");
    fullscreenImage = $("#fullscreen-image");
    fullscreenVideo = $("#fullscreen-video");
    fullscreenVideoSrc = $("#fullscreen-video-src");
    appContent = $("#content");
    searchPane = $("#search");
    searchBtn = $("#search-btn");
    suggestionsPanel = $("#suggestions");

    danbooruPostID = $("#danbooru-post-id");
    danbooruOpenPost = $("#danbooru-open-post");
    danbooruPostDate = $("#danbooru-post-date");
    danbooruPostSource = $("#danbooru-post-source");
    danbooruPostFilesize = $("#danbooru-post-filesize");
    danbooruPostRating = $("#danbooru-post-rating");
    danbooruPostScore = $("#danbooru-post-score");
    danbooruPostFavourites = $("#danbooru-post-fav-count");

    downscaleWarning = $("#downscale-warning");
    viewOriginal = $("#view-original");

    copyLinkButton = $("#copy-link");

    moreButton.hide();
    fullscreenContainer.hide();
    $("#help-menu").hide();

    function closeFullscreen() {
        // $("body").toggleClass("content-hidden");
        appContent.show();
        fullscreenContainer.hide();
        fullscreenImage.off("load");
        fullscreenImage.attr("src", "");
        fullscreenVideoSrc.attr("src", "");
        window.scrollTo(savedScrollCoords.x, savedScrollCoords.y);
    }

    // fullscreenImage.on("click", closeFullscreen);
    $("#fullscreen-close").on("click", closeFullscreen);

    let timer = null;

    function searchBoxKeyUp() {
        suggestionsPanel.empty();
        clearTimeout(timer);
        const str = searchBox.val();
        const selectionStart = this.selectionStart;
        const currentLineIndex = lastIndexOfRegex(str, /\n/g, 0, selectionStart) + 1;
        const x = str.indexOf("\n", selectionStart); 
        const nextLineIndex = x == -1? str.length : x;
        const line = str.substring(currentLineIndex, nextLineIndex).trim();

        if(line.length == 0) {
            return;
        }

        timer = setTimeout(() => {
            $.getJSON(AUTOCOMPLETE_URL + formatTag(line), function (data) {

                if(data.length == 0) {
                    return;
                }

                data.forEach(x => {
                    const suggestion = $(`<a class='suggestion tag-${CATEGORIES[x.category]}' href='#' onclick='return false'></a>`);
                    suggestion.text(x.label);
                    suggestion.on("click", function (event) {
                        const i = line.startsWith("-")? 1 : 0;
                        searchBox[0].value = (str.substring(0, currentLineIndex + i) + x.value + "\n" + str.substring(nextLineIndex + 1));
                        searchBox[0].focus();
                        searchBox[0].setSelectionRange(999, 999);
                        suggestionsPanel.empty();
                        // setTimeout(searchBoxKeyUp, 100);
                    
                    });
                    suggestionsPanel.append(suggestion);
                }); 
            }).fail(reportError);
        }, 500);
    }

    searchBox.on("keyup", searchBoxKeyUp);
    searchBox.on("click", searchBoxKeyUp);

    function searchString(text, callback) {
        const tags = getTags(text.trim());
        suggestionsPanel.empty();
        
        if (lastSearch && tags.length == lastSearch.length && tags.every(v => lastSearch.includes(v))) {
            document.activeElement.blur();
            return;
        }

        leftHeight = 0;
        rightHeight = 0;
        lastSearch = tags;
        currentPage = 1;

        searchButtonClicked(tags, false, x => {
            onFinishedSearch(x);
            if(callback) callback()
        });
        document.activeElement.blur();
    }

    searchBtn.on("click", function () {
        searchString(searchBox.val());
    });

    moreButton.on("click", function () {
        currentPage++;
        searchButtonClicked(lastSearch, true, onFinishedSearch);
    });

    searchPane.on("focusin", function () {
        searchPane.addClass("open");
        searchBox.addClass("open");
    });

    searchPane.on("focusout", function () {
        searchPane.removeClass("open");
        searchBox.removeClass("open");
        // suggestionsPanel.empty();
    });

    $("#help-btn").on("click", function () {
        $("#help-menu").show();
    });

    $("#close-help-menu").on("click", function () {
        $("#help-menu").hide();
    });

    fullscreenVideo.on("loadeddata", function() {
        fullscreenImage.hide();
        fullscreenVideo.show();
    });

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if(params.q) {
        const search = params.q.replace(/,/g, "\n");
        searchBox.val(search);
        let callback;
        if(/id:[0-9]+/gi.test(search)) {
            callback = () => {
                // console.log("CLICKING")
                $("img").trigger("click");  
            };
        }
        searchString(search, callback);
    }
});

function onFinishedSearch(result) {
    if(result.reachedEnd) {
        moreButton.hide();
    }
    else {
        moreButton.show();
    }
}

function sortTags(tags) {
    const freeTags = [];
    const taxedTags = [];
    const negatedTags = [];

    const tagSet = new Set(tags);
    const isRating = (x) => x.startsWith("rating:");
    for(const tag of tagSet) {
        if(tag.startsWith("-")) {
            if(isRating(tag.slice(1))) {
                freeTags.push(tag.slice(1));
            }
            else {
                negatedTags.push(tag.slice(1));
            }
        }
        else if(isRating(tag)) {
            freeTags.push(tag);
        }
        else {
            taxedTags.push(tag);
        }
    }

    return {
        freeTags: freeTags,
        taxedTags: taxedTags,
        negatedTags: negatedTags
    };
}

function searchButtonClicked(tags, additive, callback) {
    if(tags.length == 0) return;
    
    if(!additive) {
        leftColumn.empty();
        rightColumn.empty();
    }

    moreButton.hide();
    loadingMessage.text("loading...");
    loadingMessage.show();

    search(tags, additive, result => {
        if(result.reachedEnd) {
            loadingMessage.text("No more images found.");
        } else {
            moreButton.show();
            loadingMessage.hide();
        }
        if (callback) callback(result);
    });
}

function search(tags, additive, callback) {
    if(tags.length == 0) return;
    
    let populated = 0;
    let tries = 0;
    
    const _search = () => {
        // console.log(cachedSearch);
        const limit = cachedSearch.checkTagsInclude.length > 0 
            || cachedSearch.checkTagsExclude.length > 0 ? cachedSearch.searchTags.length * 20 : 20;
        const searchUrl = API_URL + cachedSearch.searchTags.join(" ") + "&limit=" + limit + "&page=";
        $.getJSON(searchUrl + currentPage, function (data) {
            if(data.length == 0) {
                if(callback) callback({
                    found: populated,
                    reachedEnd: true
                });
                return;
            }

            const filtered = data.filter(post => {
                const postTags = post.tag_string.split(" ");
                return cachedSearch.checkTagsInclude.every(tag => postTags.includes(tag)) 
                    && !cachedSearch.checkTagsExclude.some(tag => postTags.includes(tag));
            });

            if(filtered.length == 0) {
                tries++;
                if(tries < 5) {
                    currentPage++;
                    _search();
                }
                return;
            }
            else {
                tries = 0;
                populated += filtered.length;
            }

            populateResults(filtered, () => {
                if(populated < 20) {
                    currentPage++;
                    _search();
                }
                else {
                    if(callback) callback({
                        found: populated,
                        reachedEnd: false
                    });
                }
            });
        });
    }

    if(additive) {
        _search();
        return;
    }

    const tagTypes = sortTags(tags);

    if(tagTypes.taxedTags.length + tagTypes.negatedTags.length < 3) {
        cachedSearch.searchTags = [ ...tagTypes.taxedTags, ...tagTypes.negatedTags.map(x => "-" + x), ...tagTypes.freeTags ];
        cachedSearch.checkTagsInclude = [];
        cachedSearch.checkTagsExclude = [];
        _search();
    }
    else {
        const allTaxedTags = Array.from(new Set([ ...tagTypes.taxedTags, ...tagTypes.negatedTags ]));

        $.getJSON(TAG_URL + allTaxedTags.join(","), function(tagsInfo) {
            const includeTagInfo = tagsInfo.filter(x => tagTypes.taxedTags.includes(x.name));
            const excludeTagInfo = tagsInfo.filter(x => tagTypes.negatedTags.includes(x.name));

            const includeSorted = Array.from(includeTagInfo).sort((a, b) => a.post_count - b.post_count).map(x => x.name);
            const excludeSorted = Array.from(excludeTagInfo).sort((a, b) => b.post_count - a.post_count).map(x => x.name);
            
            const twoLeastPopularIncludes = includeSorted.slice(0, 2);
            const twoMostPopularExcludes = excludeSorted.slice(0, Math.max(0, 2 - twoLeastPopularIncludes.length));
            
            cachedSearch.searchTags = [ ...twoLeastPopularIncludes, ...twoMostPopularExcludes.map(x => "-" + x), ...tagTypes.freeTags ];
            cachedSearch.checkTagsInclude = includeSorted.slice(twoLeastPopularIncludes.length);
            cachedSearch.checkTagsExclude = excludeSorted.slice(twoMostPopularExcludes.length);

            _search();

        }).fail(reportError);
    }
}

const formatTag = x => x.trim();

function getTags(textboxContent) {
    return textboxContent.trim().split("\n").map(formatTag);
}

function reportError(err) {
    if(err.status == 422) {
        alert("Sorry! This search is not supported.");
    }
    else {
        alert("Error: " + err.status + " " + err.statusText);
    }
}

const RATINGS_TO_STRING = {
    "g": "General",
    "s": "Sensitive",
    "q": "Questionable",
    "e": "Explicit"
}

function doTagSection(name, tagString) {
    if(tagString.length == 0) {
        $(`#danbooru-${name}-section`).hide();
    }
    else {
        $(`#danbooru-${name}-section`).show();
        $(`#danbooru-${name}-tags`).text(tagString);
    }
}

function openPost(post) {

    suggestionsPanel.empty();
    savedScrollCoords = { x: window.scrollX, y: window.scrollY };

    appContent.hide();

    fullscreenVideo.hide();
    fullscreenImage.show();
    fullscreenImage.attr("src", post.preview_file_url);

    fullscreenContainer.show();
    fullscreenContainer.scrollTop(0);

    if(post.file_ext == "mp4" || post.file_ext == "webm") {
        fullscreenVideoSrc.attr("src", post.large_file_url);
        fullscreenVideoSrc.attr("type", "video/" + post.file_ext);
        fullscreenVideo[0].load();
    }
    else {
        fullscreenVideoSrc.attr("src", "");

        fullscreenImage.attr("src", post.large_file_url);
        fullscreenImage.on("load", function() {
            const downscaleRatio = fullscreenImage[0].naturalHeight / post.image_height;
            if(downscaleRatio < 1.0) {
                downscaleWarning.show();
                downscaleWarning.text("Resized to " + Math.round(downscaleRatio * 100) + "% of original");
            }
            else {
                downscaleWarning.hide();
            }
        });
    }

    viewOriginal.attr("href", post.file_url);
    danbooruPostID.text(post.id);
    danbooruOpenPost.attr("href", "https://danbooru.donmai.us/posts/" + post.id);
    danbooruPostDate.text(post.created_at.slice(0, 10));
    danbooruPostFilesize.text(Math.round(post.file_size / 1000) + " KB (" + post.image_width + "x" + post.image_height + ")");
    danbooruPostSource.text(post.source);
    danbooruPostSource.attr("href", post.source);
    danbooruPostRating.text(RATINGS_TO_STRING[post.rating]);
    danbooruPostScore.text(post.score);
    danbooruPostFavourites.text(post.fav_count);
    copyLinkButton.on("click", () => {
        const link = location.protocol + '//' + location.host + location.pathname + "?q=id:" + post.id;
        navigator.clipboard.writeText(link).then(() => {
            copyLinkButton.text("copied");
            setTimeout(() => copyLinkButton.text("(copy link)"), 1000);
        });
    });
    doTagSection("artist", post.tag_string_artist);
    doTagSection("character", post.tag_string_character);
    doTagSection("general", post.tag_string_general);
    doTagSection("meta", post.tag_string_meta);
    doTagSection("copyright", post.tag_string_copyright);
}

// return the image's height if its width were 100
function normalisedHeight(post) {
    return post.image_height / post.image_width;
}

function populateResults(data, callback = null) {

    let populated = 0;
    let i = 0;

    function completeImage() {
        i++;
        if(i == data.length) {
            if(callback) callback(populated);
        }
    }

    for(const post of data) {
        const image = $("<img>");
        const timeout = setTimeout(completeImage, 3000);

        if(leftHeight > rightHeight) {
            rightColumn.append(image);
            rightHeight += normalisedHeight(post);
        } else {
            leftColumn.append(image);
            leftHeight += normalisedHeight(post);
        }

        image.load(() => {
            populated++;
            clearTimeout(timeout);
            completeImage();
        });

        image.on("error", () => {
            clearTimeout(timeout);
            completeImage();
        });

        image.on("click", () => openPost(post));
        image.attr("src", post.preview_file_url);
    }
}