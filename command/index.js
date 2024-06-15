import start from './start.js';
import eid_al_adha from './eid_al_adha.js';

export default async function command(client, Markup, config) {
    try {
        await start(client, Markup);
        await eid_al_adha(client, config);
    } catch (error) {
        console.log(error);
    }
}