
const CATEGORIES = {
    0: "general",
    1: "artist",
    3: "copyright",
    4: "character",
    5: "meta",
    "tag": "general"
};

const ADVANCED_DOMAINS = [
    "rule34"
];

const ONE_DAY_MS = 86400000;

let currentPage = 0;
let populatedPosts = [ ];

let searchBox;
let leftColumn;
let rightColumn;
let moreButton;
let loadingMessage;
let appContent;
let lastSearch;
let lastDomain;
let searchPane;
let searchBtn;
let domainSelect;
let suggestionsPanel;
let initialText;
let currentPost;

let prevPostButton;
let nextPostButton;

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
let savedURL = "";

let currentDomain = "danbooru";

let leftHeight = 0;
let rightHeight = 0;
let warnNSFW = true;

let showAdvancedDomains = 0;

const cachedSearch = {
    searchTags: [],
    checkTagsInclude: [],
    checkTagsExclude: [],
    domain: undefined
};

const metaTagSymbolRegex = new RegExp(/:|-/g);

function requestSequence(urls, callback, acc) {
    if (urls.length === 0) {
        callback(acc);
        return;
    }
    const url = urls[0];
    const index = parseInt(url[0]);
    const rest = url.slice(2);
    $.getJSON(rest, function (data) {
        if (!acc) acc = [];
        const found = acc[index];
        if (found) {
            found.push.apply(found, data);
        }
        else {
            acc[index] = data;
        }
        requestSequence(urls.slice(1), callback, acc);
    }).fail(() => {
        requestSequence(urls.slice(1), callback, acc);
    });
}

function interleaveArrays(arrays) {
    let result = [];
    let i = 0;
    while (true) {
        let allEmpty = true;
        for (let j = 0; j < arrays.length; j++) {
            if (arrays[j].length > i) {
                result.push(arrays[j][i]);
                allEmpty = false;
            }
        }
        if (allEmpty) {
            break;
        }
        i++;
    }
    return result;
}

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

