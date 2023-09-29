import fs from 'fs-extra';
import path from 'path';
import database_telegram from './database_telegram.js';

export default async function join_left(client) {
    // هذا الكود يقوم بالتعامل مع أحداث تغيير حالة العضو في المجموعة
    const sentMessages = new Set(); // متغير مؤقت لتتبع الرسائل المرسلة

    client.on("my_chat_member", async (ctx) => {
        // الحصول على مسار المجلد الحالي
        const __dirname = path.resolve();
        const id_from = ctx?.from?.id;
        const id_chat = ctx?.chat?.id;
        const username_chat = ctx?.chat?.username;
        const name_from = ctx?.from?.first_name || ctx?.from?.last_name;
        const name_chat = ctx?.chat?.first_name || ctx?.chat?.last_name || ctx?.chat?.title;
        const type = ctx?.chat?.type;
        const new_chat_member = ctx?.update?.my_chat_member?.new_chat_member;
        const status = new_chat_member?.status;
        const can = Object.fromEntries(
            Object.entries(new_chat_member).filter(([key]) => key.startsWith('can'))
        );
        const existsSync = fs.existsSync(path.join(__dirname, `./database/${id_chat}.json`));

        if (status === 'member' || status === 'administrator') {
            await database_telegram({
                id: id_chat,
                username: username_chat,
                name: name_chat,
                type,
                status,
                evenPost: true,
                EditPermissions: true
            }, client);

            if (type !== "channel" && !sentMessages.has(id_chat) && !existsSync) {
                const message = username_chat ?
                    `مرحبا @${username_chat} لقد تم تفعيل خدمة إرسال الرسائل بشكل تلقائي \nلتعطيل الخدمة أرسل كلمة تعطيل` :
                    `مرحبا ${name_chat} لقد تم تفعيل خدمة إرسال الرسائل بشكل تلقائي \nلتعطيل الخدمة أرسل كلمة تعطيل`;

                await ctx.reply(message);
                sentMessages.add(id_chat); // إضافة معرف الدردشة للرسائل المرسلة
            }
        } else if (status === 'left' || status === 'kicked') {

            if (existsSync) {
                fs.removeSync(path.join(__dirname, `./database/${id_chat}.json`));
            }

            sentMessages.delete(id_chat); // ازالة معرف الدردشة للرسائل المرسلة
        }
    });
}