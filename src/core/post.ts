import type Site from "./site";

/**
 * The main class representing a Post
 */
export default class Post {
    /** The site that this post belongs to */
    public site: Site;

    /** This post's ID from its origin site */
    public id: string = "";

    /** True if this post requires a video player */
    public requiresVideoPlayer = false;

    /** A list of image URLs, in order of smallest to largest, to display in the frontent */
    public imageResolutions: string[] = [];

    /** The width of the post's full size image (or largest image) */
    public fullWidth: number = -1;
    /** The height of the post's full size image (or largest image) */
    public fullHeight: number = -1;

    /** The URL leading to the original post on the origin site */
    public originalPost: string = "";

    /** A set of information to display in the frontend about the post, like author, creation date, etc. */
    public properties: { [key: string]: string } = { };
    /** 
     * A set of headers and tags to display in the frontend about the post. For example, 
     * ```"Copyright": [ "genshin_impact" ],
     * "Artist": [ "da_vinci", "michaelangelo" ],```
     * etc.
     */
    public tagTypes: { [key: string]: string[]} = { };

    public constructor(site: Site) {
        this.site = site;
    }

    /**
     * Returns the post's height divided by its width
     */
    public normalisedHeight() {
        return this.fullHeight / this.fullWidth;
    }

    /**
     * Returns the post's smallest size image
     */
    public getThumbnail() {
        return this.imageResolutions[0];
    }

    /**
     * Returns the post's second smallest image
     */
    public getLargeImage() {
        return this.imageResolutions[1] || this.imageResolutions[0];
    }

    /**
     * Returns the post's largest image
     */
    public getFullSizeImage() {
        return this.imageResolutions[this.imageResolutions.length - 1];
    }
}