$.fn.toggleOption = function( show ) {
    $( this ).toggle( show );
    if( show ) {
        if( $( this ).parent( 'span.toggleOption' ).length )
            $( this ).unwrap( );
    } else {
        if( $( this ).parent( 'span.toggleOption' ).length == 0 )
            $( this ).wrap( '<span class="toggleOption" style="display: none;" />' );
    }
};

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
    domainSelect = $("#domain-select");
    suggestionsPanel = $("#suggestions");
    initialText = $("#initial-text");

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

    domainSelect = $("#domain-select");

    copyLinkButton = $("#copy-link");
    prevPostButton = $("#prev-post");
    nextPostButton = $("#next-post");

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
        fullscreenVideo[0].load();
        window.scrollTo(savedScrollCoords.x, savedScrollCoords.y);
        window.history.replaceState(null, null, savedURL);
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

        function addSuggestion(x) {
            const suggestion = $(`<a class='suggestion tag-${CATEGORIES[x.category] || x.category}' href='#' onclick='return false'></a>`);
            suggestion.text(x.name);
            suggestion.on("click", function () {
                const i = line.startsWith("-")? 1 : 0;
                searchBox[0].value = (str.substring(0, currentLineIndex + i) + x.name + "\n" + str.substring(nextLineIndex + 1));
                searchBox[0].focus();
                searchBox[0].setSelectionRange(999, 999);
                suggestionsPanel.empty();
            });
            suggestionsPanel.append(suggestion);
        }

        const prefix = line.startsWith("-")? line.slice(1).trim() : line;
        const filterFunc = currentDomain == "yandere"? (x => x.name.indexOf(prefix) !== -1) : (x => x.name.indexOf(prefix) === 0);
        const cached = filterLimit(DOMAINS[currentDomain].tagCache, filterFunc, 10);
        cached.forEach(addSuggestion);

        if(currentDomain == "yandere") return;

        timer = setTimeout(() => {
            $.getJSON(DOMAINS[currentDomain].suggestionsUrl + formatTag(line), function (data) {

                if(!data || data.length == 0) {
                    return;
                }

                // const existing = suggestionsPanel.find("a").get().map(x => x.innerText);
                // console.log(existing);
                data.forEach(x => {
                    mapObject(x, DOMAINS[currentDomain].suggestionMappings);
                    if(!cached.some(y => y.name == x.name)) {
                        DOMAINS[currentDomain].tagCache.push(x);
                        addSuggestion(x);
                    }
                }); 
            }).fail(reportError);
        }, 1000);
    }

    searchBox.on("keyup", searchBoxKeyUp);
    searchBox.on("click", searchBoxKeyUp);

    function searchString(text, callback) {
        const tags = getTags(text.trim());
        suggestionsPanel.empty();
        
        if(warnNSFW && DOMAINS[currentDomain].isNSFW && !tags.some(x => x.startsWith("id:")) && !tags.some(x => x.startsWith("rating:"))) {
            const includeNSFW = confirm("Warning: your search may include NSFW content. Would you like to proceed?\n\nNote: including \"rating:safe\" in your search will filter NSFW content.\n\nIf you select 'OK' you will not be warned again.");
            if(includeNSFW) {
                warnNSFW = false;
            } else {
                tags.unshift("rating:safe");
                searchBox.val(tags.join("\n"));
            }
        }

        if (lastDomain && lastDomain == currentDomain && lastSearch && tags.length == lastSearch.length && tags.every(v => lastSearch.includes(v))) {
            document.activeElement.blur();
            return;
        }

        leftHeight = 0;
        rightHeight = 0;
        lastSearch = tags;
        lastDomain = currentDomain;
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

    domainSelect.on("change", function () {
        currentDomain = domainSelect.val();
        checkTagCache(currentDomain);
    });

    $("#help-btn").on("click", function () {
        $("#help-menu").show();
    });

    $("#close-help-menu").on("click", function () {
        $("#help-menu").hide();
    });

    $("#clear-cached-tags").on("click", function () {
        localStorage.clear();
        $(this).text("Cleared");
    });

    prevPostButton.on("click", function () {
        const currentIndex = populatedPosts.indexOf(currentPost);
        if(currentIndex == 0) return;
        const prevPost = populatedPosts[currentIndex - 1];
        openPost(prevPost, prevPost.offsetTop - 100);
    });

    nextPostButton.on("click", function () {
        const currentIndex = populatedPosts.indexOf(currentPost);
        if(currentIndex == populatedPosts.length - 1) return;
        const nextPost = populatedPosts[currentIndex + 1];
        openPost(nextPost, nextPost.offsetTop - 100);
    });

    fullscreenVideo.on("loadeddata", function() {
        fullscreenImage.hide();
        fullscreenVideo.show();
    });

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if(params.domain) {
        if(ADVANCED_DOMAINS.includes(params.domain)) {
            showAdvancedDomains = 1;
        }

        domainSelect.val(params.domain);
        currentDomain = domainSelect.val();
        checkTagCache(currentDomain);
    }

    if(showAdvancedDomains == 0 && (!params.advanced || params.advanced == "0")) {
        $(".advanced-domain").remove();
    }
    else {
        showAdvancedDomains = 1;
    }

    if(params.q) {
        const search = params.q.replace(/,/g, "\n");
        searchBox.val(search);
        let callback;
        if(/id:[0-9]+/gi.test(search)) {
            callback = () => {
                $("img").trigger("click");  
            };
        }
        searchString(search, callback);
    }

    currentDomain = domainSelect.val();
    checkTagCache(currentDomain);

    history.pushState({}, "", location.href);

    // window.addEventListener("popstate", function(e) {
    //     if(fullscreenImage.is(":visible")) {
    //         closeFullscreen();
    //         history.pushState({}, "", location.href);
    //     }
    //     else {
    //         this.history.back();
    //     }
    // });
});

function checkTagCache(domain) {
    const lastUpdated = localStorage.getItem("tag-cache-last-update-" + domain);
    const now = Date.now();
    if(!DOMAINS[domain].disableCaching && (lastUpdated == null || now - lastUpdated > ONE_DAY_MS * 3)) {
        console.log("UPDATING TAG CACHE");
        DOMAINS[domain].downloadTags(tags => {
            mapObject(tags, DOMAINS[domain].suggestionMappings);
            saveTagCache(domain, tags);
            DOMAINS[domain].tagCache = tags;
            console.log("DONE");
        });
    }
    else {
        console.log("USING OLD TAG CACHE");
        DOMAINS[domain].tagCache = loadTagCache(domain);
    }
}

