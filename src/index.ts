
import Frontend from "./frontend";
import registerAll from "./site-registry";

registerAll();

$(Frontend.main.bind(Frontend));