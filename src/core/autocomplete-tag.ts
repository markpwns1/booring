import type TagType from "./tag-type";

/**
 * Main class representing an autocomplete tag
 */
export default class AutocompleteTag {
    /** The text displayed in the tag */
    public label: string;

    /** The tag that should be added to the search when this autocomplete suggestion is clicked */
    public value: string;

    /** The tag's type (mainly for colour) */
    public type: TagType;

    public constructor(label: string, value: string, type: TagType) {
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
    public static decompose(tag: string): { negation: string, baseTag: string } {
        tag = tag.trim();
        let negation = "";
        if(tag.startsWith("-")) {
            negation = "-";
            tag = tag.substring(1).trim();
        }
        return { negation, baseTag: tag };
    }
}