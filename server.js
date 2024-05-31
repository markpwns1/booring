// express.js boilerplate

const fetch = require('node-fetch');
const express = require('express');
const core = require("./res/core");
const fs = require('fs');
const http = require('http');
const https = require('https');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const PROXIES = {
    "generic": { },
    "gelbooru": {
        "Referrer": "https://gelbooru.com/"
    },
    "yandere": {
        "Referrer": "https://yande.re/"
    },
    "rule34": {
        "Referrer": "https://rule34.xxx/",
        "Referer": "https://rule34.xxx/",
        "Host": "rule34.xxx",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
    },
    "konachan": {
        "Referrer": "https://konachan.com/"
    },
    "zerochan": {
        "Referrer": "https://www.zerochan.net/"
    }
}

const HTML_TEMPLATE = fs.readFileSync("embed.html", "utf-8");

const postCache = { };

const stripPrefixes = (str, prefixes) => {
    for(const prefix of prefixes) {
        if(str.startsWith(prefix)) {
            str = str.substring(prefix.length);
            break;
        }
    }
    return str;
}

const lookupPost = (domain, postID, callback) => {

    const cached = postCache[domain + postID];
    if(cached) {
        console.log("Retrieved cached: " + domain + postID);
        callback(cached);
        return;
    }

    const domainInfo = core.domains[domain];

    const searchUrl = domainInfo.searchUrl.startsWith("/proxy/json/") 
        ? domainInfo.searchUrl.substring(12) 
        : domainInfo.searchUrl;

    const fetchURL = searchUrl + "id:" + postID;
    console.log("Sending GET request to " + fetchURL);

    fetch(fetchURL, { headers: {
        "User-Agent": "curl/7.83.1"
    }})
    .then(response => response.json())
    .then(json => {

        if(domainInfo.searchUnpack) json = domainInfo.searchUnpack(json);
        if(json.length == 0) {
            callback(404);
            return;
        }

        const post = json[0];
        core.mapObject(post, domainInfo.postMappings);
        if(!post.large_file_url) post.large_file_url = post.file_url;
        if(!post.large_file_url) {
            callback(500);
            return;
        }

        const preprocessor = domainInfo.postPreprocess;
        if(preprocessor) preprocessor(post);

        postCache[domain + postID] = post;

        callback(post);
    })
    .catch(err => {
        callback(500);
        console.log(err);
    });
};

const fillTemplate = (template, dict) => {
    for (const key in dict) {
        const k = "[" + key + "]";
        while(template.includes(k))
            template = template.replace(k, dict[key]);
    }
    return template;
}

app.use(express.static(__dirname + '/res'));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.get("/proxy/json/*", (req, res) => {
    const url = req.url.substring(12);
    fetch(url)
        .then(response => response.json())
        .then(json => res.json(json))
        .catch(err => {
            res.sendStatus(500);
            console.log(err)
        });
});

app.get("/proxy/:site/*", (req, res) => {
    if(!req.params.site || !(req.params.site in PROXIES)) {
        res.sendStatus(500);
        return;
    }

    const index = 8 + req.params.site.length;
    const url = req.url.substring(index);
    getData(url, res, PROXIES[req.params.site]);
});

app.get("/manifest.json", (req, res) => {
    res.sendFile(__dirname + "/manifest.json");
});

const agent = new https.Agent({  
    rejectUnauthorized: false
});

function getData(url, res, headers) {
    axios.get(url, {
        responseType: 'stream',
        headers: headers,
        httpsAgent: agent
    })
    .then((stream) => {
        res.writeHead(stream.status, stream.headers)
        stream.data.pipe(res)
    })
    .catch(err => {
        res.sendStatus(500);
        console.log(err)
    });
}

app.get("/pixiv-autocomplete/*", (req, res) => {
    const url = req.url.substring(20);
    getData(url, res, { 
        "Host": "www.pixiv.net",
        "Referrer": "https://www.pixiv.net/en/tags/%E7%94%B7%E3%81%AE%E5%AD%90%20%E5%B0%91%E5%A5%B3/artworks?s_mode=s_tag",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
        "Connection": "keep-alive",
        "Accept": "application/json",
        "x-user-id": "46414691",
    });
});

