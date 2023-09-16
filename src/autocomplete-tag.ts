import type TagType from "./tag-type";

export default class AutocompleteTag {
    public value: string;
    public count?: number;
    public type: TagType;
}