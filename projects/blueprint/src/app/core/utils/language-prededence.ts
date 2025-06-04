import { RdfTypes } from "../rdf/rdf-environment";



class _BrowserLangagePrecedence {
    readonly browserLangs: string[];
    langPriorityMap = new Map<string, number>();
    constructor() {
        const browserLangs = navigator.languages || [navigator.language];
        console.log('Browser languages:', browserLangs);
        this.browserLangs = browserLangs.map(lang => lang);

        const preferredLangs = browserLangs.map(l => l.toLowerCase());



        preferredLangs.forEach((lang, i) => {
            this.langPriorityMap.set(lang, i); // full match
            const baseLang = lang.split('-')[0];
            if (!this.langPriorityMap.has(baseLang)) {
                this.langPriorityMap.set(baseLang, i + 0.5); // base match
            }
        });

        // Add priority for untagged literals (language === "")
        this.langPriorityMap.set("", Infinity); // or choose a number if you prefer
    }
}

const BrowserLangagePrecedence = new _BrowserLangagePrecedence();

export function sortLiteralsByBrowserLanguage(literals: RdfTypes.Literal[]): RdfTypes.Literal[] {
    const langPriority = BrowserLangagePrecedence.langPriorityMap;
    // Sort literals by language match
    return [...literals].sort((a, b) => {
        const langA = a.language.toLowerCase();
        const langB = b.language.toLowerCase();

        const prioA = langPriority.has(langA) ? langPriority.get(langA) : Infinity;
        const prioB = langPriority.has(langB) ? langPriority.get(langB) : Infinity;

        return prioA - prioB;
    });
}
