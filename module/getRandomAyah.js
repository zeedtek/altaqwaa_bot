import fs from 'fs-extra';
import path from 'path';

export default async function getRandomAyah() {

    /**
     * حل المسار الحالي باستخدام path.resolve()
     */
    let __dirname = path.resolve();
    
    /**
     * قراءة ملف JSON للتفسير الموسع
     */
    let tafseerMouaser = fs.readJSONSync(path.join(__dirname, './files/json/tafseerMouaser.json'));
    
    /**
     * قراءة ملف JSON للقرآن
     */
    let quran = fs.readJSONSync(path.join(__dirname, './files/json/quran.json'));
    
    /**
     * اختيار عشوائي من التفسير الميسر
     */
    let randomTfs = tafseerMouaser[Math.floor(Math.random() * tafseerMouaser.length)];
    
    /**
     * البحث عن سورة معينة في ملف القرآن باستخدام رقم السورة
     */
    let sura = quran.find(e => String(e?.number) === randomTfs?.sura_no);
    
    /**
     * البحث عن آية معينة في السورة باستخدام رقم الآية
     */
    let ayah = sura?.array_verses[0].find(e => String(e?.id) === randomTfs?.aya_no);

    /**
     * إرجاع النتائج
     */
    return {
        suraID: sura?.number,
        sura: sura?.name,
        suraEn: sura?.name_translation,
        ayahID: ayah?.id,
        ayah: `﴿ ${ayah?.ar} ﴾`,
        jozz: randomTfs?.jozz,
        page: randomTfs?.page,
        verses: sura?.number_verses,
        words: sura?.number_words,
        letters: sura?.number_letters,
        descent: sura?.descent,
        tafseer: randomTfs?.aya_tafseer
    }
}