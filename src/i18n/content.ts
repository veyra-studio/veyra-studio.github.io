/**
 * Site copy, written separately for each language (not machine-paired
 * line by line). Persian uses Persian digits, punctuation and ZWNJ;
 * Arabic uses Arabic-Indic digits and Arabic punctuation; Turkish keeps
 * its dotted/dotless i and the decimal comma.
 */

export type Lang = 'en' | 'fa' | 'ar' | 'tr'

/** Every language, in the order the switcher lists them. */
export const langs: Lang[] = ['en', 'fa', 'ar', 'tr']

/** Which language a short sample is written in (Persian letters → fa, other Arabic script → ar, else en). */
export const scriptLang = (s: string): Lang =>
  /[\u067E\u0686\u0698\u06AF\u06A9\u06CC]/.test(s) ? 'fa' : /[\u0600-\u06FF]/.test(s) ? 'ar' : 'en'
export const isRtl = (lang: Lang) => lang === 'fa' || lang === 'ar'

export const links = {
  core: 'https://github.com/veyra-studio/veyra-core',
  site: 'https://github.com/veyra-studio/veyra-studio.github.io',
  abaliRepo: 'https://github.com/veyra-studio/abali',
  abali: 'https://veyra-studio.github.io/abali/',
  org: 'https://github.com/veyra-studio',
}

export interface Capability {
  id: 'loop' | 'motion' | 'scroll' | 'type' | 'quality' | 'webgl'
  no: string
  title: string
  body: string
  hint?: string
}

/** A demo panel in the "New in 0.2" row (the row opens with an intro panel). */
export interface NextPanel {
  id: 'kashida' | 'drag' | 'flip' | 'pointer' | 'scramble' | 'noise'
  /** The engine API the panel demonstrates (shown in code type). */
  api: string
  title: string
  body: string
}

export interface Content {
  lang: Lang
  dir: 'ltr' | 'rtl'
  meta: { title: string; description: string; ogLocale: string }
  skip: string
  nav: { engine: string; work: string; studio: string; source: string; menu: string; home: string; languages: string }
  hero: {
    eyebrow: string
    wordmark: string
    wordmarkAlt: string
    /** The language of `wordmarkAlt` (the wordmark in the other script). */
    wordmarkAltLang: Lang
    lead: string
    ctaWork: string
    ctaEngine: string
    scroll: string
  }
  statement: { kicker: string; lines: string[]; note: string }
  engine: {
    kicker: string
    title: string
    intro: string
    caps: Capability[]
    live: { fps: string; frame: string; quality: string; dpr: string; refresh: string; tiers: Record<'low' | 'medium' | 'high', string> }
    springHint: string
    springLabel: string
    typeSample: string
    typeNaive: string
    typeVeyra: string
    scrollProgress: string
  }
  next: {
    kicker: string
    title: string
    intro: string
    direction: string
    panels: NextPanel[]
    kashidaSample: string
    kashidaLabel: string
    dragCards: string[]
    dragLabel: string
    flipShuffle: string
    magnet: string
    tiltCard: string
    scrambleLines: [string, string]
    replay: string
    noWebgl: string
    marquee: string
  }
  work: {
    kicker: string
    case: string
    title: string
    tagline: string
    body: string
    facts: Array<[string, string]>
    cta: string
    source: string
    disclaimer: string
  }
  studio: {
    kicker: string
    title: string
    parts: Array<{ name: string; body: string }>
    principlesTitle: string
    principles: Array<{ name: string; body: string }>
  }
  start: { kicker: string; title: string; body: string; cta: string; docs: string }
  footer: { made: string; rights: string; top: string; links: string }
  notFound: { title: string; body: string; home: string }
  /** The language's own name and a short label for the switcher. */
  langName: string
  langShort: string
  /** Shown to visitors whose browser prefers this language: “This page is also in …”. */
  langHint: string
  close: string
}

