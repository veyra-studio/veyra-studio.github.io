/**
 * Numbers written the way each language writes them: Persian and Arabic
 * use their own digits (they differ: ۴۵۶ / ٤٥٦) and the decimal separator
 * «٫»; Turkish uses the decimal comma. Safe to import on the client.
 */
type Lang = 'en' | 'fa' | 'ar' | 'tr'

const digitSets: Partial<Record<Lang, string>> = { fa: '۰۱۲۳۴۵۶۷۸۹', ar: '٠١٢٣٤٥٦٧٨٩' }
const decimal: Record<Lang, string> = { en: '.', fa: '٫', ar: '٫', tr: ',' }

export function localNumber(lang: Lang, value: string | number): string {
  let s = String(value).replace(/(\d)\.(?=\d)/g, `$1${decimal[lang]}`)
  const set = digitSets[lang]
  if (set) s = s.replace(/\d/g, (d) => set[Number(d)]!)
  return s
}

/** The page's language, read from <html lang>. */
export function pageLang(): Lang {
  const l = document.documentElement.lang
  return l === 'fa' || l === 'ar' || l === 'tr' ? l : 'en'
}
