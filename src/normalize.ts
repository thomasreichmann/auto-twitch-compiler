import child from 'child_process';
import util from 'util';
import { promises } from 'fs';
const fs = promises;
const exec = util.promisify(child.exec);

export async function normalize(file: string) {
	// TODO: normalize audio sampling rates to 48000K using -ar lower rates than that cause corruption
	// TODO: normalize fps to 60 using -r lower or higher fps causes corruption
	// fps: 0.06 lower than 60 causes corruption, but higher doesn't
	// fps: 30.02fps does not corrupt for some reason????????? but 50.08 does?????????

	let newFile = appendToFilename(file, '_fixed');
	const cmd = `ffmpeg -y -i ${file} -b:a 127K -ar 48000 -r 60 -preset ultrafast ${newFile}`;

	try {
		const { stdout, stderr } = await exec(cmd);

		// Deletamos o arquivo antigo e mudamos o nome do novo para o do antigo
		await fs.unlink(file);
		fs.rename(newFile, file);
	} catch (err) {
		throw err;
	}
}

function appendToFilename(filename: string, string: string): string {
	var dotIndex = filename.lastIndexOf('.');
	if (dotIndex == -1) return filename + string;
	else return filename.substring(0, dotIndex) + string + filename.substring(dotIndex);
}
