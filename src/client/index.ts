
import Frontend from "./frontend";
import registerAll from "@booring/site-registry";

registerAll();

$(Frontend.main.bind(Frontend));