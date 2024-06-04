import type Site from "./site";

export default class Post {
    public site: Site;
    public id: string = "";
    public requiresVideoPlayer = false;

    public imageResolutions: string[] = [];

    public fullWidth: number = -1;
    public fullHeight: number = -1;

    public originalPost: string = "";

    public properties: { [key: string]: string } = { };
    public tagTypes: { [key: string]: string[]} = { };

    public constructor(site: Site) {
        this.site = site;
    }

    public normalisedHeight() {
        return this.fullHeight / this.fullWidth;
    }

    public getThumbnail() {
        return this.imageResolutions[0];
    }

    public getLargeImage() {
        return this.imageResolutions[1] || this.imageResolutions[0];
    }

    public getFullSizeImage() {
        return this.imageResolutions[this.imageResolutions.length - 1];
    }
}
