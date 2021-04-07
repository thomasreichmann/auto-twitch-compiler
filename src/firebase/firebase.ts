import * as admin from 'firebase-admin';
import Channel from '../interfaces/Channel.interface';

admin.initializeApp({
	credential: admin.credential.cert(`${__dirname}\\auth.json`),
});

const db = admin.firestore();

export async function getChannels(): Promise<Channel[]> {
	const data = await db.collection('channels').get();

	return data.docs.map(doc => {
		let info = doc.data() as Channel;
		return {
			...info,
			id: doc.id,
		};
	});
}
