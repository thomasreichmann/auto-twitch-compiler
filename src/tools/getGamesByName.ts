if (!process.env.production) {
	require('dotenv').config();
}

import { ApiClient } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

const GAME_NAME = 'League of legends';

(async () => {
	let game = await apiClient.helix.games.getGameByName(GAME_NAME);

	console.log(game?.id, game?.name);
})();
