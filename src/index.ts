if (!process.env.production) {
	require('dotenv').config();
}

import { Readable } from 'stream';

import * as fs from 'fs';
let fetch = require('node-fetch');
import { ApiClient } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

// Nao funciona por erro no nome da categoria

(async () => {
	try {
		// Clear all files from \videos\

		fs.rmdirSync(__dirname + '\\videos\\', { recursive: true });
		fs.mkdirSync(__dirname + '\\videos\\');

		// let categories = await apiClient.helix.search.searchCategories('league of legends');

		// for (let game of categories.data) {
		// 	console.log(game.name, game.id);
		// }
		let clips = await apiClient.helix.clips.getClipsForGame('21779', {
			limit: 55,
			startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		});

		console.log(clips.data.length);

		for (let clip of clips.data) {
			if (clip.language.match(/en/)) {
				console.log(clip.creationDate, clip.language, clip.title, clip.broadcasterDisplayName, clip.url);

				let url = clip.thumbnailUrl.split('-preview-')[0] + '.mp4';

				console.log(url);

				let response = await fetch(url);
				let buffer = await response.buffer();

				fs.writeFileSync(__dirname + '\\videos\\' + clip.id + '.mp4', buffer);
			}
		}
	} catch (e) {
		console.error(e);
	}
})();
