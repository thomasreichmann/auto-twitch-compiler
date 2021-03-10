if (!process.env.production) {
	require('dotenv').config();
}

import * as fs from 'fs';
import { fetchVideos } from './fetchVideos';

(async () => {
	try {
		fs.rmdirSync(__dirname + '\\videos\\', { recursive: true });
		fs.mkdirSync(__dirname + '\\videos\\');

		await fetchVideos('21779', 100, new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString());
	} catch (err) {
		console.error(err);
	}
})();
