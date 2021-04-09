if (!process.env.production) {
	require('dotenv').config();
}

import express from 'express';
import Channel from './interfaces/Channel.interface';
import * as Firebase from './firebase/firebase';
import setUploadTimeouts from './setUploadTimeouts';
import processVideos from './videoProcessing/processVideos';
import { ScheduledTask } from 'node-cron';

const app = express();
const port = 3000;

let channels: Channel[] = [];
let tasks: ScheduledTask[] = [];
// Call refreshChannels to initialize the arrays
refreshChannels();

// Endpoit for refreshing internal channels
app.get('/refresh', async (req, res) => {
	await refreshChannels();
	res.send(`${channels.length}`);
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});

/**
 * Fetches channels from firestore and resets current scheduled tasks with new channels
 */
async function refreshChannels() {
	// Destroy all current tasks
	for (const task of tasks) task.destroy();

	// Fetch all channels from firestore and store them in memory
	channels = await Firebase.getChannels();

	// Create and store all tasks for each channel's uploadTimes
	tasks = setUploadTimeouts(channels, processVideos);
}
