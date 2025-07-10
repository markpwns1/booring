import type AutocompleteTag from "@booring/autocomplete-tag";
import Post from "@booring/post";
import Site from "@booring/site";
import { proxify } from "@booring/util";

export default class Frontend {

    private static posts: Post[] = [];
    private static openedPost?: Post;

    private static searchTags: string[] = [];
    private static lastSearch?: {
        tags: string[];
        page: number;
        safeSearch: boolean;
        site: Site;
    };

    private static cachedImage?: HTMLImageElement;

    private static currentPage = 0;
    private static currentPost = -1;
    private static selectedAutocompleteTag = -1;

    private static searchViewOpen = false;
    private static suppressAutocomplete = false;

    private static leftColumnHeight = 0;
    private static rightColumnHeight = 0;
    private static safeSearchEnabled = true;

    private static $viewSearch: JQuery<HTMLElement>;
    private static $btnHeaderSearch: JQuery<HTMLElement>;
    private static $searchInput: JQuery<HTMLInputElement>;
    private static $searchTagDisplay: JQuery<HTMLElement>;
    private static $searchCurrentTags: JQuery<HTMLElement>;
    private static $btnClearTags: JQuery<HTMLElement>;
    private static $btnExitSearch: JQuery<HTMLElement>;
    private static $selectSearchSite: JQuery<HTMLSelectElement>;
    private static $btnSearch: JQuery<HTMLElement>;
    private static $searchTagHeaderNoTags: JQuery<HTMLElement>;
    private static $resultsLeftColumn: JQuery<HTMLElement>;
    private static $resultsRightColumn: JQuery<HTMLElement>;
    private static $resultsPlaceholder: JQuery<HTMLElement>;
    private static $results: JQuery<HTMLElement>;
    private static $resultsFooter: JQuery<HTMLElement>;
    private static $resultsFooterText: JQuery<HTMLElement>;
    private static $btnFooterSearch: JQuery<HTMLElement>;
    private static $btnLoadMore: JQuery<HTMLElement>;
    private static $btnCancelSearch: JQuery<HTMLElement>;
    private static $btnViewFullsize: JQuery<HTMLElement>;
    private static $btnOpenOriginalPost: JQuery<HTMLElement>;
    private static $btnCopyLink: JQuery<HTMLElement>;
    private static $btnDownload: JQuery<HTMLElement>;
    private static $btnClosePost: JQuery<HTMLElement>;

    private static $autocompleteTags: JQuery<HTMLElement>;

    private static $postPlaceholder: JQuery<HTMLElement>;
    private static $post: JQuery<HTMLElement>;
    private static $postImage: JQuery<HTMLImageElement>;
    private static $postDownscaleWarning: JQuery<HTMLElement>;
    private static $btnPrevPost: JQuery<HTMLElement>;
    private static $btnNextPost: JQuery<HTMLElement>;
    private static $postInfo: JQuery<HTMLElement>;
    private static $postPropertySite: JQuery<HTMLElement>;
    private static $postPropertyId: JQuery<HTMLElement>;
    private static $postTagTypes: JQuery<HTMLElement>;
    private static $postVideo: JQuery<HTMLVideoElement>;
    private static $paneLeft: JQuery<HTMLElement>;
    private static $paneRight: JQuery<HTMLElement>;
    private static $postInfoHeader: JQuery<HTMLElement>;
    private static $btnSafeSearch: JQuery<HTMLElement>;

    private static postTagTypes: { [key: string]: JQuery<HTMLElement> } = { };
    private static postProperties: { [key: string]: JQuery<HTMLElement> } = { };

    private static onHeaderSearchClick(event: JQuery.ClickEvent) {
        event.stopPropagation();

        if(!this.searchViewOpen) {
            this.showSearchView();
        }
        else {
            this.hideSearchView();
        }
    }

    private static closeSearchByClick(event: MouseEvent) {
        if(this.searchViewOpen && !this.$viewSearch[0].contains(event.target as Node)) {
            this.$viewSearch.hide();
            this.searchViewOpen = false;

            event.preventDefault();
        }
    }

