import Channel from '../interfaces/Channel.interface';
import processVideos, { toMs, getPreviousIndex, toHM, getTimeDiff } from './processVideos';
import { toMS } from './utils/fetchVideos';

describe('Previous index util', () => {
	test('returns index - 1', () => {
		let testArray = ['a', 'b', 'c'];
		let element = testArray[1];
		expect(getPreviousIndex(testArray, element)).toEqual(0);
	});

	test('returns last index when index = 0', () => {
		let testArray = ['a', 'b', 'c'];
		let element = testArray[0];
		expect(getPreviousIndex(testArray, element)).toEqual(2);
	});

	test('returns undefined if element is not in array', () => {
		let testArray = ['a', 'b', 'c'];
		let element = 'd';
		expect(getPreviousIndex(testArray, element)).toEqual(undefined);
	});
});

describe('HH:MM conversion', () => {
	test('returns expected ms value', () => {
		let expected = 49020000;
		let time = '13:37';
		expect(toMs(time)).toEqual(expected);
	});

	test('returns expected HH:MM value', () => {
		let expected = '13:37';
		let time = 49020000;
		expect(toHM(time)).toEqual(expected);
	});
});

describe('MM:SS conversion', () => {
	test('returns expected MM:SS value', () => {
		let expected = '00:15';
		let time = 15118;
		expect(toMS(time)).toEqual(expected);
	});
});

test('timeDiff returns correct time', () => {
	let t1 = '23:37';
	let t2 = '03:51';

	let expected = '04:14';
	expect(getTimeDiff(t1, t2)).toEqual(expected);
});
