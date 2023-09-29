# بوت التقوى

<div align="center">
  <img align="center" src="./logo.jpg">

  <br>
  <br>

  بوت إسلامي لتطبيق تيليجرام يقدم العديد من الخدمات التي يحتاجها المسلم في يومه 

  <br>

  يقول النبي ﷺ: من دل على خير؛ فله مثل أجر فاعله 

  [مثال على بوت التقوى](https://t.me/adhk2r_bot)

</div>


# مميزات التطبيق

- نشر الرسائل بشكل تلقائي لجميع المشتركين في البوت سواء اشخاص او قنوات او قروبات
- القرآن الكريم | 158 قارئ
- حصن المسلم … أذكار الصباح والمساء والنوم الخ... | صوت و نص
- بطاقات القرآن الكريم | صوت و صورة
- صور عشوائية
- فيدوهات قرآن قصيرة
- اسماء الله الحسنى
- آية وتفسير | نص و صورة
- التاريخ الهجري | نص و صورة
- التعرف على الصور الاباحية والجنسية وحذفها يعمل فقط في القروبات (supergroup)


# المتطلبات

- nodejs 
- متصفح chromium او chrom
- رمز token الخاص ببوت telegram | [BotFather](https://t.me/BotFather)
- تحرير ملف config.json 


```json
{
    "token_telegram": "5798247559:AAHdBHKKbA1l6mg2PA5EijTLcVNqEsBR-6U",
    "executablePath": "/snap/bin/chromium",
    "version": "v3",
    "model_v2": "https://bot.altaqwaa.org/model-v2-224-90/model.json",
    "model_v3": "https://bot.altaqwaa.org/model-v3/model.json",
    "neutralDrawingThreshold": 50,
    "pornSexyThreshold": 50
}
```


- token_telegram =  رمز التوكن الخاص بالبوت ينمكنك انشائه من خلال [@BotFather](https://t.me/BotFather)
- version = اصدار الموديل الخاص بالتعرف على الصور الاباحيه او الجنسية v2 يستغر حول 10 ثواني للمعالجة v3 يستغرق حول 50 ثانيهه
- model_v2 = رابط المودل الاصدار الثاني 
- model_v3 = رابط المودل الاصدار الثالث
- neutralDrawingThreshold =  حد الصور الطبيعية كنسبة مئوية
- pornSexyThreshold =  حد الصور الإباحية والجنسية كنسبة مئوية 
- executablePath = مسار متصفح chromium او chrom


في الغالب هذه المسارات لجميع الانظمة

```
linux:

/usr/bin/google-chrome-stable

or 

/usr/bin/chromium

or 

/snap/bin/chromium


or

/usr/bin/chromium-browser

windows:


C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe


MacOS:

/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

# تثبيت 

```bash
git clone https://github.com/rn0x/altaqwaa_bot
cd altaqwaa_bot
npm i
npm start
```


# مثال على آية وتفسير و التاريخ الهجري

<div align="center">

  <img align="center" src="./tafseerMouaser.jpeg">

  <br>
  <br>

  <img align="center" src="./Hijri.jpeg">

  <br>
  <br>

  وفي الختام لاتنسنا من دعوة صالة بظهر الغيب .
</div>
