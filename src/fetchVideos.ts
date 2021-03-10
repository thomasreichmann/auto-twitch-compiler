import * as fs from 'fs';
let fetch = require('node-fetch');
import { ApiClient, HelixClip } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

/**
 * Faz o download dos clips mais vistos da twitch de uma categoria
 * @param videosDir caminho absoluto para o diretorio para armazenar videos
 * @param gameId twitch game id para a categoria (league = 21779)
 * @param limit limite de clipes para serem procurados
 * @param startDate data mais antiga para buscar clips em formato ISO
 */
export async function fetchVideos(videosDir: string, gameId: string, limit: number, startDate: string) {
	let clips = await apiClient.helix.clips.getClipsForGame(gameId, {
		limit,
		startDate,
	});

	clips.data.sort((a, b) => b.views - a.views);

	let p: Promise<void>[] = [];
	for (let i = 0; i < clips.data.length; i++) {
		const clip = clips.data[i];
		if (clip.language.match(/en/)) p.push(fetchClip(videosDir, clip, i.toString()));
	}

	console.log(p.length);

	await Promise.all(p);
}

async function fetchClip(videosDir: string, clip: HelixClip, fileName: string) {
	console.log(clip.creationDate, clip.language, clip.views, clip.title, clip.broadcasterDisplayName, clip.url);

	let url = clip.thumbnailUrl.split('-preview-')[0] + '.mp4';

	console.log(url);

	let response = await fetch(url);
	let buffer = await response.buffer();

	fs.writeFileSync(videosDir + fileName + '.mp4', buffer);
}
