import { launch } from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import CrateHtml from './CrateHtml.js';

/**
 * القائمة Hijri_calendar هي وظيفة لالتقاط صورة لتقويم هجري وحفظها في ملف.
 *
 * @param {string} filename - اسم الملف الذي ستتم حفظ الصورة فيه.
 * @returns {Object} - كائن يحتوي على محتوى الصفحة النصية وملف الصورة.
 */
export default async function Hijri_calendar(filename) {
  let browser;

  try {
    // إنشاء صفحة HTML
    let Html = await CrateHtml();

    // الحصول على المسار الكامل للمجلد الحالي
    let __dirname = path.resolve();

    // قراءة ملف التكوين
    let config = fs.readJSONSync(path.join(__dirname, './config.json'));

    // خيارات تشغيل المتصفح
    let launchOptions = {
      headless: "new",
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: config?.executablePath
    };

    // إطلاق المتصفح
    browser = await launch(launchOptions).catch(e => console.log('Error: browser is not launch ', e));

    // إنشاء صفحة جديدة
    let page = await browser?.newPage();

    // انتظار تحميل الصور
    await page.evaluate(async () => {
      const selectors = Array.from(document.querySelectorAll("img"));
      await Promise.all(selectors.map(img => {
        if (img.complete) return;
        return new Promise((resolve, reject) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', reject);
        });
      }));
    });

    // تعيين حجم العرض للصفحة
    await page?.setViewport({ width: 900, height: 100 });

    // التوجه إلى صفحة التقويم الهجري المحلية
    await page?.goto(`file://${path.join(__dirname, './module/Hijri/index.html')}`, {
      waitUntil: 'networkidle0',
      timeout: 600000
    });

    // التقاط صورة للصفحة بالكامل
    let scre = await page?.screenshot({ path: filename, fullPage: true, quality: 100 });

    // تمكين ذاكرة التخزين المؤقتة للصفحة
    await page?.setCacheEnabled(true);

    // إغلاق المتصفح
    await browser?.close();

    return {
      ...Html,
      buffer: scre
    };
  } catch (error) {
    return undefined;
  } finally {
    // إغلاق المتصفح في حالة الخطأ أو النجاح
    await browser?.close();
  }
}
