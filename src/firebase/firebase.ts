import * as admin from 'firebase-admin';
import Channel from '../interfaces/Channel.interface';

admin.initializeApp({
	credential: admin.credential.cert(`${__dirname}/auth.json`),
});

const db = admin.firestore();

/**
 *	Fetches all channels from firestore and casts them to Channel.interface
 * @returns Array of Channels from firestore
 */
export async function getChannels(): Promise<Channel[]> {
	// DEBUG
	console.time('firestoreChannelFetch');
	console.log('Fetching channels from firestore');
	const data = await db.collection('channels').get();
	console.timeEnd('firestoreChannelFetch');
	console.log(`Fetched ${data.docs.length} channels`);

	return data.docs.map(doc => {
		let info = doc.data() as Channel;
		return {
			...info,
			id: doc.id,
		};
	});
}
