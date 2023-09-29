import fs from 'fs-extra';
import path from 'path';
import moment from 'moment-hijri';
import get_database_telegram from './get_database_telegram.js';
import getFileSize from './getFileSize.js';
import tafseerMouaser from './tafseerMouaser/index.js';
import Hijri from './Hijri/index.js';
import error_handling from './error_handling.js';

export default async (client) => {
    // تنفيذ الكود بشكل متكرر كل دقيقة
    setInterval(async () => {
        // الحصول على مسار المجلد الحالي
        const __dirname = path.resolve();
        // الحصول على الوقت الحالي وتنسيقه
        const time = moment().locale('en-EN').format('LT');
        // الحصول على اليوم الحالي وتنسيقه باللغة العربية
        const today = moment().locale('ar-SA').format('dddd');
        // أوقات تنفيذ الأحداث
        const time_quran = ["2:00 PM"];
        const time_video = ["8:00 AM"];
        const time_tafseer = ["7:00 PM"];
        const time_Hijri = ["12:02 AM"];
        // الحصول على جميع المستخدمين
        const GetAllUsers = await get_database_telegram("all");

        // تنفيذ الأحداث المتعلقة بتلاوة القرآن الكريم
        if (time_quran.includes(time)) {
            // قراءة ملف JSON يحتوي على تفاصيل تلاوات القرآن
            const mp3quran = fs.readJsonSync(path.join(__dirname, './files/json/mp3quran.json'));

            for (const item of GetAllUsers) {
                if (item?.evenPost && item?.permissions?.canSendMessages || item?.type === "private") {
                    try {
                        // اختيار تفاصيل تلاوة عشوائية
                        const random = mp3quran[Math.floor(Math.random() * mp3quran.length)];
                        const mp3quranRandom = random?.audio[Math.floor(Math.random() * random?.audio.length)];
                        const FileSize = await getFileSize(mp3quranRandom?.link);
                        let message = `▪️ <b>القارئ:</b> ${random?.name} \n`;
                        message += `▪️ <b>الرواية:</b> ${random?.rewaya} \n`;
                        message += `▪️ <b>إسم السورة بالعربي:</b> ${mp3quranRandom?.name} \n`;
                        message += `▪️ <b>إسم السورة بالإنجليزي:</b> ${mp3quranRandom?.english_name} \n`;
                        message += `▪️ <b>رقم السورة:</b> ${mp3quranRandom?.id} \n`;
                        message += `▪️ <b>مكان النزول:</b> ${mp3quranRandom?.descent} | ${mp3quranRandom?.descent_english}`

                        if (FileSize.split('.')[0] >= 20 && FileSize.split(' ')[1] === 'MB') {
                            message += `\n▪️ <b>رابط ملف الصوت:</b> \n\n${mp3quranRandom?.link}`
                            await client.telegram.sendMessage(item?.id, message, {
                                parse_mode: 'HTML'
                            });
                        } else {
                            await client.telegram.sendAudio(item?.id, { url: mp3quranRandom?.link }, {
                                caption: message,
                                parse_mode: 'HTML'
                            });
                        }
                    } catch (error) {
                        await error_handling(error, client);
                    }
                }
            }
        }

        // تنفيذ الأحداث المتعلقة بمشاركة مقاطع الفيديو
        else if (time_video.includes(time)) {
            // قراءة ملف JSON يحتوي على تفاصيل مقاطع الفيديو
            const video = fs.readJsonSync(path.join(__dirname, './files/json/video.json'));

            for (const item of GetAllUsers) {
                if (item?.evenPost && item?.permissions?.canSendMessages || item?.type === "private") {
                    try {
                        // اختيار مقطع فيديو عشوائي
                        const random = video[Math.floor(Math.random() * video.length)];
                        await client.telegram.sendVideo(item?.id, { url: random?.path });
                    } catch (error) {
                        await error_handling(error, client);
                    }
                }
            }
        }

        // تنفيذ الأحداث المتعلقة بمشاركة التفسير الميسر
        else if (time_tafseer.includes(time)) {
            // الحصول على تفاصيل التفسير الميسر
            const TFSMouaser = await tafseerMouaser(path.join(__dirname, './tafseerMouaser.jpeg')).catch(e => console.log(e));

            for (const item of GetAllUsers) {
                if (item?.evenPost && item?.permissions?.canSendMessages || item?.type === "private") {
                    try {
                        let message = `ـ ❁ …\n\n\nسورة <b>${TFSMouaser?.sura}</b> الآية: ${TFSMouaser?.ayahID}\n\n`
                        message += `<b>${TFSMouaser?.ayah}</b>\n\n`
                        message += `${TFSMouaser?.tafseer}`

                        if (TFSMouaser?.buffer) {
                            await client.telegram.sendPhoto(item?.id, { source: TFSMouaser?.buffer }, {
                                parse_mode: 'HTML',
                                caption: message
                            });
                        }
                    } catch (error) {
                        await error_handling(error, client);
                    }
                }
            }
        }

        // تنفيذ الأحداث المتعلقة بمشاركة التقويم الهجري
        else if (time_Hijri.includes(time)) {
            // الحصول على تفاصيل التقويم الهجري
            const Hijri_ = await Hijri(path.join(__dirname, './Hijri.jpeg')).catch(e => console.log(e));

            for (const item of GetAllUsers) {
                if (item?.evenPost && item?.permissions?.canSendMessages || item?.type === "private") {
                    try {
                        let message = '#التقويم_الهجري 📅\n\n'
                        message += `#${Hijri_?.today} | #${Hijri_.todayEn}\n`
                        message += `التاريخ الهجري: ${Hijri_?.Hijri}\n`
                        message += `التاريخ الميلادي: ${Hijri_?.Gregorian} \n\n\n`
                        message += `سورة ${Hijri_?.surah} | ${Hijri_?.title} \n\n`
                        message += `${Hijri_?.body}`

                        if (Hijri_) {
                            await client.telegram.sendPhoto(item?.id, { source: Hijri_?.buffer }, {
                                caption: message
                            });
                        }
                    } catch (error) {
                        await error_handling(error, client);
                    }
                }
            }
        }
    }, 60000);
}