function loadTagCache(domain) {
    const cache = localStorage.getItem("tag-cache-" + domain) || "";
    return cache.split(";").map(x => {
        const parts = x.split(",");
        return {
            name: parts[0],
            category: parts[1],
            post_count: parts[2]
        };
    });
}

function saveTagCache(domain, tags) {
    const cache = tags.map(x => `${x.name},${x.category},${x.post_count}`).join(";");
    localStorage.setItem("tag-cache-" + domain, cache);
    localStorage.setItem("tag-cache-last-update-" + domain, Date.now());
}

function onFinishedSearch(result) {
    if(result.reachedEnd) {
        moreButton.hide();
    }
    else {
        moreButton.show();
    }
}

function mapRating(rating) {
    rating = rating.toLowerCase().substring("rating:".length);
    const mapped = DOMAINS[currentDomain].ratingMappings[rating];
    if(mapped) return "rating:" + mapped;
    return "rating:" + rating;
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
                freeTags.push(mapRating(tag.slice(1)));
            }
            else {
                negatedTags.push(tag.slice(1));
            }
        }
        else if(isRating(tag)) {
            freeTags.push(mapRating(tag));
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
    
    initialText.remove();

    if(!additive) {
        leftColumn.empty();
        rightColumn.empty();
        populatedPosts = [ ];
    }

    moreButton.hide();
    loadingMessage.text("loading...");
    loadingMessage.show();

    savedURL = '/?';
    if(showAdvancedDomains)
        savedURL += "advanced=1&";
    savedURL += 'domain=' + currentDomain + '&q=' + tags.join(',');

    history.replaceState({}, '', savedURL);

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

function filterLimit(array, f, limit) {
    const result = [];
    for(const x of array) {
        if(f(x)) {
            result.push(x);
            if(result.length >= limit) {
                break;
            }
        }
    }
    return result;
}

function search(tags, additive, callback) {
    if(tags.length == 0) return;
    
    let populated = 0;
    let tries = 0;
    
    const _search = () => {
        const limit = cachedSearch.checkTagsInclude.length > 0 
            || cachedSearch.checkTagsExclude.length > 0 ? cachedSearch.searchTags.length * 20 : 20;

        const isIDSearch = cachedSearch.searchTags.some(x => x.startsWith("id:"));
        const limitText = isIDSearch? "" : ("&limit=" + limit + "&" + DOMAINS[currentDomain].pageKey + "=" + (currentPage + (DOMAINS[currentDomain].pageOffset || 0)));
        const searchUrl = DOMAINS[currentDomain].searchUrl + cachedSearch.searchTags.join(" ") + limitText;
        console.log("Sending request to " + searchUrl);
        $.getJSON(searchUrl, function (data) {
            const unpack = DOMAINS[currentDomain].searchUnpack;
            if(unpack) data = unpack(data);
            
            if(!data || data.length == 0) {
                if(callback) callback({
                    found: populated,
                    reachedEnd: true
                });
                return;
            }

            data.forEach(x => { mapObject(x, DOMAINS[currentDomain].postMappings) });

            const filtered = data.filter(post => {
                const postTags = post.tag_string.split(" ");
                return cachedSearch.checkTagsInclude.every(tag => postTags.includes(tag)) 
                    && !cachedSearch.checkTagsExclude.some(tag => postTags.includes(tag));
            });

            if(filtered.length == 0) {
                tries++;
                if(!isIDSearch && tries < 5) {
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
                if(!isIDSearch && populated < 20) {
                    currentPage++;
                    _search();
                }
                else {
                    if(callback) callback({
                        found: populated,
                        reachedEnd: isIDSearch
                    });
                }
            });
        }).fail(err => {
            if(err.status == 200) {
                if(callback) callback({
                    found: populated,
                    reachedEnd: true
                });
            }
            else reportError(err);
        });
    }

    if(additive) {
        _search();
        return;
    }

    const tagTypes = sortTags(tags);

    cachedSearch.domain = currentDomain;
    if(currentDomain != "danbooru" || tagTypes.taxedTags.length + tagTypes.negatedTags.length < 3) {
        cachedSearch.searchTags = [ ...tagTypes.taxedTags, ...tagTypes.negatedTags.map(x => "-" + x), ...tagTypes.freeTags ];
        cachedSearch.checkTagsInclude = [];
        cachedSearch.checkTagsExclude = [];
        _search();
    }
    else {
        const allTaxedTags = Array.from(new Set([ ...tagTypes.taxedTags, ...tagTypes.negatedTags ]));

        $.getJSON(DOMAINS[currentDomain].tagUrl + allTaxedTags.join(","), function(tagsInfo) {
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
    console.error(err.statusText);
    if(err.status == 422) {
        alert("Sorry! This search is not supported.");
    }
    else {
        alert("Error: " + err.status + " " + err.statusText);
    }
}

function doTagSection(name, tagString) {
    if(!tagString || tagString.length == 0) {
        $(`#danbooru-${name}-section`).hide();
    }
    else {
        $(`#danbooru-${name}-section`).show();
        $(`#danbooru-${name}-tags`).text(tagString);
    }
}

function openPost(post, overrideScrollY) {

    if(overrideScrollY == undefined) overrideScrollY = window.scrollY;

    currentPost = post;
    history.replaceState({}, '', '/post/' + currentDomain + '/' + post.id);

    suggestionsPanel.empty();
    savedScrollCoords = { x: window.scrollX, y: overrideScrollY };

    const currentIndex = populatedPosts.indexOf(currentPost);
    if(currentIndex > 0) {
        prevPostButton.removeClass("hidden");
    } else {
        prevPostButton.addClass("hidden")
    }

    if(currentIndex < populatedPosts.length - 1) {
        nextPostButton.removeClass("hidden");
    } else {
        nextPostButton.addClass("hidden");
    }

    appContent.hide();

    fullscreenVideo.hide();
    fullscreenImage.show();
    fullscreenImage.attr("src", post.preview_file_url);

    fullscreenContainer.show();
    fullscreenContainer.scrollTop(0);

    post.file_ext = post.file_ext || post.file_url.substring(post.file_url.lastIndexOf(".") + 1);
    const file_ext = post.file_ext == "zip"? "webm" : post.file_ext;
    if(file_ext == "mp4" || file_ext == "webm") {
        fullscreenVideoSrc.attr("src", post.large_file_url);
        fullscreenVideoSrc.attr("type", "video/" + file_ext);
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
    danbooruOpenPost.attr("href", DOMAINS[currentDomain].postPrefix + post.id);
    danbooruPostDate.text(post.created_at.slice(0, 10));
    if(post.file_size) {
        danbooruPostFilesize.text(Math.round(post.file_size / 1000) + " KB (" + post.image_width + "x" + post.image_height + ")");
    }
    else {
        danbooruPostFilesize.text(post.image_width + "x" + post.image_height);
    }
    danbooruPostSource.text(post.source || "Unknown");
    danbooruPostSource.attr("href", post.source);
    danbooruPostRating.text(DOMAINS[currentDomain].ratingsToString[post.rating] || post.rating);
    danbooruPostScore.text(post.score);
    danbooruPostFavourites.text(post.fav_count || "N/A");
    copyLinkButton.on("click", () => {
        const link = location.protocol + '//' + location.host + "/post/" + currentDomain + "/" + post.id;
        navigator.clipboard.writeText(link).then(() => {
            copyLinkButton.text("copied");
            setTimeout(() => copyLinkButton.text("(copy link)"), 2000);
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
        if(!post.large_file_url) post.large_file_url = post.file_url;

        const preprocessor = DOMAINS[currentDomain].postPreprocess;
        if(preprocessor) preprocessor(post);

        const image = $("<img>");
        const imgHeight = normalisedHeight(post);
        const timeout = setTimeout(imgError, 3000);

        function imgError() {
            clearTimeout(timeout);
            image.remove();
            if(leftHeight > rightHeight) {
                rightHeight -= imgHeight;
            } else {
                leftHeight -= imgHeight;
            }
            completeImage();
        }

        if(leftHeight > rightHeight) {
            post.offsetTop = rightHeight * 250;
            rightColumn.append(image);
            rightHeight += imgHeight;
        } else {
            post.offsetTop = leftHeight * 250;
            leftColumn.append(image);
            leftHeight += imgHeight;
        }

        populatedPosts.push(post);

        image[0].onload = () => {
            populated++;
            clearTimeout(timeout);
            completeImage();
        };

        image.on("error", imgError);

        image.on("click", () => openPost(post));
        image.attr("src", post.preview_file_url);
    }
}