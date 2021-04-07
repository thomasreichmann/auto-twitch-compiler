import * as fs from 'fs';
let fetch = require('node-fetch');
import { ApiClient, HelixClip } from 'twitch';
import { ClientCredentialsAuthProvider, AuthProvider } from 'twitch-auth';
import { LanguageLimit } from './interfaces/LanguageLimit';

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);

const apiClient = new ApiClient({ authProvider });

// Consts
// TODO: rename, now that it relates to maximum clips considered not downloaded
const MAX_VIDEOS = 500;

/**
 * Faz o download dos clips mais vistos da twitch de uma categoria
 * @param videosDir caminho absoluto para o diretorio para armazenar videos
 * @param gameId twitch game id para a categoria (league = 21779)
 * @param limit limite de clipes para serem procurados
 * @param startDate data mais antiga para buscar clips em formato ISO
 */
export async function fetchVideos(
	videosDir: string,
	gameId: string,
	languageLimits: LanguageLimit[],
	startDate: string,
	blackListedChannels: string[]
) {
	let result = apiClient.helix.clips.getClipsForGamePaginated(gameId, {
		startDate,
	});

	// Inicializamos o count de todas as languages
	for (const lang of languageLimits) if (!lang.count) lang.count = 0;

	let p: Promise<void>[] = [];
	// Variavel para contar quantos clipes ja foram considerados
	let i = 0;
	for await (const clip of result) {
		// TODO: add a progress bar by videos fetched?

		for (const lang of languageLimits) {
			// Caso o canal do clip esteja na blacklist, pulamos o clip
			if (blackListedChannels.find(c => c === clip.broadcasterDisplayName)) break;

			// Checamos o clipe contra todas as languages que foram requesitadas
			// Caso ele seja uma delas, fazemos o download e saimos desse loop
			if (clip.language.match(lang.code) && lang.count! < lang.limit) {
				p.push(fetchClip(videosDir, clip, (p.length + 1).toString() + `_${clip.language}`));
				lang.count!++;

				break;
			}
		}

		// Completed so sera true depois do loop caso todas as languages tiverem chegado no numero correto
		let completed = false;
		for (const lang of languageLimits) completed = lang.count! >= lang.limit;

		// Caso chegamos no numero de clips desejado ou passamos do limite, saimos do loop
		if (completed || i > MAX_VIDEOS) break;
		i++;
	}

	await Promise.all(p);
}

async function fetchClip(videosDir: string, clip: HelixClip, fileName: string) {
	// DEBUG
	console.log(clip.creationDate, clip.language, clip.views, clip.title, clip.broadcasterDisplayName, clip.url);

	let url = clip.thumbnailUrl.split('-preview-')[0] + '.mp4';

	console.log(url);

	let response = await fetch(url);
	let buffer = await response.buffer();

	fs.writeFileSync(videosDir + fileName + '.mp4', buffer);
}
