import * as fs from 'fs';
let fetch = require('node-fetch');
import { ApiClient, HelixClip } from 'twitch';
import { ClientCredentialsAuthProvider, AuthProvider } from 'twitch-auth';
import { Language } from '../../interfaces/Channel.interface';
import { LanguageLimit } from '../../interfaces/LanguageLimit';

import child from 'child_process';
import util from 'util';
import { getVideoDuration } from './verify';
import { toHM } from '../processVideos';
const exec = util.promisify(child.exec);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

if (!process.env.production) {
	require('dotenv').config();
}

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
 * @returns descricao para o video
 */
export async function fetchVideos(
	videosDir: string,
	gameId: string,
	languageLimits: Language[],
	startDate: string,
	blackListedChannels: string[]
): Promise<string> {
	let result = apiClient.helix.clips.getClipsForGamePaginated(gameId, {
		startDate,
	});

	languageLimits.sort((a, b) => a.ammount - b.ammount);

	// Inicializamos o count de todas as languages
	for (const lang of languageLimits) if (!lang.count) lang.count = 0;

	let p: Promise<FetchReturn>[] = [];
	// Variavel para contar quantos clipes ja foram considerados
	let i = 0;
	for await (const clip of result) {
		// TODO: add a progress bar by videos fetched?

		for (const lang of languageLimits) {
			// Caso o canal do clip esteja na blacklist, pulamos o clip
			if (blackListedChannels.find(c => c === clip.broadcasterDisplayName)) break;

			// Checamos o clipe contra todas as languages que foram requesitadas
			// Caso ele seja uma delas, fazemos o download e saimos desse loop
			if (clip.language.match(lang.code) && lang.count! < lang.ammount) {
				p.push(fetchClip(videosDir, clip, (p.length + 1).toString() + `_${clip.language}`));
				lang.count!++;

				break;
			}
		}

		// Completed so sera true depois do loop caso todas as languages tiverem chegado no numero correto
		let completed = languageLimits.every(x => x.count! >= x.ammount);

		// Caso chegamos no numero de clips desejado ou passamos do limite, saimos do loop
		if (completed || i > MAX_VIDEOS) break;
		i++;
	}

	return await createDescription(await Promise.all(p));
}

async function createDescription(data: FetchReturn[]): Promise<string> {
	let description = '► Credits:\n\n';

	// Add all of the credit links
	for (let part of data) {
		description += `${part.clip.broadcasterDisplayName}: https://www.twitch.tv/${part.clip.broadcasterDisplayName}`;
	}

	description += '\n';

	// Adds all of the timestamps to the video
	let currTime = 0;
	for (let part of data) {
		let duration = (await getVideoDuration(part.fileName)) * 1000;
		description += `${toHM(currTime)} ${part.clip.broadcasterDisplayName}`;

		currTime += duration;
	}

	return description;
}

interface FetchReturn {
	fileName: string;
	clip: HelixClip;
}

async function fetchClip(videosDir: string, clip: HelixClip, fileName: string): Promise<FetchReturn> {
	// DEBUG
	// console.log(clip.creationDate, clip.language, clip.views, clip.title, clip.broadcasterDisplayName, clip.url);

	let url = clip.thumbnailUrl.split('-preview-')[0] + '.mp4';

	// console.log(url);

	let response = await fetch(url);
	let buffer = await response.buffer();

	fs.writeFileSync(videosDir + fileName + '.mp4', buffer);

	return {
		fileName,
		clip,
	};
}
