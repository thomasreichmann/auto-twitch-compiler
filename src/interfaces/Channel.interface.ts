interface IObjectKeys {
	[key: string]: string | number | Language[] | string[] | undefined;
}

interface Channel extends IObjectKeys {
	id: string | '';
	name: string | '';
	gameId: string | '';
	gameName: string | '';
	youtubeApiKey: string | '';
	titleTemplate: string | '';
	languages: Language[];
	uploadTimes: string[];
}

export interface Language extends IObjectKeys {
	code: string;
	ammount: number;

	count?: number;
}

export default Channel;
