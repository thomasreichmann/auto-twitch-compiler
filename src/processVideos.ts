import Channel from './interfaces/Channel.interface';
import { TaskPayload } from './setUploadTimeouts';

async function processVideos(data: TaskPayload) {
	// import * as fs from 'fs';
	// import { concat } from './concat';
	// import { fetchVideos } from './fetchVideos';
	// import { LanguageLimit } from './interfaces/LanguageLimit';
	// const videosDir = __dirname + '\\videos\\';
	// // Lista contendo nome dos canais que os clipes nao devem ser incluidos
	// const blackListedChannels: string[] = [];
	// // Uma data representando qual o limite de tempo para buscar clipes
	// const maxVideoAge = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
	// const langs: LanguageLimit[] = [
	// 	{ code: 'en', limit: 10 },
	// 	{ code: 'pt', limit: 5 },
	// ];
	// (async () => {
	// 	try {
	// 		fs.rmdirSync(videosDir, { recursive: true });
	// 		fs.mkdirSync(videosDir);
	// 		await fetchVideos(videosDir, '21779', langs, maxVideoAge, blackListedChannels);
	// 		await concat(videosDir);
	// 	} catch (err) {
	// 		console.error(err);
	// 	}
	// })();
}

export default processVideos;
