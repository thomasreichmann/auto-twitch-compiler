import child from 'child_process';
import util from 'util';
const exec = util.promisify(child.exec);

import { promises } from 'fs';
const fs = promises;

/**
 * Normaliza o audio de um video
 * @param filePath Caminho absoluto para o arquivo
 * @returns Novo caminho para o arquivo output
 */
export async function normalizeAudio(filePath: string): Promise<string> {
	let newFile = appendToFilename(filePath, '_fixed');
	const cmd = `ffmpeg -y -i ${filePath} -af loudnorm=I=-22:LRA=11:TP=-1.5 -preset ultrafast ${newFile}`;

	try {
		const { stdout, stderr } = await exec(cmd);

		await fs.unlink(filePath);
		return newFile;
	} catch (err) {
		throw err;
	}
}

function appendToFilename(filename: string, string: string): string {
	var dotIndex = filename.lastIndexOf('.');
	if (dotIndex == -1) return filename + string;
	else return filename.substring(0, dotIndex) + string + filename.substring(dotIndex);
}
