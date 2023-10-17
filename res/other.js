(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./frontend"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.coolfunc = void 0;
    var frontend_1 = require("./frontend");
    function coolfunc() {
        console.log(frontend_1.Frontend.key);
    }
    exports.coolfunc = coolfunc;
});
