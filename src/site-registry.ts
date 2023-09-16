import Danbooru from "./danbooru";
import Site from "./site";

function register(site: Site) {
    Site.sites.push(site);
    site.onRegistered();
}

export default function registerAll() {
    register(new Danbooru());
}