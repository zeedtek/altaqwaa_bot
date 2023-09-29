import fs from 'fs-extra';
import path from 'path';
import { Scenes, Markup } from 'telegraf';
import error_handling from '../module/error_handling.js';
import { scan } from '../module/FilterNsfw.js';
import getBotPermissions from '../module/getBotPermissions.js';

export default new Scenes.WizardScene(
    'filterNsfw',
    async (ctx) => {

        let data = ctx.scene.state;

        if (data?.type === "group") {
            // استخراج معرّف الصورة
            let fileId = data?.photo?.file_id;
            // استخدام دالة getFile للحصول على معلومات الملف
            let getFileLink = await ctx.telegram.getFileLink(fileId);
            let options = {
                version: data?.config?.version,
                model_v2: data?.config?.model_v2,
                model_v3: data?.config?.model_v3,
                neutralDrawingThreshold: data?.config?.neutralDrawingThreshold,
                pornSexyThreshold: data?.config?.pornSexyThreshold,
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

                await ctx.reply(message, { parse_mode: 'HTML', reply_to_message_id: data?.message_id });
                await new Promise(r => setTimeout(r, 5000));

                if (Permission?.candDeleteMessages) {
                    await ctx?.deleteMessage(data?.message_id);
                }
            }
        }

        return ctx.scene.leave();
    }
)