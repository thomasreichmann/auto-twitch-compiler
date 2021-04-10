import { concat } from './utils/concat';
import { fetchVideos } from './utils/fetchVideos';
import Channel from '../interfaces/Channel.interface';
import { TaskPayload } from '../setUploadTimeouts';

import fs from 'fs';
import util from 'util';
import { uploadVideo } from './utils/upload';
import { normalizeAudio } from './utils/normalizeAudio';

const mkdir = util.promisify(fs.mkdir);
const rmdir = util.promisify(fs.rmdir);

async function processVideos(data: TaskPayload) {
	let { channel, uploadTime } = data;

	let lastUploadTime = channel.uploadTimes[getPreviousIndex(channel.uploadTimes, uploadTime) ?? 0];

	// Max video age is the time difference between curr upload time and the previous
	let timeDiff = getTimeDiff(uploadTime, lastUploadTime);
	console.log(timeDiff, timeDiff === '00:00' ? '24:00' : timeDiff);
	let maxVideoAge = new Date(Date.now() - toMs(timeDiff === '00:00' ? '24:00' : timeDiff));

	let videoFolder = __dirname + `\\${channel.id}\\`;
	// attempt to delete folder in case it is already there
	try {
		await rmdir(videoFolder, { recursive: true });
	} catch {}

	await mkdir(videoFolder);

	let [title, description, tags] = await fetchVideos(channel, videoFolder, maxVideoAge.toISOString(), []);
	let outFile = await normalizeAudio(await concat(videoFolder));

	await uploadVideo(channel, outFile, { title, description, tags: tags.split(',') });

	await rmdir(videoFolder, { recursive: true });
}

/**
 * Funcao retorna a diferenca entre dois tempos em formato HH:MM
 * @param time1 Primeiro tempo
 * @param time2 Segundo tempo
 * @returns Difference in time with format HH:MM
 */
export function getTimeDiff(time1: string, time2: string): string {
	let hours = [parseInt(time1.split(':')[0]), parseInt(time2.split(':')[0])];
	let minutes = [parseInt(time1.split(':')[1]), parseInt(time2.split(':')[1])];

	let count = 0;
	let h = hours[0];
	let m = minutes[0];
	// This whole loop just counts the minutes untill we get to time2, there is a better way to do this, just need to find it
	while (h != hours[1] || m != minutes[1]) {
		if (h >= 24) h = 0;
		if (m >= 60) {
			m = 0;
			h++;
		}
		m++;
		count++;
	}

	// Count is in minutes so convert to ms and use toHM
	return toHM(count * 60000);
}

/**
 * Funcao transforma um time em formato HH:MM para ms
 * @param time Time string in format HH:MM
 * @returns time converted to ms
 */
export function toMs(time: string): number {
	let [hours, minutes] = time.split(':');
	return parseInt(hours) * 60 * 60 * 1000 + parseInt(minutes) * 60 * 1000;
}

export function toHM(ms: number) {
	let seconds = ms / 1000;
	let hours = seconds / 3600;
	seconds = seconds % 3600;
	let minutes = seconds / 60;
	seconds = seconds % 60;
	return `${padNumber(Math.floor(hours))}:${padNumber(minutes)}`;
}

export function getPreviousIndex(arr: any[], curr: any) {
	let currIndex = arr.indexOf(curr);
	// Caso o (index - 1) seja -1, o elemento anterior sera o ultimo elemento do array
	let index = currIndex - 1 === -1 ? arr.length - 1 : currIndex - 1;
	// Caso o index termine negativo, o objeto nao faz parte do array e retornamos undefined
	return index >= 0 ? index : undefined;
}

export function padNumber(num: number): string {
	return num.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
}

export default processVideos;
