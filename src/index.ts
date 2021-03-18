if (!process.env.production) {
	require('dotenv').config();
}

import * as fs from 'fs';
import { concat } from './concat';
import { fetchVideos } from './fetchVideos';

const videosDir = __dirname + '\\videos\\';
// Uma data representando qual o limite de tempo para buscar clipes
const maxVideoAge = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

(async () => {
	try {
		fs.rmdirSync(videosDir, { recursive: true });
		fs.mkdirSync(videosDir);

		await fetchVideos(videosDir, '21779', 100, maxVideoAge);
		await concat(videosDir);
	} catch (err) {
		console.error(err);
	}
})();
