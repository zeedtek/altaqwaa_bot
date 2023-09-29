import fs from 'fs-extra';
import path from 'path';
import database_telegram from './database_telegram.js';

export default async function EventTextChannel(client) {

    client.on('channel_post', async (ctx) => {

        let __dirname = path.resolve();
        let id_from = ctx?.from?.id;
        let id_chat = ctx?.chat?.id;
        let username_chat = ctx?.chat?.username;
        let name_chat = ctx?.chat?.first_name ? ctx?.chat?.first_name : ctx?.chat?.last_name ? ctx?.chat?.last_name : ctx?.chat?.title;
        let type = ctx?.chat?.type;
        let message_id = ctx?.message?.message_id;
        let body = ctx?.update?.channel_post?.text;

        await database_telegram({
            id: id_chat,
            username: username_chat,
            name: name_chat,
            type: type,
            message_id: message_id,
        }, client);

    });
}