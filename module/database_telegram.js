import fs from 'fs-extra';
import path from 'path';
import getBotPermissions from './getBotPermissions.js';

export default async function database_telegram(options, client) {
    // Get the current working directory
    const __dirname = path.resolve();

    // Check if the user's database file already exists
    const create_db_user = fs.existsSync(path.join(__dirname, `./database/${options?.id}.json`));
    // If the user's database file already exists, update the data
    const db_user = fs.existsSync(path?.join(__dirname, `./database/${options?.id}.json`)) ?
    fs.readJsonSync(path.join(__dirname, `./database/${options?.id}.json`)) : {};

    let permissions

    // تحقق من وجود معلمة "client" واستدعاء وظيفة "getBotPermissions".
    if (client && (!create_db_user || options?.EditPermissions || Object.keys(db_user?.permissions || {})?.length === 0)) {
        permissions = await getBotPermissions(client, options?.id);
    }
    // If the user's database file doesn't exist, create it and write the data
    if (!create_db_user) {
        
        const opj = {
            id: options?.id || undefined,
            username: options?.username || undefined,
            name: options?.name || undefined,
            type: options?.type || undefined,
            status: options?.status || undefined,
            evenPost: options?.evenPost || undefined,
            message_id: options?.message_id || undefined,
            permissions: permissions || {}
        };

        // Write the data to the user's database file
        fs.writeJsonSync(path.join(__dirname, `./database/${options?.id}.json`), opj, { spaces: '\t' });
        console.log(`The database has been created with ID ${options?.id} and username @${options?.username}`);
        
    } else {

        // Update the properties if they are provided
        if (options?.username) {
            db_user.username = options?.username;
        }
        if (options?.name) {
            db_user.name = options?.name;
        }
        if (options?.type) {
            db_user.type = options?.type;
        }
        if (options?.message_id) {
            db_user.message_id = options?.message_id;
        }
        if (options?.EditPermissions || Object.keys(db_user?.permissions || {})?.length === 0) {
            db_user.permissions = permissions || {};
        }
        // Write the updated data to the user's database file
        fs.writeJsonSync(path.join(__dirname, `./database/${options?.id}.json`), db_user, { spaces: '\t' });
    }

}