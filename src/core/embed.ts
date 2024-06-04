
/**
 * Main class representing an embed, as seen in Discord or Twitter
 */
export default class Embed {
    /** The title to display */
    public title: string;

    /** The description to display. Ideally this should be a list of tags */
    public description: string;

    /** The URL to the original site's page for this post */
    public url?: string;

    /** The image to display in the embed */
    public imageUrl?: string;

    /** 
     * A set of key-value pairs to include in the embed. For each entry, the following will
     * be appended: `<meta property="[key]" contents="[value]" />`
     */
    public properties: { [key: string]: string } = { };

    /** Extra HTML code for the embed, usually containing more meta properties. Use responsibly */
    public extra: string = "";

    public constructor(title: string, description: string) {
        this.title = title;
        this.description = description;
    }

    /**
     * Constructs a set of meta tags to include in a site's `<head>` to enable embeds on sites
     * like Twitter or Discord.
     * @returns The HTML code to include
     */
    public build(): string {
        return `
            <!-- Primary Meta Tags -->
            <title>${this.title}</title>
            <meta name="title" content="${this.title}" />
            <meta name="description" content="${this.description}" />

            <!-- Open Graph / Facebook -->
            <meta property="og:type" content="website" />
            ${this.url? `<meta property="og:url" content="${this.url} />` : ""}
            <meta property="og:title" content="${this.title}" />
            <meta property="og:description" content="${this.description}" />
            ${this.imageUrl? `<meta property="og:image" content="${this.imageUrl}" />` : ""}

            <!-- Twitter -->
            <meta property="twitter:card" content="summary_large_image" />
            ${this.url? `<meta property="twitter:url" content="${this.url} />` : ""}
            <meta property="twitter:title" content="${this.title}" />
            <meta property="twitter:description" content="${this.description}" />
            ${this.imageUrl? `<meta property="twitter:image" content="${this.imageUrl}" />` : ""}

            <!-- Extra -->
            <meta name="twitter:card" content="summary_large_image" />
            ${this.extra}
        `
    }
}