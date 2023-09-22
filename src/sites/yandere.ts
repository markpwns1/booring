import Post from "../post";
import Site from "../site";
import AutocompleteTag from "../autocomplete-tag";
import TagType from "../tag-type";
import { asyncGetJSON } from "../util";

const RATINGS_TO_STRING: { [key: string]: string } = {
    "s": "Safe",
    "q": "Questionable",
    "e": "Explicit"
};

const TYPE_TO_ENUM: { [key: number]: TagType } = {
    "0": TagType.General,
    "1": TagType.Artist,

    "3": TagType.Copyright,
    "4": TagType.Character,
    "5": TagType.Circle
}

const YANDERE_VERSION = "1";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

export default class Yandere extends Site {

    public override name = "Yande.re";
    public override id = "yandere";

    public override autocompleteEnabled = false;
    public override isPorn = false;

    private activeAutocompleteRequest: NodeJS.Timeout | null = null;
    private activeSearchRequest: JQuery.jqXHR | null = null;

    // private tagsAlphabetical: { [key: string]: string[] } = {};
    private tagCache: string;

    public override async onSelected() {

        if(localStorage.getItem("yandere-version") != YANDERE_VERSION || Date.now() - parseInt(localStorage.getItem("yandere-last-update")) > 1000 * 60 * 60 * 24 * 7) {
            
            console.log("Fetching Yande.re tags from summary page");
            let response;
            try {
                response = await asyncGetJSON("https://yande.re/tag/summary.json");
            }
            catch(e) {
                console.log("Could not fetch Yande.re tags from summary page");
                console.error(e);
                return;
            }

            localStorage.setItem("yandere-version", YANDERE_VERSION);
            localStorage.setItem("yandere-last-update", Date.now().toString());
            localStorage.setItem("yandere-tags", response.data);
            console.log("Updated Yande.re tag cache");
        }
        else {
            console.log("Found Yande.re tag cache");
        }

        this.tagCache = localStorage.getItem("yandere-tags");
        this.autocompleteEnabled = true;

        // setTimeout(() => {
        //     for(const letter of ALPHABET) {
        //         this.tagsAlphabetical[letter] = [];
        //     }
        //     this.tagsAlphabetical["other"] = [];

        //     const tagCache = localStorage.getItem("yandere-tags");
        //     console.log(tagCache);

        //     let i = 0;
        //     let category = "";
        //     while(i < tagCache.length) {
        //         category = tagCache[i];
        //         i++;
        //         while(tagCache[i] == "`") {
        //             i++;

        //             if(tagCache[i] == " ") {
        //                 i++;
        //                 break;
        //             }
        //             else {
        //                 let tag = "";
        //                 while(tagCache[i] != "`") {
        //                     tag += tagCache[i];
        //                     i++;
        //                 }
        //                 const firstLetter = tag[0];
        //                 if(ALPHABET.includes(firstLetter)) {
        //                     this.tagsAlphabetical[firstLetter].push(tag + category);
        //                 }
        //                 else {
        //                     this.tagsAlphabetical["other"].push(tag + category);
        //                 }
        //             }
        //         }
        //     }

        //     // Sort every array by length
        //     for(const letter of ALPHABET) {
        //         this.tagsAlphabetical[letter].sort((a, b) => a.length - b.length);
        //     }
        //     this.tagsAlphabetical["other"].sort((a, b) => a.length - b.length);

        //     this.autocompleteEnabled = true;
        //     console.log("Loaded Yande.re tag cache");
        // }, 0);
    }

    private createTagSearchRegex(tag: string, options: { top_results_only?: boolean, global?: boolean } = {}): RegExp {
        // Split the tag by character.
        const letters: string[] = tag.split('');
      
        // We can do a few search methods:
        //
        // 1: Ordinary prefix search.
        // 2: Name search. "aaa_bbb" -> "aaa*_bbb*|bbb*_aaa*".
        // 3: Contents search; "tgm" -> "t*g*m*" -> "tagme".  The first character is still always
        // matched exactly.
        //
        // Avoid running multiple expressions.  Instead, combine these into a single one, then run
        // each part on the results to determine which type of result it is.  Always show prefix and
        // name results before contents results.
        const regexParts: string[] = [];
      
        // Allow basic word prefix matches.  "tag" matches at the beginning of any word
        // in a tag, e.g., both "tagme" and "dont_tagme".
      
        // Add the regex for ordinary prefix matches.
        let s = '(([^`]*_)?';
        letters.forEach((letter) => {
            const escapedLetter = letter.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escaping special regex characters
            s += escapedLetter;
        });
        s += ')';
        regexParts.push(s);
      
        // Allow "fir_las" to match both "first_last" and "last_first".
        if (tag.indexOf('_') !== -1) {
            const first = tag.split('_', 1)[0];
            const last = tag.slice(first.length + 1);
            const escapedFirst = first.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            const escapedLast = last.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            s = '(';
            s += '(' + escapedFirst + '[^`]*_' + escapedLast + ')';
            s += '|';
            s += '(' + escapedLast + '[^`]*_' + escapedFirst + ')';
            s += ')';
            regexParts.push(s);
        }

        // Allow "tgm" to match "tagme".  If top_results_only is set, we only want primary results,
        // so omit this match.
        if (!options.top_results_only && letters.length < 12) {
            s = '(';
            letters.forEach((letter) => {
            const escapedLetter = letter.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            s += escapedLetter;
            s += '[^`]*';
            });
            s += ')';
            regexParts.push(s);
        }
      
        // The space is included in the result, so the result tags can be matched with the
        // same regexes, for in reorder_search_results.
        //
        // (\d)+  match the alias ID                      1`
        // [^ ]*: start at the beginning of any alias     1`foo`bar`
        // ... match ...
        // [^`]*` all matches are prefix matches          1`foo`bar`tagme`
        // [^ ]*  match any remaining aliases             1`foo`bar`tagme`tag_me`
        const regexString = regexParts.join('|');
        const globalFlag = 'g';
        const finalRegexString = '(\\d+)[^ ]*`(' + regexString + ')[^`]*`[^ ]* '
        return new RegExp(finalRegexString, globalFlag);
    }

