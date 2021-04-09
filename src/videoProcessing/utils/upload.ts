import { google } from 'googleapis';
import { fstat } from 'node:fs';
import Channel from '../../interfaces/Channel.interface';

import fs from 'fs';
import util from 'util';

if (!process.env.production) {
	require('dotenv').config();
}

export interface VideoInfo {
	title: string;
	description: string;
	tags: string[];
}

export async function uploadVideo(channel: Channel, filePath: string, info: VideoInfo) {
	const oAuthClient = new google.auth.OAuth2({
		clientId: process.env.YT_CLIENT_ID,
		clientSecret: process.env.YT_CLIENT_SECRET,
	});
	oAuthClient.setCredentials({
		refresh_token: channel.youtubeApiKey,
	});

	let youtube = google.youtube({ version: 'v3', auth: oAuthClient });

	try {
		await youtube.videos.insert({
			part: ['snippet', 'status'],
			requestBody: {
				snippet: {
					...info,
					categoryId: '20',
					defaultLanguage: 'en',
					defaultAudioLanguage: 'en',
				},
				status: {
					privacyStatus: 'public',
				},
			},
			media: {
				body: fs.createReadStream(filePath),
			},
		});
	} catch (err) {
		console.log(err);
	}
}
