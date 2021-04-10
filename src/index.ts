if (!process.env.production) {
	require('dotenv').config();
}

import * as fs from 'fs';
import { concat } from './concat';
import { fetchVideos } from './fetchVideos';
import { LanguageLimit } from './interfaces/LanguageLimit';
import { normalizeAudio } from './normalizeAudio';

const videosDir = __dirname + '\\videos\\';

// Lista contendo nome dos canais que os clipes nao devem ser incluidos
const blackListedChannels: string[] = [];

// Uma data representando qual o limite de tempo para buscar clipes
const maxVideoAge = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
const langs: LanguageLimit[] = [{ code: 'en', limit: 5 }];

(async () => {
	try {
		fs.rmdirSync(videosDir, { recursive: true });
		fs.mkdirSync(videosDir);

		await fetchVideos(videosDir, '1788326126', langs, maxVideoAge, blackListedChannels);
		let outFile = await normalizeAudio(await concat(videosDir));

		console.log(`outfile is ${outFile}`);
	} catch (err) {
		console.error(err);
	}
})();
