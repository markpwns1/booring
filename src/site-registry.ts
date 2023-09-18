import Danbooru from "./sites/danbooru";
import Gelbooru from "./sites/gelbooru";
import Site from "./site";

function register(site: Site) {
    Site.sites.push(site);
    site.onRegistered();
}

export default function registerAll() {
    register(new Danbooru());
    register(new Gelbooru());
}