import Danbooru from "./sites/danbooru";
import Gelbooru from "./sites/gelbooru";
import Yandere from "./sites/yandere";
import Safebooru from "./sites/safebooru";
import Rule34 from "./sites/rule34";
import Konachan from "./sites/konachan";
import Zerochan from "./sites/zerochan";
import Site from "./site";

/**
 * Registers all the supported sites
 */
export default function registerAll() {
    Site.register(new Danbooru());
    Site.register(Gelbooru);
    Site.register(Yandere);
    Site.register(Safebooru);
    Site.register(Konachan);
    Site.register(Zerochan);
    Site.register(Rule34);
}