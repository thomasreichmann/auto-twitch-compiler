import Channel from './interfaces/Channel.interface';
import cron from 'node-cron';

export interface TaskPayload {
	/**
	 * Canal que originou essa task
	 */
	channel: Channel;

	/**
	 * uploadTime da task
	 */
	uploadTime: string;
}

/**
 * Funcao leva um array de canais, cria setTimeouts para cada horario de upload
 * @param channels Array contendo os canais para definir os timeouts de upload de video
 * @param upload Funcao que utiliza um canal para fazer o processamento do video, para ser atrelada ao setTimeout
 * @returns Array contendo referencia para todas as tasks criadas
 */
function setUploadTimeouts(channels: Channel[], upload: (data: TaskPayload) => any) {
	// Create an array to hold all of the tasks
	let tasks: cron.ScheduledTask[] = [];
	for (const channel of channels) {
		// Add this channel's array of tasks to the general array
		tasks = tasks.concat(
			// Go through the upload times and create a task for each one
			channel.uploadTimes.map(uploadTime => {
				// Do cron scheduling with the time provided in format HH:MM
				let [hours, minutes] = uploadTime.split(':');
				let expression = `${minutes} ${hours} * * *`;
				if (!cron.validate(expression)) throw new Error(`Invalid time for channel ${channel.id} with time ${uploadTime}`);

				return cron.schedule(expression, () => upload({ channel, uploadTime }));
			})
		);
	}
	return tasks;
}

export default setUploadTimeouts;
