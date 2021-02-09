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
apiClient.helix.clips.getClipsForGame('League of Legends');
