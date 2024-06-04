export default class Embed {
    public title: string;
    public description: string;
    public url?: string;
    public imageUrl?: string;

    public properties: { [key: string]: string } = { };
    public extra: string = "";

    public constructor(title: string, description: string) {
        this.title = title;
        this.description = description;
    }

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