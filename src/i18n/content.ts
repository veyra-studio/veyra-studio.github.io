/**
 * Site copy, written separately for each language (not machine-paired
 * line by line). Persian uses Persian digits, punctuation and ZWNJ.
 */

export type Lang = 'en' | 'fa'

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

export interface Content {
  lang: Lang
  dir: 'ltr' | 'rtl'
  meta: { title: string; description: string; ogLocale: string }
  skip: string
  nav: { engine: string; work: string; studio: string; source: string; switchLabel: string; switchTo: string; menu: string }
  hero: {
    eyebrow: string
    wordmark: string
    wordmarkAlt: string
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
    typeSample: string
    typeNaive: string
    typeVeyra: string
    scrollProgress: string
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
  footer: { made: string; rights: string; top: string }
  notFound: { title: string; body: string; home: string }
  langHint: string
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
  nav: { engine: 'Engine', work: 'Work', studio: 'Studio', source: 'Source', switchLabel: 'Read this page in Persian', switchTo: 'فا', menu: 'Main' },
  hero: {
    eyebrow: 'Veyra Studio — creative technology',
    wordmark: 'Veyra',
    wordmarkAlt: 'ویرا',
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
    typeSample: 'یک بطری کوه',
    typeNaive: 'Naive split',
    typeVeyra: 'Veyra split',
    scrollProgress: 'This section’s progress',
  },
  work: {
    kicker: 'Work',
    case: 'Case 001',
    title: 'Abali',
    tagline: 'A bottle of mountain.',
    body: 'A Persian, right-to-left campaign concept for Doogh Abali, the carbonated yogurt drink named after a place in the Alborz mountains. The bottle is built live in 3D; its label opens into a landscape; the fizz builds when you shake it.',
    facts: [
      ['Language', 'Persian, RTL'],
      ['Built with', 'Veyra Core + three.js'],
      ['Assets', 'All generated live — no photos'],
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
      { name: 'Every script, every direction', body: 'Persian is designed, not mirrored.' },
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
  footer: { made: 'Made with Veyra, in English and Persian.', rights: '© 2026 Veyra Studio', top: 'Back to top' },
  notFound: { title: 'A loose thread.', body: 'This page doesn’t exist — or not yet.', home: 'Back to the studio' },
  langHint: 'این صفحه به فارسی هم هست',
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
  nav: { engine: 'موتور', work: 'کارها', studio: 'استودیو', source: 'کد منبع', switchLabel: 'Read this page in English', switchTo: 'EN', menu: 'اصلی' },
  hero: {
    eyebrow: 'استودیو ویرا — فناوری خلاق',
    wordmark: 'ویرا',
    wordmarkAlt: 'Veyra',
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
    typeSample: 'یک بطری کوه',
    typeNaive: 'تقسیمِ ساده',
    typeVeyra: 'تقسیمِ ویرا',
    scrollProgress: 'پیشرفتِ همین بخش',
  },
  work: {
    kicker: 'کارها',
    case: 'نمونه‌کار ۰۰۱',
    title: 'آبعلی',
    tagline: 'یک بطری کوه.',
    body: 'طرحی مفهومی، فارسی و راست‌به‌چپ برای دوغ گازدار آبعلی؛ نوشیدنی‌ای که نامش را از جایی در البرز گرفته. بطری به‌صورت زنده و سه‌بعدی ساخته می‌شود، برچسبش به منظره باز می‌شود، و اگر تکانش بدهید گازش بالا می‌زند.',
    facts: [
      ['زبان', 'فارسی، راست‌به‌چپ'],
      ['ساخته‌شده با', 'هستهٔ ویرا و three.js'],
      ['تصویرها', 'همه زنده با کد ساخته می‌شوند'],
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
      { name: 'هر خطی، هر جهتی', body: 'فارسی طراحی می‌شود، نه آینه.' },
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
  footer: { made: 'ساخته‌شده با ویرا، به فارسی و انگلیسی.', rights: '© ۲۰۲۶ استودیو ویرا', top: 'بازگشت به بالا' },
  notFound: { title: 'یک رشتهٔ گم‌شده.', body: 'این صفحه وجود ندارد — یا هنوز نه.', home: 'بازگشت به استودیو' },
  langHint: 'This page is also in English',
}

export const content: Record<Lang, Content> = { en, fa }
export const paths: Record<Lang, string> = { en: '/', fa: '/fa/' }
