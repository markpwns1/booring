import type TagType from "./tag-type";

export default class AutocompleteTag {
    public label: string;
    public value: string;
    public type: TagType;

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