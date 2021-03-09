if (!process.env.production) {
	require('dotenv').config();
}

import { Readable } from 'stream';

import * as fs from 'fs';
let fetch = require('node-fetch');
import { ApiClient, HelixClip } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

(async () => {
	try {
		// Clear all files from \videos\

		fs.rmdirSync(__dirname + '\\videos\\', { recursive: true });
		fs.mkdirSync(__dirname + '\\videos\\');

		let clips = await apiClient.helix.clips.getClipsForGame('21779', {
			limit: 100,
			startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		});

		console.log(clips.data.length);

		let p: Promise<void>[] = [];
		for (let clip of clips.data) {
			if (clip.language.match(/en/)) p.push(fetchClip(clip));
		}

		console.log(p.length);

		Promise.all(p);
	} catch (e) {
		console.error(e);
	}
})();

async function fetchClip(clip: HelixClip) {
	console.log(clip.creationDate, clip.language, clip.title, clip.broadcasterDisplayName, clip.url);

	let url = clip.thumbnailUrl.split('-preview-')[0] + '.mp4';

	console.log(url);

	let response = await fetch(url);
	let buffer = await response.buffer();

	fs.writeFileSync(__dirname + '\\videos\\' + clip.id + '.mp4', buffer);
}