    private static onSearchInputKeyDown(event: JQuery.KeyDownEvent) {
        if(event.key === "Enter") {
            if(this.$searchInput.val() === "") {
                this.search();
                return;
            }
            else if(this.selectedAutocompleteTag > -1) {
                const children = this.$autocompleteTags.children();
                const $tag = children.eq(this.selectedAutocompleteTag);
                $tag.trigger("click");
            } 
            else {
                this.suppressAutocomplete = true;

                const tag = this.$searchInput.val() as string;
                this.addSearchTag(tag);
                this.$searchInput.val("");
                this.$autocompleteTags.empty();
                this.$autocompleteTags.hide();
            }
        }
        else if(event.key == "ArrowDown") {
            event.preventDefault();
            this.selectedAutocompleteTag++;
            const children = this.$autocompleteTags.children();
            if(this.selectedAutocompleteTag >= children.length) {
                this.selectedAutocompleteTag = 0;
            }
            this.selectAutocompleteTag(this.selectedAutocompleteTag);
        }
        else if(event.key == "ArrowUp") {
            event.preventDefault();
            this.selectedAutocompleteTag--;
            if(this.selectedAutocompleteTag < 0) {
                this.selectedAutocompleteTag = this.$autocompleteTags.children().length - 1;
            }
            this.selectAutocompleteTag(this.selectedAutocompleteTag);
        }
        else if(event.key == "Escape") {
            if(this.selectedAutocompleteTag > -1) {
                this.unselectAutocompleteTags();
            }
            else {
                this.hideSearchView();
            }
        }
    }

    private static onSearchInputChange() {
        if(this.suppressAutocomplete) {
            this.suppressAutocomplete = false;
            return;
        }

        if(!Site.current.autocompleteEnabled) {
            this.$autocompleteTags.hide();
            return;
        }

        Site.current.autocomplete(this.$searchInput.val() as string, tags => {
            this.updateAutocompleteTags(tags);
        }, () => { }, error => {
            console.error(error);   
        });
    }

    private static onSearchCancelClick(event: JQuery.ClickEvent) {
        event.stopPropagation();

        this.$resultsFooterText.text("Currently showing " + this.posts.length + " images.\n\nNote that due to technical limitations, if you click \"Show more...\", you will get some repeat posts.");
        this.$btnFooterSearch.hide();
        this.$btnLoadMore.show();
        this.$btnCancelSearch.hide();

        Site.current.abortSearch();
    }

    public static onNextPostClick(event?: JQuery.Event) {
        event?.stopPropagation();
        if(this.currentPost < this.posts.length - 1) {
            this.openPost(this.posts[++this.currentPost], () => {
                if(this.currentPost < this.posts.length - 1) {
                    this.preloadImage(this.posts[this.currentPost + 1].getLargeImage(), img => {
                        this.cachedImage = img;
                    });
                }
            });
        }
        this.$btnNextPost.trigger("blur");
    }

    public static onPrevPostClick(event?: JQuery.Event) {
        event?.stopPropagation();
        if(this.currentPost > 0) {
            this.openPost(this.posts[--this.currentPost], () => {
                if(this.currentPost > 0) {
                    this.preloadImage(this.posts[this.currentPost - 1].getLargeImage(), img => {
                        this.cachedImage = img;
                    });
                }
            });
        }
        this.$btnPrevPost.trigger("blur");
    }

    public static onWindowKeyDown(event: JQuery.KeyDownEvent) {
        if(this.openedPost) {
            if(event.key === "ArrowRight") {
                this.onNextPostClick();
            }
            else if(event.key === "ArrowLeft") {
                this.onPrevPostClick();
            }
        }
    }

