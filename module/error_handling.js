import fs from 'fs-extra';
import path from 'path';

export default async (error, client) => {

    const __dirname = path.resolve();

    if (error?.response) {

        // إذا تمت ترقية المجموعة إلى مجموعة فائقة
        if (error.response.description === "Bad Request: group chat was upgraded to a supergroup chat") {

            let id_new = error.response.parameters.migrate_to_chat_id;
            let id_old = error.on.payload.chat_id;
            let fileOld = fs?.readJsonSync(path?.join(__dirname, `./database/${id_old}.json`));
            fileOld.id = id_new;
            fs.writeJsonSync(path.join(__dirname, `./database/${id_new}.json`), fileOld);
            fs.removeSync(path?.join(__dirname, `./database/${id_old}.json`));

        }

        // إذا تم تعطيل المستخدم
        else if (error.response.description === "Forbidden: user is deactivated") {

            let id_user = error.on.payload.chat_id
            fs.existsSync(path?.join(__dirname, `./database/${id_user}.json`)) ?
                fs.removeSync(path?.join(__dirname, `./database/${id_user}.json`)) : false;

        }

        // إذا لم يكن لديك الصلاحيات الكافية لإرسال الفيديوهات
        else if (error.response.description === "Bad Request: not enough rights to send videos to the chat") {

            let id_user = error.on.payload.chat_id
            let fileJson = fs?.readJsonSync(path?.join(__dirname, `./database/${id_user}.json`));
            fileJson.permissions.canSendMessages = false;
            fs.writeJsonSync(path.join(__dirname, `./database/${id_user}.json`), fileJson);
            let message = 'طلب غير صالح: لا توجد حقوق كافية لإرسال مقاطع فيديو إلى الدردشة'
            await client.telegram.sendMessage(id_user, message);
        }

        // إذا لم يكن لديك الصلاحيات الكافية لإرسال الصور
        else if (error.response.description === "Bad Request: not enough rights to send photos to the chat") {

            let id_user = error.on.payload.chat_id
            let fileJson = fs?.readJsonSync(path?.join(__dirname, `./database/${id_user}.json`));
            fileJson.permissions.canSendMessages = false;
            fs.writeJsonSync(path.join(__dirname, `./database/${id_user}.json`), fileJson);
            let message = 'طلب غير صالح: لا توجد حقوق كافية لإرسال الصور إلى الدردشة'
            await client.telegram.sendMessage(id_user, message);
        }

        // إذا لم يكن لديك الصلاحيات الكافية لإرسال رسائل نصية
        else if (error.response.description === "Bad Request: not enough rights to send text messages to the chat") {

            let id_user = error.on.payload.chat_id
            let fileJson = fs?.readJsonSync(path?.join(__dirname, `./database/${id_user}.json`));
            fileJson.permissions.canSendMessages = false;
            fs.writeJsonSync(path.join(__dirname, `./database/${id_user}.json`), fileJson);

        }

        // إذا تم حظر البوت من قبل المستخدم
        else if (error.response.description === "Forbidden: bot was blocked by the user") {

            let id_user = error.on.payload.chat_id

            fs.existsSync(path?.join(__dirname, `./database/${id_user}.json`)) ?
                fs.removeSync(path?.join(__dirname, `./database/${id_user}.json`)) : false;

        }

        // إذا لم يتم العثور على الدردشة
        else if (error.response.description === "Bad Request: chat not found") {

            let id_user = error.on.payload.chat_id

            fs.existsSync(path?.join(__dirname, `./database/${id_user}.json`)) ?
                fs.removeSync(path?.join(__dirname, `./database/${id_user}.json`)) : false;

        }

        // إذا تم طرد البوت من المجموعة الفائقة
        else if (error.response.description === "Forbidden: bot was kicked from the supergroup chat") {

            let id_user = error.on.payload.chat_id

            fs.existsSync(path?.join(__dirname, `./database/${id_user}.json`)) ?
                fs.removeSync(path?.join(__dirname, `./database/${id_user}.json`)) : false;

        }

        // إذا لم يتم العثور على الرسالة لحذفها
        else if (error.response.description === "Bad Request: message to delete not found") {

            let id_user = error.on.payload.chat_id
            let message_id = error.on.payload.message_id
            let fileJson = fs?.readJsonSync(path?.join(__dirname, `./database/${id_user}.json`));

            if (fileJson?.message_id || fileJson?.message_id !== message_id) {

                delete fileJson.message_id
                fs.writeJsonSync(path?.join(__dirname, `./database/${id_user}.json`), fileJson);

            }

        }

        // إذا لم يتمكن البوت من حذف الرسالة للجميع
        else if (error.response.description === "Bad Request: message can't be deleted for everyone") {

            let id_user = error.on.payload.chat_id
            let message_id = error.on.payload.message_id
            let fileJson = fs?.readJsonSync(path?.join(__dirname, `./database/${id_user}.json`));

            if (fileJson?.message_id || fileJson?.message_id !== message_id) {

                delete fileJson.message_id
                fs.writeJsonSync(path?.join(__dirname, `./database/${id_user}.json`), fileJson);

            }

        }

        else {
            console.log(error);
        }
    }

    else {
        console.log(error);
    }
}