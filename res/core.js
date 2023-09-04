
const MONTHS = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

var DOMAINS = {
    danbooru: {
        postPrefix: "https://danbooru.donmai.us/posts/",
        searchUrl: "https://danbooru.donmai.us/posts.json?tags=",
        tagUrl: "https://danbooru.donmai.us/tags.json?search[name_comma]=",
        suggestionsUrl: "https://danbooru.donmai.us/autocomplete.json?only=name,post_count,category&limit=10&search[type]=tag_query&search[query]=",
        pageKey: "page",
        pageOffset: 0,
        isNSFW: true,
        ratingMappings: { 
            "safe": "general",
        },
        ratingsToString: {
            "g": "General",
            "s": "Sensitive",
            "q": "Questionable",
            "e": "Explicit"
        },
        postMappings: { },
        suggestionMappings: { 
            "value": "name"
        },
        tagCache: [ ],
        downloadTags: callback => {
            requestSequence([
                // top 200 artists
                "0:https://danbooru.donmai.us/tags.json?limit=200&only=name,post_count,category&search[category]=1&search[order]=count",
                // top 500 meta tags
                "1:https://danbooru.donmai.us/tags.json?limit=500&only=name,post_count,category&search[category]=5&search[order]=count",
                // top 750 copyright tags
                "2:https://danbooru.donmai.us/tags.json?limit=750&only=name,post_count,category&search[category]=3&search[order]=count",
                // get all characters with 500+ posts
                "3:https://danbooru.donmai.us/tags.json?limit=1000&only=name,post_count,category&search[category]=4&search[order]=count&search[post_count]=>2000",
                "3:https://danbooru.donmai.us/tags.json?limit=1000&only=name,post_count,category&search[category]=4&search[order]=count&search[post_count]=>1000..2000",
                "3:https://danbooru.donmai.us/tags.json?limit=1000&only=name,post_count,category&search[category]=4&search[order]=count&search[post_count]=>500..999",
                // get all general tags with 10K+ posts
                "4:https://danbooru.donmai.us/tags.json?limit=1000&only=name,post_count,category&search[category]=4&search[order]=count&search[post_count]=25000",
                "4:https://danbooru.donmai.us/tags.json?limit=1000&only=name,post_count,category&search[category]=4&search[order]=count&search[post_count]=10000..25000",
                "4:https://danbooru.donmai.us/tags.json?limit=1000&only=name,post_count,category&search[category]=4&search[order]=count&search[post_count]=5000..9999",
            ], results => {
                const interleaved = interleaveArrays(results);
                callback(interleaved);
            });
        }
    },
    gelbooru: {
        postPrefix: "https://gelbooru.com/index.php?page=post&s=view&id=",
        searchUrl: "/proxy/json/https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=",
        searchUnpack: x => x.post,
        tagUrl: undefined,
        suggestionsUrl: "/proxy/json/https://gelbooru.com/index.php?page=autocomplete2&type=tag_query&limit=10&term=",
        pageKey: "pid",
        pageOffset: -1,
        isNSFW: true,
        postPreprocess: post => {
            const parts = post.created_at.split(" ");
            const month = MONTHS.indexOf(parts[1]) + 1;
            const day = parts[2];
            const year = parts[5];
            post.created_at = year.padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + day.padStart(2, "0");
            post.large_file_url = "/gelbooru-img/" + post.large_file_url;
        },
        disableCaching: true,
        ratingMappings: { 
            "safe": "general",
            "g": "general",
            "s": "sensitive",
            "q": "questionable",
            "e": "explicit",
        },
        ratingsToString: {
            "general": "General",
            "sensitive": "Sensitive",
            "questionable": "Questionable",
            "explicit": "Explicit"
        },
        postMappings: { 
            "preview_url": "preview_file_url",
            "sample_url": "large_file_url",
            "height": "image_height",
            "width": "image_width",
            "tags": [ "tag_string", "tag_string_general" ]
        },
        suggestionMappings: { 
            "value": "name"
        },
        tagCache: [ ],
        downloadTags: undefined
    },
    yandere: {
        postPrefix: "https://yande.re/post/show/",
        searchUrl: "https://yande.re/post.json?tags=",
        tagUrl: undefined,
        // temporarily use danboory suggestions
        suggestionsUrl: "https://danbooru.donmai.us/autocomplete.json?limit=10&search[type]=tag_query&search[query]=",
        // suggestionsUrl: "https://yande.re/tag.json?limit=10&order=count&name_pattern=",
        pageKey: "page",
        pageOffset: 0,
        isNSFW: false,
        postPreprocess: post => {
            post.created_at = new Date(post.created_at).toISOString();
            post.large_file_url = "/yandere-img/" + post.large_file_url;
        },
        ratingMappings: {
            "g": "s",
            "general": "safe",
            "s": "safe",
            "sensitive": "safe",
            "q": "questionable",
            "questionable": "questionable",
            "e": "questionable",
            "explicit": "questionable",
        },
        ratingsToString: {
            "s": "Safe",
            "q": "Questionable"
        },
        postMappings: {
            "preview_url": "preview_file_url",
            "sample_url": "large_file_url",
            "jpeg_width": "image_width",
            "jpeg_height": "image_height",
            "tags": [ "tag_string", "tag_string_general" ],
        },
        // temporarily use danbooru suggestions
        suggestionMappings: {
            "type": "category"
        },
        tagCache: [ ],
        downloadTags: callback => {
            $.getJSON("https://yande.re/tag/summary.json", data => {
                const tags = data.data.split(" ").filter(x => x != "").map(x => {
                    const parts = x.split("`");
                    if(!parts[1]) console.log(x)
                    return {
                        category: parseInt(parts[0]),
                        name: parts[1].trim(),
                        post_count: -1
                    }
                });
                callback(tags);
            }).fail(() => {
                callback([]);
            });
        }
    },
    rule34: {
        postPrefix: "https://rule34.xxx/index.php?page=post&s=view&id=",
        searchUrl: "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=",
        tagUrl: undefined,
        suggestionsUrl: "/r34/https://rule34.xxx/public/autocomplete.php?q=",
        pageKey: "pid",
        pageOffset: -1,
        isNSFW: true,
        postPreprocess: post => {
            post.created_at = "Unknown";
            if(post.file_url.includes("mp4") || post.file_url.includes("webm")) {
                var uri = new URL(post.file_url);
                post.large_file_url = "/r34/https://uswebm.rule34.xxx/" + uri.pathname + "?" + post.id + "=";
            }
        },
        ratingMappings: {
            "general": "safe",
            "g": "safe",
            "s": "questionable",
            "q": "questionable",
            "e": "explicit",
        },
        ratingsToString: {
            "safe": "Safe",
            "questionable": "Questionable",
            "explicit": "Explicit"
        },
        postMappings: { 
            "preview_url": "preview_file_url",
            "sample_url": "large_file_url",
            "height": "image_height",
            "width": "image_width",
            "tags": [ "tag_string", "tag_string_general" ]
        },
        suggestionMappings: { 
            "value": "name",
            "type": "category"
        },
        tagCache: [ ],
        downloadTags: () => []
    }
}

function mapObject(obj, mappings) {
    for (const from of Object.keys(mappings)) {
        if (obj.hasOwnProperty(from)) {
            const to = mappings[from];
            if(typeof to === "string") {
                obj[to] = obj[from];
            }
            else {
                for(let i = 0; i < to.length; i++) {
                    obj[to[i]] = obj[from];
                }
            }
        }
    }
}

if(module) module.exports = {
    domains: DOMAINS,
    mapObject: mapObject
}