    private static onCopyButtonPressed(event: JQuery.ClickEvent) {
        event.stopPropagation();

        const url = `${window.location.origin}/post/${this.openedPost!.site.id}/${this.openedPost!.id}`;

        const textArea = document.createElement("textarea");
          
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
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        
        document.body.removeChild(textArea);
        
        this.$btnCopyLink.text("Copied!");
        setTimeout(() => {
            this.$btnCopyLink.text("Copy link");
        }, 2000);

        this.$btnCopyLink.trigger("blur");
    }

    private static onDownloadButtonPressed(event: JQuery.ClickEvent) {
        event.stopPropagation();

        const url = proxify(Site.current.id, this.openedPost!.getFullSizeImage());
        const fileExtension = url.split(".").pop();
        const filename = `${this.openedPost!.site.id}-${this.openedPost!.id}.${fileExtension}`;
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        this.$btnDownload.trigger("blur");
    }

    private static onClosePostClick(event: JQuery.ClickEvent) {
        event.stopPropagation();

        this.$postPlaceholder.show();
        this.$post.hide();

        this.$postVideo.trigger("pause");
        this.$postVideo.attr("src", "");
        this.$postVideo.attr("poster", "");
        this.$postImage.attr("src", "");
        this.$postDownscaleWarning.hide();

        if(window.innerWidth < 1000) {
            this.$paneLeft.show();
            this.$paneRight.hide();
        }

        this.openedPost = undefined;
    }

    private static onWindowResize() {
        if(!this.openedPost && window.innerWidth < 1000) {
            this.$paneRight.hide();
        }
    }

    private static arraySetEquals<T>(a: T[], b: T[]) {
        if(a === undefined || b === undefined) return false;
        if(a === b) return true;
        if(a.length !== b.length) return false;
        
        for(const item of a) {
            if(!b.includes(item)) return false;
        }

        for(const item of b) {
            if(!a.includes(item)) return false;
        }

        return true;
    }

    public static preloadImage(file: string, onComplete: (x: HTMLImageElement) => void) {
        const img = new Image();
        img.onload = onComplete.bind(this, img);
        img.src = file;
    }

    public static search(additive = false) {
        if(!additive 
            && this.lastSearch 
            && Site.current == this.lastSearch.site
            && this.arraySetEquals(this.searchTags, this.lastSearch.tags) 
            && this.currentPage == this.lastSearch.page
            && this.safeSearchEnabled == this.lastSearch.safeSearch
        ) {
            console.log("Same search. Cancelling.");
            return;
        }

        console.log("Searching: " + this.searchTags.join(", "));

        // Set URL to reflect search
        window.history.replaceState({}, "", `?${this.safeSearchEnabled? "" : "nsfw=true&"}site=${Site.current.id}&tags=${this.searchTags.join(",")}`);

        if(!additive)
            this.currentPage = 0;

        this.$resultsPlaceholder.hide();
        this.$results.show();
        this.$resultsFooter.show();
        this.$resultsFooterText.text("Loading...");
        this.$btnFooterSearch.hide();
        this.$btnLoadMore.hide();
        this.$btnCancelSearch.show();

        if(!additive)
            this.clearResults();

        let selectPost = this.searchTags.some(x => x.startsWith("id:"));

        this.lastSearch = {
            tags: [...this.searchTags],
            page: this.currentPage,
            safeSearch: this.safeSearchEnabled,
            site: Site.current
        };

        Site.current.search([ ...this.searchTags ], this.currentPage, this.safeSearchEnabled && !selectPost,
            async posts => {
                await Promise.all(posts.map(this.addPost.bind(this)));
                if(selectPost && this.posts.length > 0) {
                    this.openPost(this.posts[0]);
                    selectPost = false;
                }
            }, 
            (newPage, endOfResults) => {
                this.currentPage = newPage;
                
                if(endOfResults) {
                    this.$resultsFooterText.text("No more images found.");
                    this.$btnFooterSearch.show();
                    this.$btnLoadMore.hide();
                    this.$btnCancelSearch.hide();
                }
                else {
                    this.$resultsFooterText.text("");
                    this.$btnFooterSearch.hide();
                    this.$btnLoadMore.text("Show more...");
                    this.$btnLoadMore.show();
                    this.$btnCancelSearch.hide();
                }
            },
            error => {
                this.$resultsFooterText.html("An error occurred.<br><br>Check developer console for details");
                this.$btnFooterSearch.hide();
                this.$btnLoadMore.text("Try again...");
                this.$btnLoadMore.show();
                this.$btnCancelSearch.hide();
                console.error(error);
            }
        );

        this.hideSearchView();
    }

