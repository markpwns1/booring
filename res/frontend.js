(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./other"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Frontend = void 0;
    var other_1 = require("./other");
    var Frontend = /** @class */ (function () {
        function Frontend() {
        }
        Frontend.closeSearchByClick = function (event) {
            if (this.searchViewOpen && !this.$viewSearch[0].contains(event.target)) {
                this.$viewSearch.hide();
                this.searchViewOpen = false;
                event.preventDefault();
            }
        };
        Frontend.main = function () {
            var _this = this;
            this.$btnHeaderSearch = $("#header-search");
            this.$viewSearch = $("#view-search");
            this.$viewSearch.hide();
            this.$btnHeaderSearch.on("click", function () {
                setTimeout(function () { return window.addEventListener("click", _this.closeSearchByClick, { once: true }); }, 50);
                _this.$viewSearch.show();
                _this.searchViewOpen = true;
            });
            console.log("Frontend ready!");
            (0, other_1.coolfunc)();
        };
        Frontend.key = "hyye";
        Frontend.searchViewOpen = false;
        return Frontend;
    }());
    exports.Frontend = Frontend;
});
