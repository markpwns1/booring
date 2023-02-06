const API_URL = "https://danbooru.donmai.us/posts.json?tags=";
const TAG_URL = "https://danbooru.donmai.us/tags.json?search[name_comma]=";
const AUTOCOMPLETE_URL = "https://danbooru.donmai.us/autocomplete.json?limit=10&search[type]=tag_query&search[query]=";

let currentPage = 0;

let searchBox;
let leftColumn;
let rightColumn;
let moreButton;
let loadingMessage;
let fullscreenContainer;
let fullscreenImage;
let appContent;
let lastSearch;
let searchPane;
let searchBtn;
let suggestionsPanel;

$(document).ready(function () {

    searchBox = $("#search-box");
    leftColumn = $("#column-1");
    rightColumn = $("#column-2");
    moreButton = $("#more-btn");
    loadingMessage = $("#loading-msg");
    fullscreenContainer = $("#fullscreen-container");
    fullscreenImage = $("#fullscreen-image");
    appContent = $("#content");
    searchPane = $("#search");
    searchBtn = $("#search-btn");
    suggestionsPanel = $("#suggestions");

    moreButton.hide();
    fullscreenContainer.hide();

    function closeFullscreen() {
        fullscreenContainer.hide();    
        $("body").toggleClass("content-hidden");
    }

    // fullscreenImage.on("click", closeFullscreen);
    $("#fullscreen-close").on("click", closeFullscreen);

    let timer = null;

    function searchBoxKeyUp(event) {
        suggestionsPanel.empty();
        clearTimeout(timer);
        const str = searchBox.val();
        const selectionStart = this.selectionStart;
        let last;
        const regex = /\n/g;
        while (true) {
            const match = regex.exec(str);
            if(!match || match.index >= selectionStart || match.index == -1) {
                break;
            }
            last = match.index == -1? 0 : match.index;
        }
        const segment = str.substring(last, selectionStart).trim();

        if(segment.length == 0) {
            return;
        }

        timer = setTimeout(() => {
            $.getJSON(AUTOCOMPLETE_URL + formatTag(segment), function (data) {

                if(data.length == 0) {
                    return;
                }

                data.forEach(x => {
                    const tag = x.label;
                    const suggestion = $("<a class='suggestion' href='#'></a>");
                    suggestion.text(tag);
                    suggestion.on("click", function () {
                        searchBox[0].value = (str.substring(0, last + 1) + tag + "\n" + str.substring(selectionStart));
                        // suggestionsPanel.hide();
                        // setTimeout(function() {
                            searchBox[0].focus();
                            searchBox[0].setSelectionRange(999, 999);
                        // }, 100);
                        setTimeout(searchBoxKeyUp, 100);
                    });
                    suggestionsPanel.append(suggestion);
                }); 
            }).fail(reportError);
        }, 500);
    }

    searchBox.on("keyup", searchBoxKeyUp);

    searchBtn.on("click", function () {
        const tags = getTags(searchBox.val().trim());
        suggestionsPanel.empty();
        // console.log(tags);
        if (lastSearch && tags.length == lastSearch.length && tags.every(v => lastSearch.includes(v))) {
            document.activeElement.blur();
            return;
        }

        lastSearch = tags;
        currentPage = 1;
        searchImages(tags, false, onFinishedSearch);
        document.activeElement.blur();
    });

    moreButton.on("click", function () {
        currentPage++;
        searchImages(lastSearch, true, onFinishedSearch);
    });

    searchPane.on("focusin", function () {
        searchPane.addClass("open");
        searchBox.addClass("open");
    });

    searchPane.on("focusout", function () {
        searchPane.removeClass("open");
        searchBox.removeClass("open");
    });

});

function onFinishedSearch(result) {
    if(result.reachedEnd) {
        moreButton.hide();
    }
    else {
        moreButton.show();
    }
}

