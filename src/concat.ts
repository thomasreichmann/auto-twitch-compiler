import { exec } from 'child_process';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

import { promises } from 'fs';
import { Video } from 'twitch/lib';
const fs = promises;

let videosFolder = '\\videos\\';

(async () => {
	let names = await fs.readdir(__dirname + videosFolder);
	names = names.filter(s => s.endsWith(`.mp4`));
	names = names.filter(s => !s.match(/out/));
	let files = names.map(s => videosFolder + s);
	let s = '';

	for (const file of files) s += `file '${__dirname}${file}'\n`;

	let filesPath = __dirname + videosFolder + 'files.txt';
	await fs.writeFile(filesPath, s);

	let outFile = __dirname + videosFolder + 'out.mp4';

	const cmd = '"' + ffmpegPath + '" -y' + ' -f concat' + ' -safe 0' + ' -i "' + filesPath + '"' + ' -c copy "' + outFile + '"';

	exec(cmd, { maxBuffer: 1024 * 5000 }, (err, stdout, stderr) => {
		if (err) {
			console.error(`exec error: ${err}`);
			return;
		}

		console.log(`process complete: ${outFile}`);
	});
})();

// TODO: usar o ffmpeg em si na cli, algo parecido com isso https://stackoverflow.com/questions/59232712/how-to-edit-and-concatenation-video
