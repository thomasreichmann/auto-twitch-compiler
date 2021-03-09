import { exec } from 'child_process';

import { normalize } from './normalize';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

import util from 'util';
const awaitExec = util.promisify(exec);

import { promises } from 'fs';
import { Video } from 'twitch/lib';
const fs = promises;

let videosFolder = '\\videos\\';

// Consts
const MAX_AUDIO_BITRATE = 135000;
const MIN_AUDIO_BITRATE = 120000;
const CORRECT_SAMPLE_RATE = 48000;

(async () => {
	let names = await fs.readdir(__dirname + videosFolder);
	names = names.filter(s => s.endsWith(`.mp4`));
	// TODO: change this behabiour, if clipID contains out naturaly, it will be ignored
	names = names.filter(s => !s.match(/out/));
	let files = names.map(s => `${__dirname}${videosFolder}${s}`);

	// Usamos o normalize.ts para normalizar todos os videos para a mesma bitrate (ajuda a minimizar chances de erro com o concat)
	let p = [];
	for (const file of files) {
		// Usamos o ffprobe para achar todos os videos com audio bitrate > MAX_BITRATE
		if (await shouldBeNormalized(file)) p.push(normalize(file));
	}

	try {
		await Promise.all(p);
	} catch (err) {
		return console.error(err);
	}

	// Criamos o arquivo files.txt para o ffmpeg usar como referencia
	let s = '';
	for (const file of files) s += `file '${file}'\n`;
	let filesPath = __dirname + videosFolder + 'files.txt';
	await fs.writeFile(filesPath, s);

	let outFile = __dirname + videosFolder + 'out.mp4';

	let filer = ' -b:a 128K';

	const cmd = '"' + ffmpegPath + '" -y' + ' -f concat' + ' -safe 0' + ' -i "' + filesPath + '"' + filer + ' -c copy "' + outFile + '"';

	exec(cmd, { maxBuffer: 1024 * 5000 }, (err, stdout, stderr) => {
		if (err) {
			console.error(`exec error: ${err}`);
			return;
		}

		console.log(`process complete: ${outFile}`);
	});
})();

async function shouldBeNormalized(file: string): Promise<boolean> {
	const audioBitRate = await getAudioBitrate(file);
	if (audioBitRate > MAX_AUDIO_BITRATE || audioBitRate < MIN_AUDIO_BITRATE) return true;

	const audioSampleRate = await getAudioSampleRate(file);
	if (audioSampleRate != CORRECT_SAMPLE_RATE) return true;

	// TODO: consider the possibility of clips being at 30fps, witch does not need to be converted
	const framesPerSecond = await getVideoFramesPerSecond(file);
	if (Math.abs(framesPerSecond - 60) >= 0.06) return true;

	// Nao sei porque nao me pergunta o que eh tbn so sei que se nao for isso o video precisa ser convertido mesmo se tiver tudo certo
	const tbn = await getVideoTimeBase(file);
	if (tbn != 1 / 15360) return true;

	return false;
}

async function getAudioSampleRate(file: string): Promise<number> {
	const cmd = `ffprobe -loglevel error -select_streams a -show_entries stream=sample_rate -of default=noprint_wrappers=1:nokey=1 ${file}`;
	const { stdout, stderr } = await awaitExec(cmd);

	return parseInt(stdout);
}

async function getAudioBitrate(file: string): Promise<number> {
	const cmd = `ffprobe -v 0 -select_streams a:0 -show_entries stream=bit_rate -of compact=p=0:nk=1 ${file}`;
	const { stdout, stderr } = await awaitExec(cmd);
	// Do error checking

	return parseInt(stdout);
}

async function getVideoFramesPerSecond(file: string): Promise<number> {
	const cmd = `ffprobe -v error -select_streams v -of default=noprint_wrappers=1:nokey=1 -show_entries stream=r_frame_rate ${file}`;
	const { stdout, stderr } = await awaitExec(cmd);

	// Valores desse ffprobe voltam como 60/1; eval pode talvez com pouca chance ser problematico
	return eval(stdout);
}

async function getVideoTimeBase(file: string): Promise<number> {
	const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=time_base -of default=noprint_wrappers=1:nokey=1 ${file}`;
	const { stdout, stderr } = await awaitExec(cmd);

	return eval(stdout);
}
