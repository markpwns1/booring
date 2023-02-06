const API_URL = "https://danbooru.donmai.us/posts.json?tags=";
const TAG_URL = "https://danbooru.donmai.us/tags.json?search[name_comma]=";

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

$(document).ready(function () {

    searchBox = $("#search-box");
    leftColumn = $("#column-1");
    rightColumn = $("#column-2");
    moreButton = $("#more-btn");
    loadingMessage = $("#loading-msg");
    fullscreenContainer = $("#fullscreen-container");
    fullscreenImage = $("#fullscreen-image");
    appContent = $("#content");

    moreButton.hide();
    fullscreenContainer.hide();

    fullscreenImage.on("click", () => {
        fullscreenContainer.hide();    
        $("body").toggleClass("content-hidden");
    });

    searchBox.on("keyup", function (event) {
        if(event.keyCode != 13) return;

        const tags = getTags($(this).val());
        lastSearch = tags;
        currentPage = 1;
        searchImages(tags, false, onFinishedSearch);
        document.activeElement.blur();
    });

    moreButton.on("click", function () {
        currentPage++;
        searchImages(lastSearch, true, onFinishedSearch);
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
        const searchValue = tags.join("%20");
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

function getTags(textboxContent) {
    return textboxContent.trim().split(",").map(x => x.trim().replace(/ /gi, "_"));
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