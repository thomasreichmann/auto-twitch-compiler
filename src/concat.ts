import { exec } from 'child_process';

import { normalize } from './normalize';
import { verify } from './verify';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

import { promises } from 'fs';
const fs = promises;

/**
 * Concatena todos os videos no diretorio /videos/
 * @param videosDir caminho absoluto para o diretorio para armazenar videos
 */
export async function concat(videosDir: string): Promise<void> {
	let names = await fs.readdir(videosDir);
	names = names.filter(s => s.endsWith(`.mp4`));
	// TODO: change this behabiour, if clipID contains out naturaly, it will be ignored
	names = names.filter(s => !s.match(/out/));
	// Ordena os videos pelo nome do arquivo como numero
	names.sort((a, b) => parseInt(a) - parseInt(b));
	let files = names.map(s => `${videosDir}${s}`);

	// Usamos o normalize.ts para normalizar todos os videos para a mesma bitrate (ajuda a minimizar chances de erro com o concat)
	let p = [];
	for (const file of files) {
		// Usamos o ffprobe para achar todos os videos com audio bitrate > MAX_BITRATE
		if (await verify(file)) p.push(normalize(file));
	}

	try {
		await Promise.all(p);
	} catch (err) {
		return console.error(err);
	}

	// Criamos o arquivo files.txt para o ffmpeg usar como referencia
	let s = '';
	for (const file of files) s += `file '${file}'\n`;
	let filesPath = videosDir + 'files.txt';
	await fs.writeFile(filesPath, s);

	let outFile = videosDir + 'out.mp4';

	let filer = ' -b:a 128K';

	const cmd = '"' + ffmpegPath + '" -y' + ' -f concat' + ' -safe 0' + ' -i "' + filesPath + '"' + filer + ' -c copy "' + outFile + '"';

	exec(cmd, { maxBuffer: 1024 * 5000 }, async (err, stdout, stderr) => {
		if (err) {
			console.error(`exec error: ${err}`);
			return;
		}

		// Deletamos todos os arquivos individuais
		await fs.unlink(filesPath);

		let p: Promise<void>[] = [];
		for (let file of files) p.push(fs.unlink(file));
		await Promise.all(p);

		console.log(`process complete: ${outFile}`);
	});
}