export const en: Content = {
  lang: 'en',
  dir: 'ltr',
  meta: {
    title: 'Veyra Studio — an engine for the moving web',
    description:
      'Veyra Studio builds immersive, art-directed web experiences — and Veyra, the open creative web experience engine that makes them possible.',
    ogLocale: 'en_US',
  },
  skip: 'Skip to content',
  nav: { engine: 'Engine', work: 'Work', studio: 'Studio', source: 'Source', menu: 'Main', home: 'Veyra Studio, home', languages: 'Language' },
  hero: {
    eyebrow: 'Veyra Studio — creative technology',
    wordmark: 'Veyra',
    wordmarkAlt: 'ویرا',
    wordmarkAltLang: 'fa',
    lead: 'We build immersive, art-directed web experiences — and the engine that makes them possible.',
    ctaWork: 'Abali, our first showcase',
    ctaEngine: 'Meet the engine',
    scroll: 'Scroll',
  },
  statement: {
    kicker: 'Not a builder',
    lines: ['Not a website builder.', 'Not a template.', 'An engine for websites', 'that move.'],
    note: 'Veyra owns the hard, reusable parts of creative development — time, motion, scroll, type and light — and leaves the art direction entirely to the project.',
  },
  engine: {
    kicker: 'The engine',
    title: 'Everything that moves, on one loop.',
    intro:
      'Veyra Core is a TypeScript engine with zero runtime dependencies. Every demo below is the engine running on this page.',
    caps: [
      { id: 'loop', no: '01', title: 'One frame loop', body: 'Input, scroll, layout, motion and rendering run in ordered phases inside a single requestAnimationFrame. It pauses when you leave, and survives a failing effect.' },
      { id: 'motion', no: '02', title: 'Motion with physics', body: 'Seekable timelines for choreography; analytic springs that stay exact at 30 Hz or 240 Hz.', hint: 'Drag the dot. Let go.' },
      { id: 'scroll', no: '03', title: 'Scroll as a storyline', body: 'Native scrolling, smoothed — sticky, keyboard, find-in-page and screen readers keep working. Scenes turn position into progress.' },
      { id: 'type', no: '04', title: 'Every script, every direction', body: 'Animate Persian letter by letter and the letters stay joined. Mixed English and Persian keeps its order.' },
      { id: 'quality', no: '05', title: 'Adaptive by design', body: 'The engine measures real frame times and adjusts quality and pixel density to the device in your hand.' },
      { id: 'webgl', no: '06', title: 'WebGL where it matters', body: 'An optional three.js layer on the same loop: a pixel camera, objects anchored to layout, real HTML mirrored into textures.' },
    ],
    live: { fps: 'fps', frame: 'frame', quality: 'quality', dpr: 'pixel ratio', refresh: 'display', tiers: { low: 'low', medium: 'medium', high: 'high' } },
    springHint: 'Drag the dot. Let go.',
    springLabel: 'Spring dot — nudge it with the arrow keys',
    typeSample: 'خنکی صدا دارد.',
    typeNaive: 'Naive split',
    typeVeyra: 'Veyra split',
    scrollProgress: 'This section’s progress',
  },
  next: {
    kicker: 'New in 0.2',
    title: 'More ways to move.',
    intro: 'Every panel in this row is the new release at work — and so is the row: scroll down and it travels sideways.',
    direction: 'On the Persian and Arabic pages it moves the other way, rightward, so the panels still arrive in reading order.',
    panels: [
      { id: 'kashida', api: 'kashida()', title: 'Kashida, the calligrapher’s stretch', body: 'Persian words lengthen where a calligrapher would stretch them: after seen and sheen, then on the last join — never inside lam-alef, never across a zero-width non-joiner.' },
      { id: 'drag', api: 'draggable()', title: 'Throw it', body: 'Inertia, edges that push back, and snap points that keep the speed of the throw. Arrow keys move one card at a time.' },
      { id: 'flip', api: 'flip()', title: 'Layouts that travel', body: 'Change the layout any way you like; every element glides from where it was to where it lands.' },
      { id: 'pointer', api: 'magnetic() · tilt()', title: 'Things that lean in', body: 'Magnetic buttons and tilting cards, on springs. They switch off on touch screens and for reduced motion.' },
      { id: 'scramble', api: 'scrambleText()', title: 'Decode', body: 'Text settles out of noise in its own script: Persian flickers in Persian letters and stays joined.' },
      { id: 'noise', api: '@veyra/core/glsl', title: 'Noise and light', body: 'Seeded noise for organic motion, and GLSL building blocks — noise, distance fields, OKLab color — for shaders like this one.' },
    ],
    kashidaSample: 'کشیده بنویس',
    kashidaLabel: 'Stretch',
    dragCards: ['Throw', 'Catch', 'Resist', 'Snap', 'Step', 'Rest'],
    dragLabel: 'Cards. Use the arrow keys to move.',
    flipShuffle: 'Shuffle',
    magnet: 'See the code',
    tiltCard: 'Leans toward you',
    scrambleLines: ['Decoded, letter by letter', 'حرف به حرف، رمزگشایی'],
    replay: 'Replay',
    noWebgl: 'This browser doesn’t offer WebGL2.',
    marquee: 'Veyra 0.2 — horizontal sections · kashida · drag & inertia · FLIP · magnetic · scramble · noise · GLSL —',
  },
  work: {
    kicker: 'Work',
    case: 'Case 001',
    title: 'Abali',
    tagline: 'Cool has a sound.',
    body: 'A Persian, right-to-left campaign concept for Doogh Abali, the carbonated yogurt drink in a glass bottle. Cool has a sound — opening a cold Abali is a handful of them: the opener prying off the crown cap, the gas escaping, the first gulps, the sigh of relief. The film stretches them into a scroll: a bottle rebuilt from photographs of the real one, a cap that snaps off and clatters to the floor, foam that boils over and turns to snow on the mountains around Abali, and a sofreh that fills dish by dish.',
    facts: [
      ['Language', 'Persian, RTL'],
      ['Built with', 'Veyra Core 0.4 + three.js'],
      ['Assets', 'All generated live — no photos, no model files'],
      ['Sound', 'Synthesized, optional'],
    ],
    cta: 'Open the experience',
    source: 'Source',
    disclaimer: 'An independent, unofficial concept. Not affiliated with the maker of Doogh Abali.',
  },
  studio: {
    kicker: 'Studio',
    title: 'A studio, an engine, and the work between them.',
    parts: [
      { name: 'The studio', body: 'makes experiences for brands and stories — campaigns, launches, worlds you can scroll through.' },
      { name: 'The engine', body: 'is what we keep. Every project returns its best ideas to Veyra Core, in the open.' },
      { name: 'The showcases', body: 'are proof: public pieces that push the engine somewhere it hasn’t been.' },
    ],
    principlesTitle: 'How we build',
    principles: [
      { name: 'Craft over features', body: 'A few things, finished beautifully.' },
      { name: 'Motion with meaning', body: 'Every movement explains something.' },
      { name: 'Native first', body: 'The platform already scrolls, renders and reads aloud. We build on it.' },
      { name: 'Every script, every direction', body: 'Persian and Arabic are designed, not mirrored.' },
      { name: 'Performance is design', body: 'A dropped frame is a broken detail.' },
      { name: 'Accessible by default', body: 'Reduced motion, real text, keyboard paths.' },
    ],
  },
  start: {
    kicker: 'Open source',
    title: 'Start with a stage.',
    body: 'Veyra Core is MIT-licensed. Read the guide, run the examples, build something that moves.',
    cta: 'Veyra Core on GitHub',
    docs: 'Read the guide',
  },
  footer: { made: 'Made with Veyra, in English, Persian, Arabic and Turkish.', rights: '© 2026 Veyra Studio', top: 'Back to top', links: 'Links' },
  notFound: { title: 'A loose thread.', body: 'This page doesn’t exist — or not yet.', home: 'Back to the studio' },
  langName: 'English',
  langShort: 'EN',
  langHint: 'This page is also in English',
  close: 'Close',
}