    public static clearResults() {
        this.$resultsLeftColumn.empty();
        this.$resultsRightColumn.empty();

        this.leftColumnHeight = 0;
        this.rightColumnHeight = 0;

        this.posts = [];
    }

    public static addPost(post: Post): Promise<void> {
        return new Promise((resolve, reject) => {
            const postImg = new Image();
            postImg.src = post.getThumbnail();
            postImg.className = "result-container";

            postImg.onload = () => {
                let container: HTMLElement = postImg;

                if (post.requiresVideoPlayer) {
                    container = document.createElement("div");

                    postImg.className = "result-thumbnail";
                    container.className = "result-container";

                    container.appendChild(postImg);

                    const playIcon = new Image();
                    playIcon.src = "./icon-video.png";
                    playIcon.className = "result-thumbnail-video-overlay";
                    playIcon.alt = "Play icon";
                    playIcon.draggable = false;
                    container.appendChild(playIcon);
                }

                container.onclick = event => {
                    event.stopPropagation();
                    this.openPost(post);
                };

                if (this.leftColumnHeight <= this.rightColumnHeight) {
                    this.$resultsLeftColumn.append(container);
                    this.leftColumnHeight += post.normalisedHeight();
                } else {
                    this.$resultsRightColumn.append(container);
                    this.rightColumnHeight += post.normalisedHeight();
                }

                this.posts.push(post);
                resolve();
            };

            postImg.onerror = reject;
        });
    }

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

    public static unselectAutocompleteTags() {
        this.selectedAutocompleteTag = -1;
        this.$autocompleteTags.children().removeClass("selected");
    }

    public static selectAutocompleteTag(index: number) {
        this.selectedAutocompleteTag = index;
        if(this.selectedAutocompleteTag < 0) return;
        const children = this.$autocompleteTags.children();
        if(this.selectedAutocompleteTag >= children.length) return;
        children.removeClass("selected");
        children.eq(this.selectedAutocompleteTag).addClass("selected");
    }

    public static updateAutocompleteTags(tags: AutocompleteTag[]) {
        this.unselectAutocompleteTags();

        if(tags.length == 0) {
            this.$autocompleteTags.hide();
            return;
        }
        else {
            this.$autocompleteTags.show();
        }

        this.$autocompleteTags.empty();
        for(const tag of tags) {
            const $tag = $(`<button class="autocomplete-tag tag-${tag.type}">${tag.label}</button>`);
            $tag.on("click touchstart", event => {
                this.suppressAutocomplete = true;

                event.stopPropagation();
                event.preventDefault();

                this.addSearchTag(tag.value);
                this.$searchInput.val("");
                this.$autocompleteTags.empty();
                this.$autocompleteTags.hide();
            });
            this.$autocompleteTags.append($tag);
        }
    }

    public static showSearchView() {
        this.$viewSearch.show();
        this.searchViewOpen = true;

        this.$searchInput.trigger("focus");
    }

    public static hideSearchView() {
        this.$viewSearch.hide();
        this.searchViewOpen = false;

        this.$searchInput.val("");
        this.$autocompleteTags.hide();
        this.$autocompleteTags.empty();
        this.unselectAutocompleteTags();
    }

