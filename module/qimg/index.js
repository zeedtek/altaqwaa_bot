import fs from 'fs-extra';
import path from 'path';
import qimg from './qimg.js';

export default async function questionIMG(ctx) {

    try {

        const __dirname = path.resolve();
        const id_chat = ctx?.chat?.id;
        const username_from = ctx?.from?.username;
        const type = ctx?.chat?.type;
        const body = ctx?.message.text;
        const message_id = ctx?.message?.message_id;

        if (body === "rn0x" && type !== "group" & type !== "supergroup") {

            const Qimg = await qimg();

            if (Qimg) {

                let message = `<b>#${Qimg?.category?.split(" ")?.join("_")} | #${Qimg?.topic?.split(" ")?.join("_")}</b>\n\n\n`;
                message += `<b>${Qimg.question}</b>\n\n`;
                message += Qimg.answers.map((answer, index) => `${index + 1} - ${answer.answer}`).join("\n");
                message += `\n\n\n الإجابة الصحيحة \n`;
                message += `<b>${Qimg.correctAnswer.answer}</b>`;

                await ctx.reply(message, { parse_mode: 'HTML' });
                // await ctx.replyWithPhoto({ source: Qimg?.buffer.IMG1 });
                // await ctx.replyWithPhoto({ source: Qimg?.buffer.IMG2 });

                await ctx.replyWithDocument({ source: Qimg?.buffer.IMG1, filename: `${Qimg.question?.split(" ")?.join("_")}.jpeg` });
                await ctx.replyWithDocument({ source: Qimg?.buffer.IMG2, filename: `${Qimg.correctAnswer.answer?.split(" ")?.join("_")}.jpeg` });
                const filename = `${Qimg.question?.split(" ")?.join("_")}.mp3`;
                await ctx.replyWithAudio({ source: path.join(__dirname, Qimg?.questionAudio), filename: filename }, {
                    parse_mode: 'HTML',
                    caption: `<b>${Qimg.question}</b>`,
                });

                await ctx.replyWithAudio({ source: path.join(__dirname, Qimg?.correctAnswer.audio), filename: `${Qimg.correctAnswer.answer}.mp3` }, {
                    parse_mode: 'HTML',
                    caption: `<b>${Qimg.correctAnswer.answer}</b>`,
                });
            }
        }
    } catch (error) {
        console.error(error);
    }

}