export const fa: Content = {
  lang: 'fa',
  dir: 'rtl',
  meta: {
    title: 'استودیو ویرا — موتوری برای وبِ متحرک',
    description:
      'استودیو ویرا تجربه‌های تعاملی و فراگیر برای وب می‌سازد — و ویرا، موتور متن‌بازی که ساختنِ این تجربه‌ها را ممکن می‌کند.',
    ogLocale: 'fa_IR',
  },
  skip: 'پرش به محتوا',
  nav: { engine: 'موتور', work: 'کارها', studio: 'استودیو', source: 'کد منبع', menu: 'اصلی', home: 'استودیو ویرا، صفحهٔ اصلی', languages: 'زبان' },
  hero: {
    eyebrow: 'استودیو ویرا — فناوری خلاق',
    wordmark: 'ویرا',
    wordmarkAlt: 'Veyra',
    wordmarkAltLang: 'en',
    lead: 'تجربه‌های تعاملی و هنری برای وب می‌سازیم — و موتوری که ساختنشان را ممکن می‌کند.',
    ctaWork: 'آبعلی، نخستین نمونه‌کار',
    ctaEngine: 'آشنایی با موتور',
    scroll: 'ادامه',
  },
  statement: {
    kicker: 'سایت‌ساز نیست',
    lines: ['سایت‌ساز نیست.', 'قالب نیست.', 'موتوری است برای وب‌سایت‌هایی', 'که حرکت دارند.'],
    note: 'ویرا بخش‌های سخت و تکرارشوندهٔ ساختِ وب‌سایت‌های خلاق را بر عهده می‌گیرد — زمان، حرکت، اسکرول، حروف و نور — و کارگردانی هنری را کاملاً به خودِ پروژه می‌سپارد.',
  },
  engine: {
    kicker: 'موتور',
    title: 'هرچه حرکت می‌کند، روی یک حلقه.',
    intro: 'هستهٔ ویرا موتوری است با تایپ‌اسکریپت و بدون هیچ وابستگی در زمان اجرا. هر نمونهٔ زیر، همین موتور است که در این صفحه کار می‌کند.',
    caps: [
      { id: 'loop', no: '۰۱', title: 'یک حلقهٔ فریم', body: 'ورودی، اسکرول، چیدمان، حرکت و رندر به ترتیب، درون یک requestAnimationFrame اجرا می‌شوند. وقتی صفحه را ترک کنید می‌ایستد، و اگر یک افکت خراب شود بقیه از کار نمی‌افتند.' },
      { id: 'motion', no: '۰۲', title: 'حرکت با فیزیک', body: 'خط‌زمان‌های قابل پیمایش برای طراحی حرکت؛ فنرهای تحلیلی که در ۳۰ یا ۲۴۰ هرتز همان‌قدر دقیق‌اند.', hint: 'نقطه را بکشید و رها کنید.' },
      { id: 'scroll', no: '۰۳', title: 'اسکرول، مثل روایت', body: 'اسکرولِ بومی مرورگر، نرم‌شده؛ چسبندگی، صفحه‌کلید، جست‌وجو و صفحه‌خوان همچنان کار می‌کنند. صحنه‌ها موقعیت را به پیشرفت تبدیل می‌کنند.' },
      { id: 'type', no: '۰۴', title: 'هر خطی، هر جهتی', body: 'فارسی را حرف‌به‌حرف متحرک کنید و حروف به هم چسبیده می‌مانند. متنِ ترکیبیِ فارسی و انگلیسی هم ترتیبش را حفظ می‌کند.' },
      { id: 'quality', no: '۰۵', title: 'تطبیق‌پذیر از پایه', body: 'موتور زمانِ واقعیِ فریم‌ها را می‌سنجد و کیفیت و تراکمِ پیکسل را با دستگاهی که در دست دارید هماهنگ می‌کند.' },
      { id: 'webgl', no: '۰۶', title: 'WebGL، هر جا که لازم است', body: 'لایه‌ای اختیاری برای three.js روی همان حلقه: دوربینی هم‌مقیاس با پیکسل، اشیایی گره‌خورده به چیدمان صفحه، و متنِ واقعیِ HTML که به بافت تبدیل می‌شود.' },
    ],
    live: { fps: 'فریم بر ثانیه', frame: 'زمان فریم', quality: 'کیفیت', dpr: 'تراکم پیکسل', refresh: 'نمایشگر', tiers: { low: 'پایین', medium: 'متوسط', high: 'بالا' } },
    springHint: 'نقطه را بکشید و رها کنید.',
    springLabel: 'نقطهٔ فنری؛ با کلیدهای جهت تکانش دهید',
    typeSample: 'خنکی صدا دارد.',
    typeNaive: 'تقسیمِ ساده',
    typeVeyra: 'تقسیمِ ویرا',
    scrollProgress: 'پیشرفتِ همین بخش',
  },
  next: {
    kicker: 'تازه‌های نسخهٔ ۰٫۲',
    title: 'راه‌های تازه برای حرکت.',
    intro: 'هر قابِ این ردیف، نسخهٔ تازه را در حالِ کار نشان می‌دهد — خودِ ردیف هم: به پایین اسکرول کنید تا به پهلو حرکت کند.',
    direction: 'در صفحه‌های فارسی و عربی ردیف به سمتِ راست می‌رود تا قاب‌ها به ترتیبِ خواندن، از راست به چپ، از راه برسند؛ در صفحه‌های انگلیسی و ترکی برعکس.',
    panels: [
      { id: 'kashida', api: 'kashida()', title: 'کشیده، کششِ خوشنویس', body: 'واژه‌ها همان‌جایی کشیده می‌شوند که خوشنویس می‌کشد: اول بعد از سین و شین، بعد روی آخرین اتصال؛ هرگز درونِ «لا» و هرگز از روی نیم‌فاصله.' },
      { id: 'drag', api: 'draggable()', title: 'پرتابش کنید', body: 'اینرسی، لبه‌هایی که پس می‌زنند، و جاهایی برای نشستن که شتابِ پرتاب را از دست نمی‌دهند. کلیدهای جهت، کارت به کارت جابه‌جا می‌کنند.' },
      { id: 'flip', api: 'flip()', title: 'چیدمانی که سفر می‌کند', body: 'چیدمان را هر طور خواستید عوض کنید؛ هر عنصر از جای قبلی‌اش تا جای تازه می‌لغزد.' },
      { id: 'pointer', api: 'magnetic() · tilt()', title: 'چیزهایی که به سمتتان خم می‌شوند', body: 'دکمه‌های آهنربایی و کارت‌هایی که کج می‌شوند، با حرکتی فنری. روی صفحه‌های لمسی و در حالتِ «حرکتِ کمتر» خاموش‌اند.' },
      { id: 'scramble', api: 'scrambleText()', title: 'رمزگشایی', body: 'متن از دلِ حروفِ تصادفیِ خطِ خودش بیرون می‌آید: فارسی با حروفِ فارسی می‌لرزد و پیوسته می‌ماند.' },
      { id: 'noise', api: '@veyra/core/glsl', title: 'نویز و نور', body: 'نویزِ تکرارپذیر برای حرکت‌های طبیعی، و قطعه‌های آمادهٔ GLSL — نویز، میدان‌های فاصله، رنگِ OKLab — برای شیدرهایی مثل همین.' },
    ],
    kashidaSample: 'کشیده بنویس',
    kashidaLabel: 'کشش',
    dragCards: ['پرتاب', 'گرفتن', 'مقاومت', 'نشستن', 'گام', 'آرامش'],
    dragLabel: 'کارت‌ها. با کلیدهای جهت جابه‌جا کنید.',
    flipShuffle: 'بُر بزن',
    magnet: 'کدش را ببینید',
    tiltCard: 'به سمتِ شما خم می‌شود',
    scrambleLines: ['حرف به حرف، رمزگشایی', 'Decoded, letter by letter'],
    replay: 'دوباره',
    noWebgl: 'این مرورگر WebGL2 ندارد.',
    marquee: 'ویرا ۰٫۲ — اسکرولِ افقی · کشیده · پرتاب و اینرسی · فلیپ · آهنربا · رمزگشایی · نویز · GLSL —',
  },
  work: {
    kicker: 'کارها',
    case: 'نمونه‌کار ۰۰۱',
    title: 'آبعلی',
    tagline: 'خنکی صدا دارد.',
    body: 'طرحی مفهومی، فارسی و راست‌به‌چپ برای دوغ گازدارِ آبعلی. خنکی صدا دارد؛ باز کردنِ یک آبعلیِ سرد چند صداست: دربازکن که درِ تاجی را بلند می‌کند، گازی که بیرون می‌زند، قلپِ اول و «آخیش». فیلم همین صداها را با اسکرول کش می‌دهد: بطری‌ای که از روی عکس‌های محصولِ واقعی ساخته شده، دری که می‌پرد و روی زمین می‌افتد، کفی که سر می‌رود و برفِ کوه‌های آبعلی می‌شود، و سفره‌ای که بشقاب‌به‌بشقاب چیده می‌شود.',
    facts: [
      ['زبان', 'فارسی، راست‌به‌چپ'],
      ['ساخته‌شده با', 'هستهٔ ویرا ۰٫۴ و three.js'],
      ['تصویرها', 'همه زنده با کد ساخته می‌شوند؛ بی‌عکس، بی‌فایلِ سه‌بعدی'],
      ['صدا', 'ساخته‌شده با کد، اختیاری'],
    ],
    cta: 'تجربه را باز کنید',
    source: 'کد منبع',
    disclaimer: 'طرحی مستقل و غیررسمی؛ بدون ارتباط با تولیدکنندهٔ دوغ آبعلی.',
  },
  studio: {
    kicker: 'استودیو',
    title: 'یک استودیو، یک موتور، و کارهایی که میانِ این دو ساخته می‌شوند.',
    parts: [
      { name: 'استودیو', body: 'برای برندها و روایت‌ها تجربه می‌سازد — کارزارهای تبلیغاتی، معرفیِ محصول، جهان‌هایی که می‌شود در آن‌ها اسکرول کرد.' },
      { name: 'موتور', body: 'چیزی است که می‌ماند. هر پروژه بهترین ایده‌هایش را، به‌شکلِ متن‌باز، به هستهٔ ویرا برمی‌گرداند.' },
      { name: 'نمونه‌کارها', body: 'گواه‌اند: کارهایی عمومی که موتور را به جایی می‌برند که پیش‌تر نبوده.' },
    ],
    principlesTitle: 'چطور می‌سازیم',
    principles: [
      { name: 'کیفیتِ ساخت، پیش از تعدادِ امکانات', body: 'چند چیز، اما بی‌نقص.' },
      { name: 'حرکت با معنا', body: 'هر حرکتی چیزی را توضیح می‌دهد.' },
      { name: 'اول، امکاناتِ بومی', body: 'مرورگر خودش اسکرول می‌کند، رندر می‌کند و متن را می‌خواند؛ ما روی همین می‌سازیم.' },
      { name: 'هر خطی، هر جهتی', body: 'فارسی و عربی طراحی می‌شوند، نه آینه.' },
      { name: 'کارایی، بخشی از طراحی', body: 'یک فریمِ جاافتاده، یک جزئیاتِ خراب است.' },
      { name: 'دسترس‌پذیر از پایه', body: 'حرکتِ کمتر برای هر که بخواهد، متنِ واقعی، مسیرِ صفحه‌کلید.' },
    ],
  },
  start: {
    kicker: 'متن‌باز',
    title: 'با یک صحنه شروع کنید.',
    body: 'هستهٔ ویرا با مجوز MIT منتشر شده. راهنما را بخوانید، نمونه‌ها را اجرا کنید و چیزی بسازید که حرکت دارد.',
    cta: 'هستهٔ ویرا در گیت‌هاب',
    docs: 'خواندنِ راهنما',
  },
  footer: { made: 'ساخته‌شده با ویرا، به فارسی، انگلیسی، عربی و ترکی.', rights: '© ۲۰۲۶ استودیو ویرا', top: 'بازگشت به بالا', links: 'پیوندها' },
  notFound: { title: 'یک رشتهٔ گم‌شده.', body: 'این صفحه وجود ندارد — یا هنوز نه.', home: 'بازگشت به استودیو' },
  langName: 'فارسی',
  langShort: 'فا',
  langHint: 'این صفحه به فارسی هم هست',
  close: 'بستن',
}

