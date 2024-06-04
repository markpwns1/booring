
import Site from "./site";
import { getJsonPromise } from "./util";
import AutocompleteTag from "./autocomplete-tag";
import TagType from "./tag-type";

/**
 * A static class containing functionality for cached autocomplete styles, where the cache is of the format:
 * ```text
 * 3`firsttag`alias` 0`secondtag` 4`thirdtag` ...
 * ```
 */
export default class CachedAutocomplete {

    /**
     * Given a site and a summary URL to query a new cache from, updates the cache if necessary
     * @param site The cache 
     * @param summaryUrl 
     * @param referenceVersion 
     * @returns A promise for a string with the cache in it
     */
    public static async verifyCache(site: Site, summaryUrl: string, referenceVersion: string): Promise<string> {
        let tags: string;
        if(localStorage.getItem(site.id + "-version") != referenceVersion || Date.now() - parseInt(localStorage.getItem(site.id + "-last-update") || "0") > 1000 * 60 * 60 * 24 * 7) {
            
            console.log(`Fetching ${site.name} tags from summary page: ${summaryUrl}`);
            let response;
            try {
                response = await getJsonPromise(summaryUrl);
            }
            catch(e) {
                const msg = `Could not fetch ${site.name} (${site.id}) tags from summary page`;
                console.log(msg);
                console.error(e);
                throw new Error(msg);
            }

            localStorage.setItem(site.id + "-version", referenceVersion);
            localStorage.setItem(site.id + "-last-update", Date.now().toString());
            localStorage.setItem(site.id + "-tags", response.data);
            tags = response.data;

            console.log(`Updated ${site.name} (${site.id}) tag cache`);
        }
        else {
            console.log(`Found ${site.name} (${site.id}) tag cache`);
            tags = localStorage.getItem(site.id + "-tags")!;
        }

        return tags;
    }

    /**
     * Given a partial tag, returns a list of autocomplete tags
     * @param tag The partial tag
     * @param cachedTags The cache to grab potential tags from
     * @param tagTypeMap A map of number to TagType
     * @returns A list of autocomplete tags to autocomplete the given tag
     */
    public static complete(tag: string, cachedTags: string, tagTypeMap: { [key: string | number]: TagType }): AutocompleteTag[] {
        const { negation, baseTag } = AutocompleteTag.decompose(tag);

        if(baseTag.length == 0 || cachedTags == "") {
            return [];
        }

        const regex = this.createTagSearchRegex(baseTag, { global: true });

        let results = this.retrieveTagSearch(regex, cachedTags, { max_results: 100 });
        results = this.reorderSearchResults(baseTag, results);
        results = results.slice(0, 10);

        if ('sqe'.indexOf(baseTag) != -1)
            results.unshift('0`' + baseTag + '` ');

        const tags: AutocompleteTag[] = [];

        for(const match of results) {
            const m = match.match(/(\d+)`([^`]*)`(([^ ]*)`)? /);
            if (!m) {
                console.error('Unparsable cached tag: \'' + match + '\'');
                return [];
            }
                
            const value = negation + m[2];
            tags.push(new AutocompleteTag(value, value, tagTypeMap[m[1]] || TagType.Other));
        }

        return tags;
    }

    private static createTagSearchRegex(tag: string, options: { top_results_only?: boolean, global?: boolean } = {}): RegExp {
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

    private static retrieveTagSearch(re: RegExp, source: string, options: { max_results?: number } = {}): string[] {
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

    private static reorderSearchResults(tag: string, results: string[]): string[] {
        const re = CachedAutocomplete.createTagSearchRegex(tag, { top_results_only: true, global: false });
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
}