    public static addSearchTag(tag: string) {
        tag = tag.trim();

        if(this.searchTags.includes(tag)) return;

        this.searchTags.push(tag);

        const $tag = $(`<span class="search-tag">${tag} <span class="search-tag-close">&#x2715</span></span>`);
        $tag.one("click", event => {
            event.stopPropagation();
            this.searchTags.splice(this.searchTags.indexOf(tag), 1);
            $tag.remove();

            if(this.searchTags.length === 0) {
                this.$searchTagDisplay.hide();
                this.$searchTagHeaderNoTags.show();
            }
        });

        this.$searchTagHeaderNoTags.hide();
        this.$searchCurrentTags.append($tag);
        this.$searchTagDisplay.show();
    }

    public static clearSearchTags() {
        this.searchTags = [];
        this.$searchCurrentTags.empty();
        this.$searchTagDisplay.hide();
        this.$searchTagHeaderNoTags.show();
    }

    public static setSafeSearchEnabled(enabled: boolean) {
        this.safeSearchEnabled = enabled;
        this.$btnSafeSearch.text(this.safeSearchEnabled ? "Safe Search: ON" : "Safe Search: OFF");

        const nsfwSites = this.$selectSearchSite.children(".nsfw-site");
        if(this.safeSearchEnabled) {
            nsfwSites.attr("disabled", "");
            nsfwSites.attr("hidden", "");
        }
        else {
            nsfwSites.removeAttr("disabled");
            nsfwSites.removeAttr("hidden");
        }
    }

