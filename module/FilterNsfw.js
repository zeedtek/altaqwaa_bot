import * as nsfw from 'nsfwjs';
import jpeg from 'jpeg-js';
import * as tf from '@tensorflow/tfjs';
import fetch from 'node-fetch';
import sharp from 'sharp';

let ns = null;

export async function scan(input, options) {
    let check = await checkInput(input);
    if (check?.type === "Link") {
        let buffer = await getBuffer(input).catch(e => console.log(e));
        let Result = await nsfwModel(Buffer.from(buffer), options).catch(e => console.log(e));
        return convertToPercentage(Result, options);
    } else if (check?.type === "Buffer") {
        let Result = await nsfwModel(input, options).catch(e => console.log(e));
        return convertToPercentage(Result, options);
    } else {
        return undefined;
    }
}

async function loadModel(modelUrl, size) {
    if (ns === null) {
        console.log("===| load model |===");
        tf.env().set('IS_NODE', false);
        ns = await nsfw.load(modelUrl, { size });
    }
}

async function nsfwModel(buffer, options) {
    await loadModel(options?.version === 'v2' ? options?.model_v2 : options?.model_v3, options?.version === 'v2' ? 224 : 299);

    if (!isJPEG(buffer)) {
        console.log('Invalid JPEG file');
        buffer = await convertToValidJPEG(buffer);
    }

    const { width, height, data } = extractJPEGData(buffer);
    const numChannels = 3;
    const numPixels = width * height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++) {
        for (let c = 0; c < numChannels; ++c) {
            values[i * numChannels + c] = data[i * 4 + c];
        }
    }

    const image = tf.tensor3d(values, [height, width, numChannels], 'int32');
    const predictions = await ns.classify(image).catch((error) => console.log(error));

    image.dispose();
    // tf.disposeVariables();

    return predictions;
}

async function convertToValidJPEG(buffer) {
    try {
        // تحويل الصورة إلى صيغة JPEG صالحة باستخدام sharp
        const outputBuffer = await sharp(buffer, { failOnError: false }).toFormat('jpeg').toBuffer();

        console.log('Converted image to valid JPEG');

        // يمكنك استخدام outputBuffer كمخرج لاستخدامه في العمليات اللاحقة
        return outputBuffer;
    } catch (error) {
        console.log('Error converting image:', error);
        return buffer;
    }
}

function isJPEG(buffer) {
    const SOI = Buffer.from([0xFF, 0xD8]);
    return buffer.slice(0, 2).equals(SOI);
}

function extractJPEGData(buffer) {
    const { width, height, data } = jpeg.decode(buffer);
    return { width, height, data };
}

async function getBuffer(url) {
    const response = await fetch(url, { method: 'GET' });
    const data = await response?.arrayBuffer();
    return data;
}

async function checkInput(input) {
    let isUrl = false;
    try {
        new URL(input);
        isUrl = true;
    } catch (error) {
        isUrl = false;
    }

    let isBuffer = Buffer.isBuffer(input);

    if (isUrl) {
        return {
            type: "Link",
            message: "Input is a URL."
        };
    } else if (isBuffer) {
        return {
            type: "Buffer",
            message: "Input is not a URL and not a Buffer."
        };
    } else {
        return undefined;
    }
}


function convertToPercentage(predictions, options) {
    if (!predictions || predictions.length === 0) {
        return [];
    }

    let neutralDrawingThreshold = options?.neutralDrawingThreshold ? options?.neutralDrawingThreshold : 40; // حد الرسم الطبيعي كنسبة مئوية
    let pornSexyThreshold = options?.pornSexyThreshold ? options?.pornSexyThreshold : 30; // حد الصور الإباحية والجنسية كنسبة مئوية

    let hasNeutralDrawing = predictions.some(prediction => (prediction.className === 'Neutral' || prediction.className === 'Drawing') && (roundNum(prediction.probability) >= neutralDrawingThreshold));
    let hasPornSexy = predictions.some(prediction => (prediction.className === 'Porn' || prediction.className === 'Sexy' || prediction.className === 'Hentai') && (roundNum(prediction.probability) >= pornSexyThreshold));

    if (hasNeutralDrawing && !hasPornSexy) {
        return {
            sharing: true,
            result: predictions.map(prediction => ({
                className: prediction.className,
                classNameAr: getClassNameAr(prediction.className),
                description: getDescription(prediction.className),
                probability: roundNum(prediction.probability) + '%'
            }))
        };
    } else {
        return {
            sharing: false,
            result: predictions.map(prediction => ({
                className: prediction.className,
                classNameAr: getClassNameAr(prediction.className),
                description: getDescription(prediction.className),
                probability: roundNum(prediction.probability) + '%'
            }))
        };
    }
}


function roundNum(num) {
    let rounded = Math.round(parseFloat(num * 100).toFixed(2));
    return rounded;
}

function getClassNameAr(className) {
    let classNameAr = '';
    switch (className) {
        case 'Porn':
            classNameAr = 'إباحية';
            break;
        case 'Sexy':
            classNameAr = 'جنسي';
            break;
        case 'Hentai':
            classNameAr = 'رسم إباحي';
            break;
        case 'Neutral':
            classNameAr = 'محايدة';
            break;
        case 'Drawing':
            classNameAr = 'رسم';
            break;
        default:
            classNameAr = className;
    }
    return classNameAr;
}

function getDescription(className) {
    let description = '';
    switch (className) {
        case 'Porn':
            description = 'هذه الصور والرسومات تحتوي على محتوى جنسي أو إباحي. يجب تجنب مشاركة هذه الصور.';
            break;
        case 'Sexy':
            description = 'هذه الصور تظهر مشاهد جنسية صريحة، لكنها لا تصف كامل المشهد. يجب تجنب مشاركة هذه الصور.';
            break;
        case 'Hentai':
            description = 'هذه الصور والرسومات تحتوي على محتوى جنسي أو إباحي. يجب تجنب مشاركة هذه الصور.';
            break;
        case 'Neutral':
            description = 'هذه الصور آمنة للمشاركة ولا تحتوي على محتوى جنسي أو إباحي. يشمل ذلك صورًا للطبيعة والأشخاص والأشياء.';
            break;
        case 'Drawing':
            description = 'هذه الرسومات تعتبر آمنة للمشاركة ولا تحتوي على محتوى جنسي أو إباحي. وهي تشمل الرسومات الكرتونية والأنيمي والرسومات التقنية والعديد من الأشكال الأخرى.';
            break;
        default:
            description = "description";
    }
    return description;
}