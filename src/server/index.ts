import * as express from 'express'
import axios from 'axios';
import { OutgoingHttpHeaders } from 'http';
import * as https from 'https';
import * as fs from 'fs';
import fetch from "node-fetch";
import * as moment from "moment";

import registerAll from '@booring/site-registry';
import Site from '@booring/site';
import Post from '@booring/post';

const app = express();
const port = process.env.PORT || 3000;

const HTML_TEMPLATE = fs.readFileSync(__dirname + "/resources/redirect.html", "utf-8");

const POST_CACHE_SIZE = 100;
const postCache: Post[] = [ ];

const agent = new https.Agent({  
    rejectUnauthorized: false
});

function log(type: string, msg: string) {
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [${type}] ${msg}`)
}

function getData(url: string, res: express.Response, headers: { [key: string]: string }) {
    axios.get(url, {
        responseType: 'stream',
        headers: headers,
        httpsAgent: agent
    })
    .then((stream) => {
        res.writeHead(stream.status, stream.headers as OutgoingHttpHeaders);
        stream.data.pipe(res)
    })
    .catch(err => {
        res.sendStatus(500);
        log("error", err)
    });
}

app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
    log("request", req.url);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/resources/index.html')
});

app.get("/proxy/json/*", (req, res) => {
    const url = req.url.substring(12);
    fetch(url)
        .then(response => response.json())
        .then(json => res.json(json))
        .catch(err => {
            res.sendStatus(500);
            log("error", err)
        });
});

app.get("/proxy/:site/*", (req, res) => {
    let headers: { [key: string]: string } = { };
    if(req.params.site != "generic") {
        const site = Site.find(req.params.site || "");
        if(site) headers = site.proxyHeaders;
    }

    const index = 8 + req.params.site.length;
    const url = req.url.substring(index);
    getData(url, res, headers);
});

function fillTemplate(template: string, dict: { [key: string]: string }): string {
    for (const key in dict) {
        const k = "[" + key + "]";
        while(template.includes(k))
            template = template.replace(k, dict[key]);
    }
    return template;
}

app.get("/post/:domain/:id", async (req, res) => {
    if(req.params.id == "undefined") return;

    const site = Site.find(req.params.domain || "");
    if(!site) {
        res.sendStatus(500);
        return;
    }

    function fetchJSON(url: string): Promise<any> {
        return fetch(url, { headers: site!.proxyHeaders })
            .then(response => response.json())
    }

    const title = site.name + " #" + req.params.id;
    let metaProperties = `
    <title>${title}</title>
    <meta name="title" content="${title}" />`;

    let post: Post | undefined;
    try {
        post = postCache.find(x => x.id == req.params.id && x.site == site);
        if(!post) {
            post = await site.getPostByID(fetchJSON, req.params.id);
            postCache.push(post);
            if(postCache.length > POST_CACHE_SIZE) {
                postCache.shift();
            }
        }

        const embed = site.generateEmbed(post);
        metaProperties = embed.build();
    }
    catch { }

    res.send(fillTemplate(HTML_TEMPLATE, {
        META_PROPERTIES: metaProperties,
        REDIRECT_URL: "/?domain=" + site.id + "&tags=id:" + (post?.id || req.params.id)
    }));
});

app.listen(port, () => {
    log("info", `Booring server listening on port ${port}!`);
    registerAll();
    log("info", "Registered all sites.");
});