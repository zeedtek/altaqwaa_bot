import fs from 'fs-extra';
import path from 'path';
import database_telegram from './database_telegram.js';
import error_handling from './error_handling.js';
import { scan } from './FilterNsfw.js';
import getBotPermissions from './getBotPermissions.js';
import { message } from 'telegraf/filters';

export default async function EventPhoto(client) {

    client.on(message("photo"), async (ctx) => {

        let __dirname = path.resolve();
        let configPath = path.join(__dirname, './config.json');
        let config = await fs.readJson(configPath).catch(() => ({}));
        let id_from = ctx?.from?.id;
        let id_chat = ctx?.chat?.id;
        let username_chat = ctx?.chat?.username;
        let name_chat = ctx?.chat?.first_name ? ctx?.chat?.first_name : ctx?.chat?.last_name ? ctx?.chat?.last_name : ctx?.chat?.title;
        let type = ctx?.chat?.type;
        let message_id = ctx?.message?.message_id;
        let body = ctx?.message?.caption;
        let photo = ctx.message?.photo?.[0];

        if (type === "supergroup") {
            // استخراج معرّف الصورة
            let fileId = photo?.file_id;
            // استخدام دالة getFile للحصول على معلومات الملف
            let getFileLink = await ctx.telegram.getFileLink(fileId);
            let options = {
                version: config?.version,
                model_v2: config?.model_v2,
                model_v3: config?.model_v3,
                neutralDrawingThreshold: config?.neutralDrawingThreshold,
                pornSexyThreshold: config?.pornSexyThreshold,
            }
            let nsfw = await scan(getFileLink?.href, options).catch(async error => {
                await error_handling(error, client);
            });
            let filteredData = nsfw?.result?.map(item => {
                return {
                    className: item?.className,
                    probability: item?.probability,
                    message: `الفئة: ${item?.classNameAr}، النسبة: ${item?.probability}`
                };
            });

            if (nsfw?.sharing === false) {

                let Permission = await getBotPermissions(client, id_chat)
                let message = "تنبيه: يُشتبه في أن هذه الرسالة تحتوي على محتوى جنسي أو إباحي أو أشياء مخلة بالأدب. وفقًا لتعاليم الإسلامية نحن نحثك على تجنب مشاركة مثل هذه الرسالة وحذفها فورًا. نسأل الله أن يهدينا جميعًا إلى الخير والاستقامة. \n\n"
                message += `❁ <b>تحليل الصورة</b> \n\n`
                message += `▪️ ${filteredData?.[0]?.message}\n`
                message += `▪️ ${filteredData?.[1]?.message}\n`
                message += `▪️ ${filteredData?.[2]?.message}\n`
                message += `▪️ ${filteredData?.[3]?.message}\n`
                message += `▪️ ${filteredData?.[4]?.message}\n`

                // await ctx.reply(message, { parse_mode: 'HTML', reply_to_message_id: message_id });
                // await new Promise(r => setTimeout(r, 5000));

                if (Permission?.candDeleteMessages) {
                    await ctx?.deleteMessage(message_id);
                }
            }
        }


        await database_telegram({
            id: id_chat,
            username: username_chat,
            name: name_chat,
            type: type,
            message_id: message_id,
        }, client);

    });
}