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
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var axios_1 = require("axios");
var https = require("https");
var fs = require("fs");
var node_fetch_1 = require("node-fetch");
var moment = require("moment");
var site_registry_1 = require("@booring/site-registry");
var site_1 = require("@booring/site");
var app = express();
var port = process.env.PORT || 3000;
var HTML_TEMPLATE = fs.readFileSync(__dirname + "/resources/redirect.html", "utf-8");
var POST_CACHE_SIZE = 100;
var postCache = [];
var agent = new https.Agent({
    rejectUnauthorized: false
});
function log(type, msg) {
    console.log("".concat(moment().format("YYYY-MM-DD hh:mm:ss"), " [").concat(type, "] ").concat(msg));
}
function getData(url, res, headers) {
    axios_1.default.get(url, {
        responseType: 'stream',
        headers: headers,
        httpsAgent: agent
    })
        .then(function (stream) {
        res.writeHead(stream.status, stream.headers);
        stream.data.pipe(res);
    })
        .catch(function (err) {
        res.sendStatus(500);
        log("error", err);
    });
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
}
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
    log("request", req.url);
    next();
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/resources/index.html');
});
app.get("/proxy/json-for/:site/*", function (req, res) {
    var _a;
    var headers = {};
    var index = 17 + req.params.site.length;
    var url = req.url.substring(index);
    if (req.params.site != "generic") {
        var site = site_1.default.find(req.params.site || "");
        if (site) {
            headers = site.proxyHeaders;
            console.log(site.proxyEnvVariables);
            for (var variable in site.proxyEnvVariables)
                url = replaceAll(url, "%7B" + variable + "%7D", (_a = process.env[variable]) !== null && _a !== void 0 ? _a : "undefined");
        }
    }
    log("info", "QUERYING: " + url);
    (0, node_fetch_1.default)(url, { headers: headers })
        .then(function (response) { return response.json(); })
        .then(function (json) { return res.json(json); })
        .catch(function (err) {
        res.sendStatus(500);
        log("error", err);
    });
});
app.get("/proxy/json/*", function (req, res) {
    var url = req.url.substring(12);
    (0, node_fetch_1.default)(url)
        .then(function (response) { return response.json(); })
        .then(function (json) { return res.json(json); })
        .catch(function (err) {
        res.sendStatus(500);
        log("error", err);
    });
});
app.get("/proxy/:site/*", function (req, res) {
    var _a;
    var headers = {};
    var index = 8 + req.params.site.length;
    var url = req.url.substring(index);
    if (req.params.site != "generic") {
        var site = site_1.default.find(req.params.site || "");
        if (site) {
            headers = site.proxyHeaders;
            console.log(site.proxyEnvVariables);
            for (var variable in site.proxyEnvVariables)
                url = replaceAll(url, "%7B" + variable + "%7D", (_a = process.env[variable]) !== null && _a !== void 0 ? _a : "undefined");
        }
    }
    log("info", "QUERYING: " + url);
    getData(url, res, headers);
});
function fillTemplate(template, dict) {
    for (var key in dict) {
        var k = "[" + key + "]";
        while (template.includes(k))
            template = template.replace(k, dict[key]);
    }
    return template;
}
app.get("/post/:domain/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    function fetchJSON(url) {
        return (0, node_fetch_1.default)(url, { headers: site.proxyHeaders })
            .then(function (response) { return response.json(); });
    }
    var site, title, metaProperties, post, embed, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (req.params.id == "undefined")
                    return [2 /*return*/];
                site = site_1.default.find(req.params.domain || "");
                if (!site) {
                    res.sendStatus(500);
                    return [2 /*return*/];
                }
                title = site.name + " #" + req.params.id;
                metaProperties = "\n    <title>".concat(title, "</title>\n    <meta name=\"title\" content=\"").concat(title, "\" />");
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                post = postCache.find(function (x) { return x.id == req.params.id && x.site == site; });
                if (!!post) return [3 /*break*/, 3];
                return [4 /*yield*/, site.getPostByID(fetchJSON, req.params.id)];
            case 2:
                post = _b.sent();
                postCache.push(post);
                if (postCache.length > POST_CACHE_SIZE) {
                    postCache.shift();
                }
                _b.label = 3;
            case 3:
                embed = site.generateEmbed(post);
                metaProperties = embed.build();
                return [3 /*break*/, 5];
            case 4:
                _a = _b.sent();
                return [3 /*break*/, 5];
            case 5:
                res.send(fillTemplate(HTML_TEMPLATE, {
                    META_PROPERTIES: metaProperties,
                    REDIRECT_URL: "/?domain=" + site.id + "&tags=id:" + ((post === null || post === void 0 ? void 0 : post.id) || req.params.id)
                }));
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    log("info", "Booring server listening on port ".concat(port, "!"));
    (0, site_registry_1.default)();
    log("info", "Registered all sites.");
});
//# sourceMappingURL=index.js.map