export const ar: Content = {
  lang: 'ar',
  dir: 'rtl',
  meta: {
    title: 'استوديو فيرا — محرّك للويب المتحرّك',
    description:
      'يصنع استوديو فيرا تجارب ويب غامرة بتوجيه فني — ويصنع فيرا، محرّك تجارب الويب الإبداعية مفتوح المصدر الذي يجعل هذه التجارب ممكنة.',
    ogLocale: 'ar_AR',
  },
  skip: 'تخطَّ إلى المحتوى',
  nav: { engine: 'المحرّك', work: 'الأعمال', studio: 'الاستوديو', source: 'الشيفرة المصدرية', menu: 'الرئيسية', home: 'استوديو فيرا، الصفحة الرئيسية', languages: 'اللغة' },
  hero: {
    eyebrow: 'استوديو فيرا — تقنية إبداعية',
    wordmark: 'فيرا',
    wordmarkAlt: 'Veyra',
    wordmarkAltLang: 'en',
    lead: 'نصنع تجارب ويب غامرة بتوجيه فني — ونصنع المحرّك الذي يجعلها ممكنة.',
    ctaWork: 'آبعلي، أول أعمالنا',
    ctaEngine: 'تعرّف إلى المحرّك',
    scroll: 'تابِع',
  },
  statement: {
    kicker: 'ليس منشئ مواقع',
    lines: ['ليس منشئ مواقع.', 'وليس قالبًا.', 'بل محرّك لمواقع', 'تتحرّك.'],
    note: 'يتولّى فيرا الأجزاء الصعبة والقابلة لإعادة الاستخدام في التطوير الإبداعي — الزمن والحركة والتمرير والحروف والضوء — ويترك التوجيه الفني كاملًا للمشروع نفسه.',
  },
  engine: {
    kicker: 'المحرّك',
    title: 'كل ما يتحرّك، على حلقة واحدة.',
    intro: 'نواة فيرا محرّك مكتوب بلغة TypeScript بلا أي اعتماديات وقت التشغيل. كل عرض أدناه هو المحرّك نفسه يعمل في هذه الصفحة.',
    caps: [
      { id: 'loop', no: '٠١', title: 'حلقة إطارات واحدة', body: 'الإدخال والتمرير والتخطيط والحركة والعرض تجري في مراحل مرتّبة داخل requestAnimationFrame واحد. تتوقّف حين تغادر الصفحة، وتصمد إن تعطّل أحد المؤثرات.' },
      { id: 'motion', no: '٠٢', title: 'حركة بقوانين الفيزياء', body: 'خطوط زمنية يمكن التنقّل فيها لتصميم الحركة، ونوابض تحليلية تبقى دقيقة على ٣٠ هرتز أو ٢٤٠ هرتز.', hint: 'اسحب النقطة ثم أفلتها.' },
      { id: 'scroll', no: '٠٣', title: 'التمرير كقصّة', body: 'التمرير الأصلي للمتصفّح، أكثر نعومة — العناصر اللاصقة ولوحة المفاتيح والبحث في الصفحة وقارئات الشاشة كلها تظلّ تعمل. والمشاهد تحوّل الموضع إلى تقدّم.' },
      { id: 'type', no: '٠٤', title: 'كل خطّ، كل اتجاه', body: 'حرّك العربية حرفًا حرفًا وتبقى الحروف متّصلة. والنص الذي يمزج العربية بالإنجليزية يحافظ على ترتيبه.' },
      { id: 'quality', no: '٠٥', title: 'متكيّف من الأساس', body: 'يقيس المحرّك أزمنة الإطارات الفعلية ويضبط الجودة وكثافة البكسلات بحسب الجهاز الذي بين يديك.' },
      { id: 'webgl', no: '٠٦', title: 'WebGL حيث يلزم', body: 'طبقة اختيارية لـ three.js على الحلقة نفسها: كاميرا بمقياس البكسل، وأجسام مثبّتة على تخطيط الصفحة، ونصوص HTML حقيقية تُنسخ إلى خامات.' },
    ],
    live: { fps: 'إطار/ثانية', frame: 'زمن الإطار', quality: 'الجودة', dpr: 'كثافة البكسل', refresh: 'الشاشة', tiers: { low: 'منخفضة', medium: 'متوسطة', high: 'عالية' } },
    springHint: 'اسحب النقطة ثم أفلتها.',
    springLabel: 'نقطة نابضية؛ حرّكها بمفاتيح الأسهم',
    typeSample: 'للانتعاش صوت.',
    typeNaive: 'تقسيم ساذج',
    typeVeyra: 'تقسيم فيرا',
    scrollProgress: 'تقدّم هذا القسم',
  },
  next: {
    kicker: 'جديد الإصدار ٠٫٢',
    title: 'طرق أكثر للحركة.',
    intro: 'كل لوح في هذا الصف هو الإصدار الجديد قيد العمل — والصف نفسه كذلك: مرّر إلى الأسفل فيتحرّك جانبيًا.',
    direction: 'في الصفحتين العربية والفارسية يتّجه الصف نحو اليمين لتصل الألواح بترتيب القراءة، من اليمين إلى اليسار؛ وفي الإنجليزية والتركية بالعكس.',
    panels: [
      { id: 'kashida', api: 'kashida()', title: 'الكشيدة، مدّ الخطّاط', body: 'تمتدّ الكلمات حيث يمدّها الخطّاط: بعد السين والشين أولًا، ثم على آخر اتصال — لا داخل «لا» أبدًا، ولا عبر محرف منع الوصل.' },
      { id: 'drag', api: 'draggable()', title: 'ارمِها', body: 'قصور ذاتي، وحوافّ تقاوم، ونقاط استقرار تحافظ على سرعة الرمية. ومفاتيح الأسهم تنقل بطاقة واحدة في كل مرة.' },
      { id: 'flip', api: 'flip()', title: 'تخطيطات تسافر', body: 'غيّر التخطيط كما تشاء؛ ينزلق كل عنصر من حيث كان إلى حيث يستقرّ.' },
      { id: 'pointer', api: 'magnetic() · tilt()', title: 'أشياء تميل نحوك', body: 'أزرار مغناطيسية وبطاقات تميل، على نوابض. تتوقّف على الشاشات اللمسية وفي وضع تقليل الحركة.' },
      { id: 'scramble', api: 'scrambleText()', title: 'فكّ الرموز', body: 'يخرج النص من ضجيج حروف خطّه ثم يستقرّ: العربية ترتعش بحروف عربية وتبقى متّصلة.' },
      { id: 'noise', api: '@veyra/core/glsl', title: 'ضجيج وضوء', body: 'ضجيج قابل للتكرار من بذرة لحركة عضوية، ولبنات GLSL جاهزة — ضجيج وحقول مسافة وألوان OKLab — لمظلِّلات مثل هذا.' },
    ],
    kashidaSample: 'سطر ممدود',
    kashidaLabel: 'المدّ',
    dragCards: ['رمي', 'التقاط', 'مقاومة', 'استقرار', 'خطوة', 'سكون'],
    dragLabel: 'بطاقات. استخدم مفاتيح الأسهم للتنقّل.',
    flipShuffle: 'اخلط',
    magnet: 'شاهد الشيفرة',
    tiltCard: 'تميل نحوك',
    scrambleLines: ['فك الرموز، حرف بعد حرف', 'Decoded, letter by letter'],
    replay: 'أعِد',
    noWebgl: 'هذا المتصفّح لا يدعم WebGL2.',
    marquee: 'فيرا ٠٫٢ — تمرير أفقي · كشيدة · سحب وقصور ذاتي · FLIP · مغناطيس · فكّ الرموز · ضجيج · GLSL —',
  },
  work: {
    kicker: 'الأعمال',
    case: 'العمل ٠٠١',
    title: 'آبعلي',
    tagline: 'للانتعاش صوت.',
    body: 'تصوّر لحملة فارسية من اليمين إلى اليسار لـ«دوغ آبعلي»، مشروب اللبن الغازي في زجاجة. للانتعاش صوت — وفتح زجاجة آبعلي باردة حفنة من الأصوات: الفتّاحة وهي تنتزع الغطاء المعدني، والغاز وهو يفلت، والرشفات الأولى، وتنهيدة الارتياح. يمدّ الفيلم هذه الأصوات على امتداد التمرير: زجاجة أُعيد بناؤها من صور الزجاجة الحقيقية، وغطاء يقفز ويرتطم بالأرض، ورغوة تفيض فتصير ثلجًا على الجبال المحيطة بآبعلي، وسفرة تمتلئ طبقًا بعد طبق.',
    facts: [
      ['اللغة', 'الفارسية، من اليمين إلى اليسار'],
      ['بُني بـ', 'نواة فيرا ٠٫٤ و three.js'],
      ['الصور', 'كلها تُولَّد حيًّا — بلا صور فوتوغرافية ولا ملفات نماذج'],
      ['الصوت', 'مُركَّب بالشيفرة، اختياري'],
    ],
    cta: 'افتح التجربة',
    source: 'الشيفرة المصدرية',
    disclaimer: 'تصوّر مستقل وغير رسمي، لا صلة له بالشركة المصنّعة لـ«دوغ آبعلي».',
  },
  studio: {
    kicker: 'الاستوديو',
    title: 'استوديو، ومحرّك، والعمل الذي بينهما.',
    parts: [
      { name: 'الاستوديو', body: 'يصنع تجارب للعلامات التجارية والحكايات — حملات، وإطلاقات منتجات، وعوالم يمكن التمرير عبرها.' },
      { name: 'المحرّك', body: 'هو ما يبقى. يعيد كل مشروع أفضل أفكاره إلى نواة فيرا، علنًا وبمصدر مفتوح.' },
      { name: 'الأعمال', body: 'هي البرهان: أعمال علنية تأخذ المحرّك إلى حيث لم يذهب من قبل.' },
    ],
    principlesTitle: 'كيف نبني',
    principles: [
      { name: 'الإتقان قبل كثرة الميزات', body: 'أشياء قليلة، مُنجزة بإتقان.' },
      { name: 'حركة لها معنى', body: 'كل حركة تشرح شيئًا.' },
      { name: 'الأصلي أولًا', body: 'المنصّة تمرّر وترسم وتقرأ بصوت عالٍ أصلًا، ونحن نبني على ذلك.' },
      { name: 'كل خطّ، كل اتجاه', body: 'العربية والفارسية تُصمَّمان، لا تُعكَسان.' },
      { name: 'الأداء جزء من التصميم', body: 'الإطار الضائع تفصيلة مكسورة.' },
      { name: 'متاح للجميع من الأساس', body: 'حركة أقل لمن يشاء، ونص حقيقي، ومسارات للوحة المفاتيح.' },
    ],
  },
  start: {
    kicker: 'مفتوح المصدر',
    title: 'ابدأ بمسرح.',
    body: 'نواة فيرا مرخّصة بموجب MIT. اقرأ الدليل، وشغّل الأمثلة، وابنِ شيئًا يتحرّك.',
    cta: 'نواة فيرا على GitHub',
    docs: 'اقرأ الدليل',
  },
  footer: { made: 'صُنع بفيرا، بالعربية والفارسية والإنجليزية والتركية.', rights: '© ٢٠٢٦ استوديو فيرا', top: 'العودة إلى الأعلى', links: 'روابط' },
  notFound: { title: 'خيط ضائع.', body: 'هذه الصفحة غير موجودة — أو ليس بعد.', home: 'العودة إلى الاستوديو' },
  langName: 'العربية',
  langShort: 'ع',
  langHint: 'هذه الصفحة متوفّرة بالعربية أيضًا',
  close: 'إغلاق',
}

