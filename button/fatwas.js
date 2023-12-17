import fs from 'fs-extra';
import path from 'path';
import database_telegram from '../module/database_telegram.js';
import fatwas from '../module/fatwas/index.js';


export default async (client, Markup) => {

    client.action("fatwas", async (ctx) => {

        const __dirname = path.resolve();
        const nameUser = ctx?.chat?.username ? `@${ctx?.chat?.username}` : ctx?.chat?.first_name ? ctx?.chat?.first_name : ctx?.chat?.last_name ? ctx?.chat?.last_name : ctx?.chat?.title;
        const resultFatwas = await fatwas(nameUser).catch(error => console.log(error));
        const but_1 = [Markup.button.callback('🔄', 'fatwas')];
        const but_2 = [Markup.button.callback('الرجوع للقائمة الرئيسية 🏠', 'start')];
        const button = Markup.inlineKeyboard([but_1, but_2]);
        let categories = []
        if (resultFatwas?.categories) {
            for (const item of resultFatwas?.categories) {
                categories.push(`#${item?.split(" ")?.join("_")}`)
            }
        }
        let message = '<b>فتاوى #ابن_باز رحمه الله</b>\n\n\n'
        message += `#${resultFatwas?.fatwas_title?.split(" ")?.join("_")}\n\n`
        message += `<b>س:</b> ${resultFatwas?.question}\n\n`
        message += `<b>${resultFatwas?.answer}</b>\n\n\n`
        message += categories;

        await database_telegram({
            id: ctx?.chat?.id,
            username: ctx?.chat?.username,
            name: ctx?.chat?.first_name ? ctx?.chat?.first_name : ctx?.chat?.last_name ? ctx?.chat?.last_name : ctx?.chat?.title,
            type: ctx?.chat?.type,
            message_id: ctx?.message?.message_id
        }, client);

        if (resultFatwas?.buffer) {
            if (message.length >= 1024) {
                await ctx.reply(message?.slice(0, 4095), { parse_mode: 'HTML', reply_markup: button.reply_markup });
            }
            await ctx.replyWithPhoto({ source: resultFatwas?.buffer }, {
                caption: message.length >= 1024 ? undefined : message,
                parse_mode: 'HTML',
                reply_markup: message.length >= 1024 ? undefined : button.reply_markup
            });
        }

        if (resultFatwas?.audio) {
            const filename = `${resultFatwas?.fatwas_title?.split(" ")?.join("_")}_فتوى رقم_${resultFatwas?.id}.mp3`
            await ctx.replyWithAudio({ url: resultFatwas?.audio, filename: filename }, {
                parse_mode: 'HTML',
                caption: `<b>فتاوى #ابن_باز رحمه الله</b> \n\n${resultFatwas?.title}\n\n${categories}`,
            });
        }

        if (resultFatwas?.imagePath) {
            fs.removeSync(path.join(__dirname, resultFatwas?.imagePath));
            fs.removeSync(path.join(__dirname, resultFatwas?.path));
        }

        else if (!resultFatwas?.buffer) {
            await ctx.reply(message?.slice(0, 4095), { parse_mode: 'HTML', reply_markup: button.reply_markup });
        }
    });
}