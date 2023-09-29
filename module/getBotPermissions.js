import fs from 'fs-extra';
import path from 'path';
import error_handling from './error_handling.js';

export default async function getBotPermissions(client, chatId) {
    const __dirname = path.resolve();
    const configPath = path.join(__dirname, './config.json');
    const config = await fs.readJson(configPath).catch(() => ({}));

    let botInfo = config?.botInfo;

    if (!botInfo) {
        botInfo = await client.telegram.getMe();
        config.botInfo = botInfo;
        await fs.writeJson(configPath, config);
    }

    // استخدم خاصية `getChatMember` للحصول على معلومات البوت في القروب
    const botMember = await client.telegram.getChatMember(chatId, botInfo?.id).catch(async error => {
        await error_handling(error, client);
    });

    // تحديد حالتك في المجموعة عضو او مشرف  member | administrator
    const canStatus = botMember?.status;
    // يحدد ما إذا كان يمكن للمستخدم إرسال رسائل في القناة أو المجموعة. 
    const canSendMessages = botMember?.can_post_messages;
    // يحدد ما إذا كان يمكن للمستخدم حذف الرسائل في القناة أو المجموعة. 
    const candDeleteMessages = botMember?.can_delete_messages;
    // يحدد ما إذا كان يمكن للمستخدم تقييد أعضاء القناة أو المجموعة، مثل حظرهم أو تقييدهم من إرسال الرسائل. 
    const candRestrict_Members = botMember?.can_restrict_members;
    // يحدد ما إذا كان يمكن للمستخدم تعديل الرسائل التي تم إرسالها في القناة أو المجموعة. 
    const candEditMessages = botMember?.can_edit_messages;

    return {
        canStatus,
        canSendMessages,
        candDeleteMessages,
        candRestrict_Members,
        candEditMessages,
    };
}