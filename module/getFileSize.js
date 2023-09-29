import https from 'https';
import http from 'http';

/**
 * احسب حجم الملف الموجود على الرابط المعطى
 * @param {string} url - عنوان الملف
 * @returns {Promise<string>} - الحجم المحسوب بصيغة قابلة للقراءة
 */

export default async function getFileSize(url) {
    if (!url) return Promise.reject(new Error('عنوان غير صالح'));

    return new Promise((res, rej) => {
        try {
            if (url.startsWith('https://') || url.startsWith('http://')) {
                let req = url.startsWith('https://') ? https.get(url) : http.get(url);
                req.once("response", async r => {
                    let c = parseInt(r.headers['content-length']);
                    if (!isNaN(c) && r.statusCode === 200) res(formatBytes(c));
                    else res("تعذر الحصول على حجم الملف");
                });
                req.once("error", async e => rej(e));
            } else {
                console.log('خطأ: يجب أن يكون العنوان http أو https');
            }
        } catch (error) {
            console.log(error);
        }
    });
}

/**
 * صيغة البايتات إلى صيغة قابلة للقراءة
 * @param {number} x - حجم الملف بالبايتات
 * @returns {string} - الحجم المحسوب بصيغة قابلة للقراءة
 */
function formatBytes(x) {
    let units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let bytes = x;
    let i;

    for (i = 0; bytes >= 1024 && i < 4; i++) {
        bytes /= 1024;
    }

    return bytes.toFixed(2) + ' ' + units[i];
}
