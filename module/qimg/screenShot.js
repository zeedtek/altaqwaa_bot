import puppeteer from 'puppeteer';
/**
 * تحويل الصفحة HTML و CSS إلى صورة باستخدام Puppeteer.
 *
 * @param {Object} options - الخيارات لعملية التحويل.
 * @param {string} options.htmlCode - كود HTML الصفحة المراد تحويلها إلى صورة.
 * @param {string} options.cssCode - كود CSS لتنسيق الصفحة.
 * @param {string} options.outputPath - المسار الذي سيتم حفظ الصورة فيه.
 * @param {string} options.url - رابط الصفحة.
 * @param {number} [options.width=1200] - عرض الصفحة (بكسل).
 * @param {number} [options.height=800] - ارتفاع الصفحة (بكسل).
 * @param {string} [options.format='jpeg'] - تنسيق الصورة ('png', 'jpeg').
 * @param {number} [options.duration=10] - مدة الفيديو (بالثواني).
 * @param {number} [options.retryLimit=3] - عدد مرات المحاولة في حالة فشل التحويل.
 * @param {Object} [options.puppeteerConfig] - إعدادات محرك Puppeteer.
 * @param {boolean} [options.puppeteerConfig.headless=true] - تشغيل المتصفح بدون واجهة رسومية.
 * @param {string[]} [options.puppeteerConfig.args] - قائمة الخيارات لمحرك Puppeteer.
 *
 * @returns {Object} - كائن يحتوي على معلومات العملية.
 * @property {boolean} success - تمت عملية التحويل بنجاح أم لا.
 * @property {string} message - رسالة توضح نتيجة العملية.
 * @property {string} imagePath - المسار إلى الصورة المحفوظ (إذا تمت العملية بنجاح).
 * @property {Buffer} buffer - المخزن المؤقت للصورة Buffer.
 */


export default async function screenShot(options) {
    let browser, page;
    const result = {
        success: false,
        message: '',
        imagePath: '',
        buffer: null
    };

    try {
        browser = await puppeteer.launch(options?.puppeteerConfig)
            .catch(e => console.log('Error: browser is not launch ', e));
        page = await browser.newPage();

        for (let retryCount = 0; retryCount < options.retryLimit; retryCount++) {

            try {

                if (options?.width && options?.height) {
                    await page.setViewport({ width: options?.width, height: options?.height });
                }

                if (options?.htmlCode) {
                    await page.setContent(options?.htmlCode);
                }

                if (options?.url) {
                    await page.goto(options.url, { waitUntil: 'networkidle0', timeout: 600000 });
                }

                if (options?.cssCode) {
                    await page.addStyleTag({ content: options.cssCode });
                }
                
                await page.waitForSelector('#green', { timeout: 60000 });

                const screenshotOptions = {
                    path: options.outputPath,
                    fullPage: true,
                };

                if (options?.format === 'jpg' || options?.format === 'jpeg') {
                    screenshotOptions.type = 'jpeg';
                } else if (options?.format === 'webp') {
                    screenshotOptions.type = 'webp';
                }

                const imagesPath = [];
                // First screenshot
                const screenshot1Path = `${options.outputPath}/IMG1.jpeg`;
                const screenshot1 = await page.screenshot({ ...screenshotOptions, path: screenshot1Path });
                imagesPath.push(screenshot1Path);

                await page.waitForTimeout(3000);
                // Second screenshot after interactions
                const screenshot2Path = `${options.outputPath}/IMG2.jpeg`;
                const screenshot2 = await page.screenshot({ ...screenshotOptions, path: screenshot2Path });

                imagesPath.push(screenshot2Path);



                await page.setCacheEnabled(true);
                console.log("options?.outputPath ", options?.outputPath);

                result.success = true;
                result.message = `تم تحويل الصفحة إلى صورة وحفظه في ${imagesPath}`;
                result.imagePath = imagesPath;
                result.buffer = {
                    IMG1: screenshot1,
                    IMG2: screenshot2,
                }
                break; // Success, exit the loop
            } catch (error) {
                result.message = `حدث خطأ: ${error}`;
                console.error(result.message);
            }
        }
    } catch (error) {
        result.message = `Failed to launch Puppeteer: ${error}`;
        console.error(result.message);
    } finally {
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    }

    if (!result.success) {
        result.message = `لم يتمكن من تحويل الصفحة إلى فيديو بنجاح بعد ${options.retryLimit} محاولات.`;
        console.error(result.message);
    }

    return result;
}
