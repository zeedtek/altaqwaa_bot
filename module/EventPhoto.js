import fs from 'fs-extra';
import path from 'path';
import database_telegram from './database_telegram.js';
import error_handling from './error_handling.js';
import { scan } from './FilterNsfw.js';
import getBotPermissions from './getBotPermissions.js';
import { message } from 'telegraf/filters';

export default async function EventPhoto(client) {
    client.on(message('photo'), async (ctx) => {
        const __dirname = path.resolve();
        const configPath = path.join(__dirname, './config.json');
        const config = await fs.readJson(configPath).catch(() => ({}));

        const { from, chat, message: msg } = ctx;
        const { id: id_from } = from || {};
        const { id: id_chat, username: username_chat, type } = chat || {};
        const name_chat = chat?.first_name || chat?.last_name || chat?.title;
        const { message_id, caption, photo } = msg || {};
        const ImagesItem = photo?.length - 1;
        const selectedPhoto = photo?.[ImagesItem ? ImagesItem : 0];

        if (type !== 'supergroup') {
            return;
        }

        const fileId = selectedPhoto?.file_id;
        const getFileLink = await ctx.telegram.getFileLink(fileId);

        const options = {
            version: config?.version,
            model_v2: config?.model_v2,
            model_v3: config?.model_v3,
            neutralDrawingThreshold: config?.neutralDrawingThreshold,
            pornSexyThreshold: config?.pornSexyThreshold,
        };
        try {

            const nsfw = await scan(getFileLink?.href, options).catch(async (error) => {
                await error_handling(error, client);
            });

            const filteredData = nsfw?.result?.map((item) => ({
                className: item?.className,
                probability: item?.probability,
                message: `الفئة: ${item?.classNameAr}، النسبة: ${item?.probability}`,
            }));

            if (nsfw?.sharing === false) {
                const permissions = await getBotPermissions(client, id_chat, type);
                let message = "تنبيه: يُشتبه في أن هذه الرسالة تحتوي على محتوى جنسي أو إباحي أو أشياء مخلة بالأدب. وفقًا لتعاليم الإسلامية نحن نحثك على تجنب مشاركة مثل هذه الرسالة وحذفها فورًا. نسأل الله أن يهدينا جميعًا إلى الخير والاستقامة. \n\n";
                message += `❁ <b>تحليل الصورة</b> \n\n`;
                filteredData?.forEach((data) => {
                    message += `▪️ ${data?.message}\n`;
                });

                // await ctx.reply(message, { parse_mode: 'HTML', reply_to_message_id: message_id });

                if (permissions?.candDeleteMessages) {
                    await ctx.deleteMessage(message_id);
                }

                console.log(`تشير هذه الصورة إلى وجود محتوى جنسي أو إباحي أو يخل بالآداب\nUrl: ${getFileLink?.href}\nUserName: ${username_chat ? `@${username_chat}`: name_chat}`);
            }
        } catch (error) {
            // Retry the processing here
        }

        await database_telegram(
            {
                id: id_chat,
                username: username_chat,
                name: name_chat,
                type: type,
                message_id: message_id,
            },
            client
        );
    });
}