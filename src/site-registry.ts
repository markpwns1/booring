import Danbooru from "./sites/danbooru";
import Gelbooru from "./sites/gelbooru";
import Yandere from "./sites/yandere";
import Safebooru from "./sites/safebooru";
import Rule34 from "./sites/rule34";
import Konachan from "./sites/konachan";
import Zerochan from "./sites/zerochan";
import Site from "./site";

function register(site: Site) {
    Site.sites.push(site);
    site.onRegistered();
}

export default function registerAll() {
    register(new Danbooru());
    register(Gelbooru);
    register(Yandere);
    register(Safebooru);
    register(Konachan);
    register(Zerochan);
    register(Rule34);
}