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
const MAX_BITRATE = 135000;

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
		const bitRate = await getAudioBitrate(file);

		console.log(bitRate);

		if (bitRate > MAX_BITRATE) p.push(normalize(file));
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

async function getAudioBitrate(file: String): Promise<number> {
	const cmd = `ffprobe -v 0 -select_streams a:0 -show_entries stream=bit_rate -of compact=p=0:nk=1 ${file}`;
	const { stdout, stderr } = await awaitExec(cmd);
	// Do error checking

	return parseInt(stdout);
}
