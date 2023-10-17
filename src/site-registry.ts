import Danbooru from "./sites/danbooru";
import Gelbooru from "./sites/gelbooru";
import Yandere from "./sites/yandere";
import Safebooru from "./sites/safebooru";
import Site from "./site";

function register(site: Site) {
    Site.sites.push(site);
    site.onRegistered();
}

export default function registerAll() {
    register(new Danbooru());
    register(Gelbooru);
    register(new Yandere());
    register(new Safebooru());
}