export const tr: Content = {
  lang: 'tr',
  dir: 'ltr',
  meta: {
    title: 'Veyra Studio — hareket eden web için bir motor',
    description:
      'Veyra Studio sürükleyici, sanat yönetmenliğiyle şekillenen web deneyimleri tasarlar — ve bunları mümkün kılan açık kaynaklı yaratıcı web deneyimi motoru Veyra’yı geliştirir.',
    ogLocale: 'tr_TR',
  },
  skip: 'İçeriğe geç',
  nav: { engine: 'Motor', work: 'İşler', studio: 'Stüdyo', source: 'Kaynak', menu: 'Ana menü', home: 'Veyra Studio, ana sayfa', languages: 'Dil' },
  hero: {
    eyebrow: 'Veyra Studio — yaratıcı teknoloji',
    wordmark: 'Veyra',
    wordmarkAlt: 'ویرا',
    wordmarkAltLang: 'fa',
    lead: 'Sürükleyici, sanat yönetmenliğiyle şekillenen web deneyimleri yapıyoruz — ve onları mümkün kılan motoru.',
    ctaWork: 'İlk vitrin işimiz: Abali',
    ctaEngine: 'Motorla tanışın',
    scroll: 'Kaydırın',
  },
  statement: {
    kicker: 'Site oluşturucu değil',
    lines: ['Site oluşturucu değil.', 'Şablon değil.', 'Hareket eden siteler', 'için bir motor.'],
    note: 'Veyra, yaratıcı geliştirmenin zor ve yeniden kullanılabilir kısımlarını üstlenir — zaman, hareket, kaydırma, yazı ve ışık — sanat yönetmenliğini ise tamamen projeye bırakır.',
  },
  engine: {
    kicker: 'Motor',
    title: 'Hareket eden her şey, tek bir döngüde.',
    intro: 'Veyra Core, çalışma zamanında hiçbir bağımlılığı olmayan bir TypeScript motorudur. Aşağıdaki her demo, bu sayfada çalışan motorun ta kendisidir.',
    caps: [
      { id: 'loop', no: '01', title: 'Tek kare döngüsü', body: 'Girdi, kaydırma, yerleşim, hareket ve çizim; tek bir requestAnimationFrame içinde sıralı aşamalarla çalışır. Sayfadan ayrıldığınızda durur, bir efekt çökse de ayakta kalır.' },
      { id: 'motion', no: '02', title: 'Fizikle hareket', body: 'Koreografi için ileri geri sarılabilen zaman çizelgeleri; 30 Hz’de de 240 Hz’de de aynı kesinlikte kalan analitik yaylar.', hint: 'Noktayı sürükleyin. Bırakın.' },
      { id: 'scroll', no: '03', title: 'Hikâye gibi kaydırma', body: 'Tarayıcının kendi kaydırması, yumuşatılmış hâliyle — yapışkan öğeler, klavye, sayfada bul ve ekran okuyucular çalışmaya devam eder. Sahneler konumu ilerlemeye dönüştürür.' },
      { id: 'type', no: '04', title: 'Her yazı, her yön', body: 'Farsçayı ve Arapçayı harf harf canlandırın; harfler birbirine bağlı kalır. Latin ve Arap harflerini karıştıran metin de sırasını korur.' },
      { id: 'quality', no: '05', title: 'Baştan uyarlanabilir', body: 'Motor gerçek kare sürelerini ölçer; kaliteyi ve piksel yoğunluğunu elinizdeki cihaza göre ayarlar.' },
      { id: 'webgl', no: '06', title: 'Gerektiği yerde WebGL', body: 'Aynı döngü üzerinde isteğe bağlı bir three.js katmanı: piksel ölçekli bir kamera, yerleşime bağlı nesneler ve dokulara aktarılan gerçek HTML.' },
    ],
    live: { fps: 'fps', frame: 'kare', quality: 'kalite', dpr: 'piksel oranı', refresh: 'ekran', tiers: { low: 'düşük', medium: 'orta', high: 'yüksek' } },
    springHint: 'Noktayı sürükleyin. Bırakın.',
    springLabel: 'Yaylı nokta — ok tuşlarıyla dürtün',
    typeSample: 'خنکی صدا دارد.',
    typeNaive: 'Basit bölme',
    typeVeyra: 'Veyra ile bölme',
    scrollProgress: 'Bu bölümün ilerlemesi',
  },
  next: {
    kicker: 'Sürüm 0.2’de yeni',
    title: 'Hareket etmenin yeni yolları.',
    intro: 'Bu satırdaki her panel, yeni sürümün iş başındaki hâli — satırın kendisi de öyle: aşağı kaydırın, yana doğru ilerlesin.',
    direction: 'Farsça ve Arapça sayfalarda ters yöne, sağa doğru ilerler; böylece paneller yine okuma sırasıyla gelir.',
    panels: [
      { id: 'kashida', api: 'kashida()', title: 'Keşide, hattatın uzatması', body: 'Farsça kelimeler, bir hattatın uzatacağı yerden uzar: önce sin ve şın harflerinden sonra, ardından son bağlantıda — asla lamelif’in içinde, asla bir ZWNJ’nin üzerinden değil.' },
      { id: 'drag', api: 'draggable()', title: 'Fırlatın', body: 'Eylemsizlik, geri iten kenarlar ve fırlatmanın hızını koruyan durma noktaları. Ok tuşları kartları birer birer kaydırır.' },
      { id: 'flip', api: 'flip()', title: 'Yolculuk eden yerleşimler', body: 'Yerleşimi dilediğiniz gibi değiştirin; her öğe bulunduğu yerden varacağı yere süzülür.' },
      { id: 'pointer', api: 'magnetic() · tilt()', title: 'Size doğru eğilenler', body: 'Yaylarla çalışan mıknatıslı düğmeler ve eğilen kartlar. Dokunmatik ekranlarda ve azaltılmış hareket tercihinde kapanırlar.' },
      { id: 'scramble', api: 'scrambleText()', title: 'Şifre çözme', body: 'Metin, kendi yazısının gürültüsünden süzülüp yerine oturur: Farsça, Farsça harflerle titrer ve bitişik kalır.' },
      { id: 'noise', api: '@veyra/core/glsl', title: 'Gürültü ve ışık', body: 'Organik hareket için tohumlu gürültü ve bunun gibi gölgelendiriciler için GLSL yapı taşları — gürültü, mesafe alanları, OKLab renk.' },
    ],
    kashidaSample: 'کشیده بنویس',
    kashidaLabel: 'Uzat',
    dragCards: ['Fırlat', 'Yakala', 'Diren', 'Otur', 'Adım', 'Dinlen'],
    dragLabel: 'Kartlar. Taşımak için ok tuşlarını kullanın.',
    flipShuffle: 'Karıştır',
    magnet: 'Koda bakın',
    tiltCard: 'Size doğru eğilir',
    scrambleLines: ['Harf harf çözülüyor', 'حرف به حرف، رمزگشایی'],
    replay: 'Tekrar',
    noWebgl: 'Bu tarayıcı WebGL2 sunmuyor.',
    marquee: 'Veyra 0.2 — yatay bölümler · keşide · sürükleme ve eylemsizlik · FLIP · mıknatıs · şifre çözme · gürültü · GLSL —',
  },
  work: {
    kicker: 'İşler',
    case: 'Proje 001',
    title: 'Abali',
    tagline: 'Serinliğin bir sesi var.',
    body: 'Cam şişedeki gazlı ayran Doogh Abali için Farsça, sağdan sola bir kampanya konsepti. Serinliğin bir sesi var — soğuk bir Abali’yi açmak bir avuç sestir: taç kapağı kaldıran açacak, kaçan gaz, ilk yudumlar, rahatlamış bir “oh”. Film bu sesleri kaydırmaya yayar: gerçek şişenin fotoğraflarından yeniden kurulmuş bir şişe, fırlayıp yere düşen bir kapak, taşan ve Abali’yi çevreleyen dağlarda kara dönüşen köpük ve tabak tabak dolan bir sofra.',
    facts: [
      ['Dil', 'Farsça, sağdan sola'],
      ['Yapım', 'Veyra Core 0.4 + three.js'],
      ['Görseller', 'Hepsi canlı üretiliyor — fotoğraf yok, model dosyası yok'],
      ['Ses', 'Sentezlenmiş, isteğe bağlı'],
    ],
    cta: 'Deneyimi açın',
    source: 'Kaynak',
    disclaimer: 'Bağımsız, resmî olmayan bir konsept. Doogh Abali üreticisiyle herhangi bir bağlantısı yoktur.',
  },
  studio: {
    kicker: 'Stüdyo',
    title: 'Bir stüdyo, bir motor ve ikisinin arasındaki iş.',
    parts: [
      { name: 'Stüdyo', body: 'markalar ve hikâyeler için deneyimler üretir — kampanyalar, lansmanlar, içinde kaydırarak gezilen dünyalar.' },
      { name: 'Motor', body: 'kalıcı olandır. Her proje en iyi fikirlerini açık kaynak olarak Veyra Core’a geri verir.' },
      { name: 'Vitrin işleri', body: 'kanıttır: motoru daha önce gitmediği yerlere taşıyan, herkese açık işler.' },
    ],
    principlesTitle: 'Nasıl inşa ediyoruz',
    principles: [
      { name: 'Özellikten önce zanaat', body: 'Az şey, kusursuzca bitirilmiş.' },
      { name: 'Anlamı olan hareket', body: 'Her hareket bir şey anlatır.' },
      { name: 'Önce yerel', body: 'Platform zaten kaydırıyor, çiziyor ve sesli okuyor. Biz onun üzerine kuruyoruz.' },
      { name: 'Her yazı, her yön', body: 'Farsça ve Arapça tasarlanır, aynalanmaz.' },
      { name: 'Performans tasarımdır', body: 'Kaçan bir kare, bozuk bir ayrıntıdır.' },
      { name: 'Varsayılan olarak erişilebilir', body: 'Azaltılmış hareket, gerçek metin, klavye yolları.' },
    ],
  },
  start: {
    kicker: 'Açık kaynak',
    title: 'Bir sahneyle başlayın.',
    body: 'Veyra Core MIT lisanslıdır. Kılavuzu okuyun, örnekleri çalıştırın, hareket eden bir şey yapın.',
    cta: 'GitHub’da Veyra Core',
    docs: 'Kılavuzu okuyun',
  },
  footer: { made: 'Veyra ile yapıldı; Türkçe, İngilizce, Farsça ve Arapça.', rights: '© 2026 Veyra Studio', top: 'Başa dön', links: 'Bağlantılar' },
  notFound: { title: 'Kopmuş bir iplik.', body: 'Bu sayfa yok — ya da henüz yok.', home: 'Stüdyoya dön' },
  langName: 'Türkçe',
  langShort: 'TR',
  langHint: 'Bu sayfa Türkçe olarak da var',
  close: 'Kapat',
}

export const content: Record<Lang, Content> = { en, fa, ar, tr }
export const paths: Record<Lang, string> = { en: '/', fa: '/fa/', ar: '/ar/', tr: '/tr/' }
