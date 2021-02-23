if (!process.env.production) {
	require('dotenv').config();
}

import { ApiClient } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

// Nao funciona por erro no nome da categoria

(async () => {
	try {
		// let categories = await apiClient.helix.search.searchCategories('league of legends');

		// for (let game of categories.data) {
		// 	console.log(game.name, game.id);
		// }
		let clips = await apiClient.helix.clips.getClipsForGame('21779', {
			limit: 50,
			startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		});

		for (let clip of clips.data) {
			if (clip.language == 'en') console.log(clip.creationDate, clip.language, clip.title, clip.broadcasterDisplayName, clip.url);
		}
	} catch (e) {
		console.error(e);
	}
})();