    private retrieveTagSearch(re: RegExp, source: string, options: { max_results?: number } = {}): string[] {
        const results: string[] = [];
        let maxResults = 10;
    
        if (options.max_results !== undefined) {
            maxResults = options.max_results;
        }
    
        while (results.length < maxResults) {
            const m = re.exec(source);
    
            if (!m) {
                break;
            }
    
            const tag = m[0];
    
            // Ignore this tag.  We need a better way to blackhole tags.
            if (tag.indexOf(':deletethistag:') !== -1) {
                continue;
            }
    
            if (results.indexOf(tag) === -1) {
                results.push(tag);
            }
        }
    
        return results;
    }

    private reorderSearchResults(tag: string, results: string[]): string[] {
        const re = this.createTagSearchRegex(tag, { top_results_only: true, global: false });
        const topResults: string[] = [];
        const bottomResults: string[] = [];
    
        results.forEach((result) => {
            if (re.test(result)) {
                topResults.push(result);
            } else {
                bottomResults.push(result);
            }
        });
    
        return topResults.concat(bottomResults);
    }
    

    public override abortAutocomplete(): void {
        if(this.activeAutocompleteRequest) {
            clearTimeout(this.activeAutocompleteRequest);
            this.activeAutocompleteRequest = null;
        }
    }

    public override autocomplete(tag: string, send: (posts: AutocompleteTag[]) => void, complete: () => void, error: (error: any) => void) {

        this.abortAutocomplete();

        this.activeAutocompleteRequest = setTimeout(() => {
            tag = tag.trim();
            let negation = "";
            if(tag.startsWith("-")) {
                negation = "-";
                tag = tag.substring(1);
            }

            if(tag.length == 0) {
                send([]);
                complete();
                return;
            }

            const regex = this.createTagSearchRegex(tag, { global: true });

            let results = this.retrieveTagSearch(regex, this.tagCache, { max_results: 100 });
            results = this.reorderSearchResults(tag, results);
            results = results.slice(0, 10);

            if ('sqe'.indexOf(tag) != -1)
                results.unshift('0`' + tag + '` ');

            const tags: AutocompleteTag[] = [];

            for(const match of results) {
                const m = match.match(/(\d+)`([^`]*)`(([^ ]*)`)? /);
                if (!m) {
                    console.error('Unparsable cached tag: \'' + match + '\'');
                    return;
                }
                    
                const tag = new AutocompleteTag();
                tag.value = negation + m[2];
                tag.label = tag.value;
                tag.type = TYPE_TO_ENUM[m[1]] || TagType.Other;
                tags.push(tag);
            }

            send(tags);
            complete();
        }, 333);
    }

    public override abortSearch(): void {
        if(this.activeSearchRequest) {
            this.activeSearchRequest.abort();
            this.activeSearchRequest = null;
        }
    }

    public override search(tags: string[], page: number, send: (posts: Post[]) => void, complete: (newPage: number, endOfResults: boolean) => void, error: (error: any) => void) {
        this.abortSearch();

        const url = encodeURI(`https://yande.re/post.json?page=${page + 1}&tags=${tags.join(",")}`);
        console.log("Searching Yande.re... " + url);

        this.activeSearchRequest = $.getJSON(url, json => {
            const posts: Post[] = [];

            console.log(json);

            for(const result of json) {

                const post = new Post();

                post.site = this;
                post.id = result.id.toString();

                post.imageResolutions = [ 
                    result.preview_url, 
                    `${window.location.origin}/yandere-img/${result.sample_url}`, 
                    `${window.location.origin}/yandere-img/${result.file_url}`
                ];

                post.fullWidth = result.width;
                post.fullHeight = result.height;

                post.originalPost = `https://yande.re/post/show/${result.id}`;

                post.properties = {
                    "Uploader": result.author,
                    "Date": new Date(result.created_at).toISOString().split('T')[0],
                    "Size": `${Math.round(result.file_size / 1000)} KB (${result.width}x${result.height})`,
                    "Source": result.source == "" ? "Unknown" : result.source,
                    "Rating": RATINGS_TO_STRING[result.rating],
                    "Score": result.score.toString()
                }

                post.tagTypes = {
                    "Tags": result.tags.split(" ")
                }

                posts.push(post);
            }

            console.log("Search successful");

            send(posts);
            complete(page, posts.length < 20);
        })
        .fail(error);
    }
}