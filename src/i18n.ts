import english from './locales/en.json';

export type Language = 'en' | 'ko';
let language: Language = 'en';
export const getLanguage = () => language;
export const localeTag = () => (language === 'ko' ? 'ko-KR' : 'en-US');
export function setLanguage(value: Language) {
  language = value;
}
// Korean source messages are stable gettext-style keys; English is the default catalog.
// Stored exercise/routine IDs are never translated.
export function t(key: string, ...values: (string | number | undefined)[]): string {
  const template = language === 'ko' ? key : (english as Record<string, string>)[key];
  if (template === undefined) throw new Error(`Missing English translation: ${key}`);
  return template.replace(/\{(\d+)\}/g, (_, index) => String(values[Number(index)] ?? ''));
}
