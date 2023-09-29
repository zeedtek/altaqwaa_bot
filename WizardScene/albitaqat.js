import fs from 'fs-extra';
import path from 'path';
import { Scenes, Markup } from 'telegraf';

// تعريف المتغيرات
const __dirname = path.resolve();
const albitaqat = fs.readJsonSync(path.join(__dirname, './files/json/albitaqat.json'));
const but_1 = [Markup.button.callback('الرجوع للقائمة الرئيسية 🏠', 'start')];
const button = Markup.inlineKeyboard([but_1]);

export default new Scenes.WizardScene(
    'albitaqat',
    async (ctx) => {

        let message = '<b>بطاقات القرآن الكريم🏰 :</b>\n\n'
        message += 'مشروع يهدف إلى خدمة القرآن الكريم وحفظه وقرائه، عن طريق توفير نص مختصر شامل لسور القرآن، وتوفير محتواه مرئيًا ومسموعًا\n\n\n'
        message += '<b>محتويات البطاقات:</b>\n\n'
        message += 'تحتوي كل بطاقة تعريف للسورة على ثمانية عناصر موحدة، مرتبة ومُرقمة، ومكتوبة بعبارات واضحة وجُمل مختصرة، بأسلوب ميسر لتسهيل حفظها.\n\n\n'
        message += '<b>لإرسال البطاقة، قم بإرسال اسم السورة أو رقمها ✉️</b>'

        // إرسال الرسالة
        await ctx.reply(message, { parse_mode: 'HTML', reply_markup: button.reply_markup, reply_to_message_id: ctx?.message?.message_id });
        return ctx?.wizard?.next();
    },
    async (ctx) => {

        let body = ctx?.message?.text;

        if (body) {

            let albitaqatStatus = true;

            // تحويل النص إلى الصيغة الصحيحة
            body = body?.replace('سورة', '').replace('سوره', '').trim();

            // البحث عن السورة وإرسال البطاقة
            for (let item of albitaqat) {

                if (body === String(item?.id) || body === item?.surah) {

                    let message = `بطاقة سورة ${item?.surah}`

                    await ctx.replyWithPhoto(
                        {
                            url: item?.image
                        },
                        {
                            parse_mode: 'HTML',
                            caption: `${message} - صورة`
                        });

                    await ctx.replyWithAudio(
                        {
                            url: item?.audio
                        },
                        {
                            parse_mode: 'HTML',
                            caption: `${message} - صوت`
                        });

                    albitaqatStatus = false;

                }

            }

            // إذا لم يتم العثور على السورة
            if (albitaqatStatus) {

                let message = 'قم بكتابة اسم السورة أو رقمها بشكل صحيح!';
                await ctx.reply(message, { parse_mode: 'HTML', reply_markup: button.reply_markup, reply_to_message_id: ctx?.message?.message_id });

            }

            return ctx.wizard.selectStep(1);

        }

        else {
            return await ctx.scene.enter('start');
        }
    }
)