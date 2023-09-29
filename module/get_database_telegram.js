import fs from 'fs-extra';
import path from 'path';

/**
 * هذه الدالة تسترجع قاعدة بيانات تيليجرام بناءً على النوع المحدد
 * @param {"all"|"private"|"group"|"supergroup"|"channel"} type 
 * @returns 
 */

export default async function get_database_telegram(type) {
    const __dirname = path.resolve();
    const databasePath = path.join(__dirname, './database');
    const databaseFiles = fs.readdirSync(databasePath);
    const result = [];

    for (const file of databaseFiles) {
        const id = file.split('.json')[0];
        const chatJson = fs.readJsonSync(path.join(databasePath, file));
        if (chatJson?.type === type || type === 'all') {
            result.push({
                id: chatJson?.id,
                username: chatJson?.username,
                name: chatJson?.name,
                type: chatJson?.type,
                status: chatJson?.status,
                evenPost: chatJson?.evenPost,
                permissions: chatJson?.permissions
            });
        }
    }

    return result;
}