function searchImages(tags, additive, callback) {
    if(tags.length == 0) return;
    
    if(!additive) {
        leftColumn.empty();
        rightColumn.empty();
    }

    const old_callback = callback;
    callback = (x) => {
        if(x.reachedEnd) {
            loadingMessage.text("No more images found.");
        } else {
            moreButton.show();
            loadingMessage.hide();
        }
        if (old_callback) old_callback(x);
    }

    moreButton.hide();
    loadingMessage.text("loading...");
    loadingMessage.show();

    if(tags.length > 2) {
        $.getJSON(TAG_URL + tags.join(","), function(tags) {
            const sorted = Array.from(tags).sort((a, b) => a.post_count - b.post_count);
            const twoLeastPopular = sorted.slice(0, 2);
            const rest = sorted.slice(2);

            const searchValue = twoLeastPopular.map(x => x.name).join(" ");
            
            let numberFound = 0;
            let tries = 0;

            const search = () => {
                const searchUrl = API_URL + searchValue + "&limit=" + (tags.length * 20) + "&page=" + currentPage;
            
                $.getJSON(searchUrl, function (data) {
                    if(data.length == 0) {
                        if(callback) callback({
                            found: numberFound,
                            reachedEnd: true
                        });
                        return;
                    }

                    const filtered = data.filter(post => {
                        const postTags = post.tag_string.split(" ");
                        return rest.every(tag => postTags.includes(tag.name));
                    });

                    if(filtered.length == 0) {
                        tries++;
                        if(tries < 5) {
                            currentPage++;
                            search();
                        }
                        return;
                    }
                    else {
                        tries = 0;
                        numberFound += filtered.length;
                    }

                    populateResults(filtered, additive, () => {
                        if(numberFound < 20) {
                            currentPage++;
                            search();
                        }
                        else {
                            if(callback) callback({
                                found: numberFound,
                                reachedEnd: false
                            });
                        }
                    });
                }).fail(reportError);
            }

            search();

        }).fail(reportError);
    }
    else {
        const searchValue = tags.join(" ");
        const searchUrl = API_URL + searchValue + "&page=" + currentPage;

        $.getJSON(searchUrl, function (data) {
            if(data.length == 0) {
                if(callback) {
                    callback({
                        found: 0,
                        reachedEnd: true
                    });
                }
                return;
            }

            populateResults(data, additive, found => {
                if(callback) callback({
                    found: found,
                    reachedEnd: false
                });
            });
        }).fail(reportError);
    }
}

const formatTag = x => x.trim().replace(/ /gi, "_");

function getTags(textboxContent) {
    return textboxContent.trim().split("\n").map(formatTag);
}

function reportError(err) {
    alert("Error: " + err.status + " " + err.statusText);
}

function populateResults(data, add = false, callback = null) {
    let leftHeight = 0;
    let rightHeight = 0;

    if(add) {
        leftHeight = leftColumn.height();
        rightHeight = rightColumn.height();
    }

    let populated = 0;

    function display(i, oncomplete) {
        console.log(i + " / " + data.length + " (" + populated + ")");
        if(i >= data.length) {
            if(oncomplete) oncomplete();
            return;
        }

        const post = data[i];
        const image = $("<img>");

        const timeout = setTimeout(() => {
            display(i + 1, oncomplete);
        }, 3000);

        image.load(() => {
            if(leftHeight > rightHeight) {
                rightColumn.append(image);
                rightHeight += image[0].clientHeight;
            } else {
                leftColumn.append(image);
                leftHeight += image[0].clientHeight;
            }
            
            populated++;
            clearTimeout(timeout);
            display(i + 1, oncomplete);
        });

        image.on("error", () => {
            clearTimeout(timeout);
            display(i + 1, oncomplete);
        });

        image.on("click", () => {
            $("body").toggleClass("content-hidden");
            fullscreenContainer.show();
            fullscreenImage.attr("src", post.preview_file_url);
            fullscreenImage.attr("src", post.file_url);
            $("#danbooru-post-id").text(post.id);
            $("#danbooru-post-filesize").text(Math.round(post.file_size / 1000) + " KB (" + post.image_width + "x" + post.image_height + ")");
            $("#danbooru-post-source").text(post.source);
            $("#danbooru-post-source").attr("href", post.source);
            $("#danbooru-post-tags").text(post.tag_string);
        });

        image.attr("src", post.preview_file_url);
    }
    
    display(0, () => {
        if(callback) callback(populated);
    });
}