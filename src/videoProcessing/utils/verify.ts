import { exec } from 'child_process';
import util from 'util';
const awaitExec = util.promisify(exec);

// Consts
const MAX_AUDIO_BITRATE = 135000;
const MIN_AUDIO_BITRATE = 120000;
const CORRECT_SAMPLE_RATE = 48000;

// TODO: this applies to all instances of ffmpeg usage
// i should look into importing ffmpeg in a way that doesn't require it to be installed on the machine
// so that only a npm i is enougth to run the project

/**
 * Funcao retorna true caso o arquivo precise ser padronizado
 * @param file caminho absoluto do arquivo
 * @returns true se o arquivo precisa ser padronizado
 */
export async function verify(file: string): Promise<boolean> {
	const audioBitRate = await getAudioBitrate(file);
	if (audioBitRate > MAX_AUDIO_BITRATE || audioBitRate < MIN_AUDIO_BITRATE) return true;

	const audioSampleRate = await getAudioSampleRate(file);
	if (audioSampleRate != CORRECT_SAMPLE_RATE) return true;

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

/**
 * @param file caminho absoluto para o arquivo
 * @returns Duracao do video em segundos com decimal
 */
export async function getVideoDuration(file: string): Promise<number> {
	// -show_entries format=duration -v quiet -of csv="p=0"
	const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${file}`;

	const { stdout, stderr } = await awaitExec(cmd);
	if (stderr) console.log(stderr);

	return parseFloat(stdout);
}