app.get("/gelbooru-img/*", (req, res) => {
    const url = req.url.substring(14);
    getData(url, res, { 
        "Referrer": "https://gelbooru.com/" 
    });
});

app.get("/yandere-img/*", (req, res) => {
    const url = req.url.substring(13);
    getData(url, res, {
        "Referrer": "https://yande.re/"
    });
});

app.get("/r34/*", (req, res) => {
    const url = req.url.substring(5);
    getData(url, res, {
        "Referrer": "https://rule34.xxx/index.php?page=tags&s=list",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0"
    });
});

app.get("/download/*", (req, res) => {
    const url = req.url.substring(10);
    getData(url, res, { });
});

app.get("/danbooru-vid/*", (req, res) => {
    const url = req.url.substring(14);
    axios.get(url, {
        responseType: 'stream',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0'
        }
    })
    .then((stream) => {
        res.writeHead(stream.status, stream.headers)
        stream.data.pipe(res)
    })
});

const DOMAIN_TO_NAME = {
    "danbooru": "Danbooru",
    "gelbooru": "Gelbooru",
    "yandere": "Yande.re",
    "rule34": "Rule 34",
}

function generateMetaProperties(table) {
    let html = "";
    for (const key in table) {
        html += `<meta property="${key}" content="${table[key]}" />`;
    }
    return html;
}

app.get("/post/:domain/:postID", (req, res) => {
    if(req.params.postID == "undefined") return;
    const domain = req.params.domain;
    // const domainName = DOMAIN_TO_NAME[domain];

    // if(!domainName) {
    //     res.sendStatus(500);
    //     return;
    // }

    lookupPost(domain, req.params.postID, post => {
        if(post == 404 || post == 500) {
            res.sendStatus(post);
            return;
        }

        post.file_ext = post.file_ext || post.file_url.substring(post.file_url.lastIndexOf(".") + 1);

        let metaProperties;
        let extra;
        const embedURL = stripPrefixes(post.large_file_url, [ 
            "/gelbooru-img/", 
            "/yandere-img/" 
        ]);

        if (post.file_ext == "webm" || post.file_ext == "mp4") {
            if(domain == "danbooru") {
                metaProperties = {
                    "og:type": "website",
                    "og:title": "Danbooru Animated Image",
                    "og:url": "https://danbooru.donmai.us/posts/" + post.id,
                    "og:image": post.preview_file_url,
                    "og:description": "NOTE: This is an ANIMATED image, click the link to view it. Danbooru video embeds on Discord are not supported.",
                };
                extra = `<meta name="theme-color" content="#0096FA" />`;
            }
            else {
                metaProperties = {
                    "og:type": "video.other",
                    "og:video": embedURL,
                    "og:video:type": "video/" + post.file_ext,
                    "og:video:secure_url": embedURL,
                    "og:video:width": post.width,
                    "og:video:height": post.height,
                };
            }
        }
        else {
            metaProperties = {
                "og:type": "image",
                "og:image": embedURL,
            };
            extra = `<meta name="twitter:card" content="summary_large_image" />`;
        }

        res.send(fillTemplate(HTML_TEMPLATE, {
            META_PROPERTIES: generateMetaProperties(metaProperties) + (extra || ""),
            REDIRECT_URL: "/?domain=" + domain + "&q=id:" + post.id
        }));
    });
});

// app.get("/post/:domain/:postID/oembed.json", (req, res) => {
//     if(req.params.postID == "undefined") return;
//     console.log("Returing oembed for " + req.params.domain + req.params.postID);
//     const domain = req.params.domain;
//     const domainName = DOMAIN_TO_NAME[domain];

//     if(!domainName) {
//         res.sendStatus(500);
//         return;
//     }

//     lookupPost(domain, req.params.postID, post => {
//         if(post == 404 || post == 500) {
//             res.sendStatus(post);
//             return;
//         }

//         const postURL = core.domains[domain].postPrefix + post.id;
//         res.json({
//             "provider_name": postURL,
//             "provider_url": postURL,
//             "author_name": "Download Full-size Image",
//             "author_url": post.file_url
//         });
//     });
// });


app.listen(port, () => console.log(`Booring server listening on port ${port}!`));