    public static openPost(post: Post, onComplete?: () => void) {
        if(this.openedPost && this.openedPost.id === post.id) return;

        if(window.innerWidth < 1000) {
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

        if(post.requiresVideoPlayer) {
            this.$postImage.hide();
            this.$postVideo.show();
            this.$postVideo.attr("poster", post.getThumbnail());
            this.$postVideo.attr("src", post.getLargeImage());
            this.$postVideo.trigger("play");
        }
        else {
            this.$postVideo.hide();
            this.$postImage.show();

            let imageResolutionIndex = (this.cachedImage && this.cachedImage.src === post.getLargeImage()) ? 1 : 0;
            this.$postImage.attr("src", post.imageResolutions[imageResolutionIndex]);

            const postImg = this.$postImage[0];
            postImg.onload = () => {
                if(imageResolutionIndex > 0) {
                    if(onComplete) onComplete();
                }

                const scale = Math.round(postImg.height / postImg.naturalHeight * 100);
                const fullSizeScale = Math.round(postImg.naturalHeight / post.fullHeight * 100);
                if(postImg.naturalHeight < postImg.height) {
                    if(scale > 150 && imageResolutionIndex < post.imageResolutions.length - 1) {
                        imageResolutionIndex++;
                        this.$postImage.attr("src", post.imageResolutions[imageResolutionIndex]);
                    }
                }

                if(fullSizeScale < 100) {
                    this.$postDownscaleWarning.show();
                    this.$postDownscaleWarning.text(`Resized to ${fullSizeScale}% of original`);
                }
                else {
                    this.$postDownscaleWarning.hide();
                }
            };

            postImg.onerror = () => {
                this.$postImage.attr("src", post.getThumbnail());
            }
        }

        this.$postInfoHeader.text(`${post.site.name} #${post.id}`);
        
        // this.$postPropertySite.text(post.site.name);
        // this.$postPropertyId.text(post.id);

        if(!this.openedPost || this.openedPost.site !== post.site) {
            this.$postInfo.empty();
            for(const key in post.properties) {
                if(!post.properties[key]) continue;
                const $property = $(`<span class="post-property"><b>${key}</b>: ${post.properties[key]}</span>`);
                this.postProperties[key] = $property;
                this.$postInfo.append($property);
            }

            this.$postTagTypes.empty();
            for(const key in post.tagTypes) {
                const tags = post.tagTypes[key];
                if(!tags || tags.length == 0) continue;
                const $tagType = $(`<div class="post-tag-type"></div>`);
                const $header = $(`<h3 class="post-tag-type-header"><b>${key}</b></h3>`);
                $tagType.append($header);

                const $tagList = $(`<span class="post-tag-list tag-${key.toLowerCase()}">${tags.join(" ")}</span>`);
                $tagType.append($tagList);

                this.postTagTypes[key] = $tagList;
                this.$postTagTypes.append($tagType);
            }
        }
        else {
            for(const key in post.properties) {
                this.postProperties[key].html(`<b>${key}</b>: ${post.properties[key]}`);
            }

            for(const key in post.tagTypes) {
                this.postTagTypes[key].text(post.tagTypes[key].join(" "));
            }
        }

        if(this.currentPost === 0) {
            this.$btnPrevPost.addClass("invisible");
        }
        else {
            this.$btnPrevPost.removeClass("invisible");
        }

        if(this.currentPost === this.posts.length - 1) {
            this.$btnNextPost.addClass("invisible");
        }
        else {
            this.$btnNextPost.removeClass("invisible");
        }

        this.openedPost = post;
    }

    public static main() {
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

        this.$btnClearTags.on("click", event => {
            event.stopPropagation();
            this.clearSearchTags();
        });

        this.$btnExitSearch.on("click", event => {
            event.stopPropagation();
            this.hideSearchView();
        });
    
        this.$selectSearchSite.append(Site.getAll().map(site => `<option value="${site.id}" ${site.isPorn? 'class="nsfw-site"' : ""}>${site.name}</option>`).join(""));
        this.$selectSearchSite.on("change", event => {
            const site = Site.find(this.$selectSearchSite.val() as string);
            Site.current = site!;
            Site.current.onSelected();
            this.$autocompleteTags.empty();
            this.$autocompleteTags.hide();
        });

        const urlParams = new URLSearchParams(window.location.search);

        const nsfw = urlParams.has("nsfw")? urlParams.get("nsfw") === "true" : false;
        this.safeSearchEnabled = !nsfw;

        if(this.safeSearchEnabled) {
            const nsfwSites = this.$selectSearchSite.children(".nsfw-site");
            nsfwSites.attr("disabled", "");
            nsfwSites.attr("hidden", "");
        }

        Site.current = Site.getAll()[0];

        this.$btnSearch.on("click", event => {
            event.stopPropagation();
            this.search();
        });

        this.$btnLoadMore.on("click", event => {
            event.stopPropagation();
            this.currentPage++;
            this.search(true);
        });

        this.$btnViewFullsize.on("click", event => {
            event.stopPropagation();
            window.open(this.openedPost!.getFullSizeImage(), "_blank");
            this.$btnViewFullsize.trigger("blur");
        });

        this.$btnOpenOriginalPost.on("click", event => {
            event.stopPropagation();
            window.open(this.openedPost!.originalPost, "_blank");
            this.$btnOpenOriginalPost.trigger("blur");
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

        this.$postInfoHeader.on("click", event => {
            console.log(this.openedPost);
        });

        this.$btnSafeSearch.on("click", event => {
            event.stopPropagation();

            if(this.safeSearchEnabled && !confirm("Are you sure you want to disable safe search?\n\nThis will allow sensitive or pornographic content to be displayed, as well as include new sites in the site dropdown that contain such content.")) {
                return;
            }

            this.setSafeSearchEnabled(!this.safeSearchEnabled);
        });

        this.$btnSafeSearch.text(this.safeSearchEnabled ? "Safe Search: ON" : "Safe Search: OFF");
        
        if(urlParams.has("domain") || urlParams.has("site")) {
            const siteId = (urlParams.get("domain") || urlParams.get("site"))!;
            const site = Site.find(siteId);
            if(site) {
                Site.current = site;
                site.onSelected();
                this.$selectSearchSite.val(siteId);
            }
        }

        if(urlParams.has("tags") || urlParams.has("q")) {
            const tags = (urlParams.get("tags") || urlParams.get("q"))!.split(",").map(tag => tag.trim());
            if(tags.length == 1 && tags[0] == "landscape") tags.push("no_humans");
            for(const tag of tags) {
                if(tag.trim() !== "") this.addSearchTag(tag);
            }
            this.search();
        }

        console.log("Frontend ready!");
    }
}