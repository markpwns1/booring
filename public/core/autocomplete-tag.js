"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main class representing an autocomplete tag
 */
var AutocompleteTag = /** @class */ (function () {
    function AutocompleteTag(label, value, type) {
        this.label = label;
        this.value = value;
        this.type = type;
    }
    /**
     * Given a tag string like "-mytag", splits it into its components "-" and "mytag". If there
     * is no negation, then the negation part is an empty string "".
     * @param tag The tag
     * @returns The tag split into negation and base tag
     */
    AutocompleteTag.decompose = function (tag) {
        tag = tag.trim();
        var negation = "";
        if (tag.startsWith("-")) {
            negation = "-";
            tag = tag.substring(1).trim();
        }
        return { negation: negation, baseTag: tag };
    };
    return AutocompleteTag;
}());
exports.default = AutocompleteTag;
//# sourceMappingURL=autocomplete-tag.js.map