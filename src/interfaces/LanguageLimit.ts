export interface LanguageLimit {
	/** Two-letter code para language ex:(https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) */
	code: string;
	/** Numero de clipes para baixar nessa language */
	limit: number;
	count?: number;
}
