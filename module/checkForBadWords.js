import fs from 'fs-extra';
import path from 'path';

function loadBadWords() {
    // Get the current working directory
    const __dirname = path.resolve();
    const fileNameBadWords = path.join(__dirname, './files/badwords.txt'); // اسم الملف الذي يحتوي على الكلمات السيئة
    const badWords = [];

    try {
        // قراءة الملف وتحويله إلى نص
        const fileContent = fs.readFileSync(fileNameBadWords, 'utf-8');

        // تقسيم النص إلى سطور
        const lines = fileContent.split(/[\r\n]+/);

        // تنظيف السطور وتحويلها إلى حروف صغيرة
        lines.forEach(line => {
            const cleanedLine = line.trim().toLowerCase();
            if (cleanedLine) {
                badWords.push(cleanedLine);
            }
        });

    } catch (err) {
        console.log(`Failed to load ${fileNameBadWords}: ${err.toString()}`);
    }

    return badWords;
}

// استخدام الدالة checkForBadWords لفحص النص عن وجود كلمات سيئة

export default function checkForBadWords(text) {

    const badWords = loadBadWords();
    // إلقاء نظرة على الكلمات السيئة المحملة والتحقق مما إذا كانت الكلمات السيئة موجودة في النص
    const foundBadWords = [];
    const inputWords = text.trim().toLowerCase().split(/\s+/);

    inputWords.forEach(word => {
        if (badWords.includes(word)) {
            foundBadWords.push(word);
        }
    });

    if (foundBadWords?.length > 0) {
        return {
            message: `تم العثور على كلمات سيئة في محتوى الرسالة: [ ${foundBadWords.join(', ')} ] ❌`,
            words: foundBadWords,
            check: true
        }
    } else {
        return {
            message: "لم يتم العثور على كلمات سيئة في محتوى الرسالة ✔️",
            words: foundBadWords,
            check: false
        }
    }

}