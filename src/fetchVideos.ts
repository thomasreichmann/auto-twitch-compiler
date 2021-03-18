import * as fs from 'fs';
let fetch = require('node-fetch');
import { ApiClient, HelixClip } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

// Consts
const MAX_VIDEOS = 100;

/**
 * Faz o download dos clips mais vistos da twitch de uma categoria
 * @param videosDir caminho absoluto para o diretorio para armazenar videos
 * @param gameId twitch game id para a categoria (league = 21779)
 * @param limit limite de clipes para serem procurados
 * @param startDate data mais antiga para buscar clips em formato ISO
 */
export async function fetchVideos(videosDir: string, gameId: string, limit: number, startDate: string) {
	let result = apiClient.helix.clips.getClipsForGamePaginated(gameId, {
		startDate,
	});

	let p: Promise<void>[] = [];
	let i = 0;
	for await (const clip of result) {
		// TODO: add specific clip limits per language
		// TODO: add a progress bar by videos fetched?
		if (clip.language.match(/en/)) {
			p.push(fetchClip(videosDir, clip, i.toString()));
			i++;
		}

		// Caso chegamos no numero de clips desejado ou passamos do limite, saimos do loop
		if (i >= limit || i >= MAX_VIDEOS) break;
	}

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
