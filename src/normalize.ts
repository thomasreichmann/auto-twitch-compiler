import { exec } from 'child_process';
import { promises } from 'fs';
const fs = promises;

// export async function normalize(files: string[]) {
// 	for (const file of files) {
// 	}
// }

exec(`ffmpeg -i ${__dirname}\\videos\\corruptor.mp4 -b:a 125K outn.mp4`, (err, stdout, stderr) => {
	if (err) {
		console.error(`exec error: ${err}`);
		return;
	}

	console.log(`process complete`);
});
