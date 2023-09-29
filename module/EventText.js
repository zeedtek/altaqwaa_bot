import fs from 'fs-extra';
import path from 'path';
import database_telegram from './database_telegram.js';
import handleScheduledMessages from './handleScheduledMessages.js';
import { message } from 'telegraf/filters';
import checkForBadWords from './checkForBadWords.js';
import getBotPermissions from './getBotPermissions.js';

export default async function EventText(client) {

    client.on(message("text"), async (ctx) => {

        let __dirname = path.resolve();
        let id_from = ctx?.from?.id;
        let id_chat = ctx?.chat?.id;
        let username_from = ctx?.from?.username;
        let username_chat = ctx?.chat?.username;
        let name_from = ctx?.from?.first_name ? ctx?.from?.first_name : ctx?.from?.last_name ? ctx?.from?.last_name : undefined;
        let name_chat = ctx?.chat?.first_name ? ctx?.chat?.first_name : ctx?.chat?.last_name ? ctx?.chat?.last_name : ctx?.chat?.title;
        let type = ctx?.chat?.type;
        let message_id = ctx?.message?.message_id;
        let body = ctx?.message?.text;
        let foundBadWords = checkForBadWords(body);

        await database_telegram({
            id: id_chat,
            username: username_chat,
            name: name_chat,
            type: type,
            message_id: message_id
        }, client);

        // تفعيل البوت او ايقاف التفعيل 
        await handleScheduledMessages(ctx);

        // تحقق من وجود كلمات سيئة
        if (foundBadWords?.check) {

            let db_user = fs.existsSync(path?.join(__dirname, `./database/${id_chat}.json`)) ?
                fs.readJsonSync(path.join(__dirname, `./database/${id_chat}.json`)) : {};
            let permissions = Object.keys(db_user?.permissions || {})?.length !== 0 ?
                db_user?.permissions : await getBotPermissions(client, id_chat, type);
            let message = `${foundBadWords?.message}\n\n`;
            message += `▪️ العضو: ${username_from ? `@${username_from}` : name_from}\n`
            message += `▪️ معرف العضو: ${id_from}\n`
            message += `▪️ معرف الرسالة: ${message_id}`

            await ctx.reply(message, {
                reply_to_message_id: message_id
            });

            if (permissions?.candDeleteMessages || type === "member") {
                await ctx.deleteMessage();
            }
        }

    });
}