export const locales = ['uz', 'ru', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'uz'
export function isLocale(value: string): value is Locale { return locales.includes(value as Locale) }
export function localized<T>(value: Record<Locale, T>, locale: Locale): T { return value[locale] }

