import { i18n } from '@lingui/core'
import { detect, fromUrl, fromStorage, fromNavigator } from '@lingui/detect-locale'
import { locales, sourceLocale } from './locales'

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi'])

function getDirection(locale) {
  return RTL_LOCALES.has(locale.split('-')[0]) ? 'rtl' : 'ltr'
}

export function detectLocale() {
  const detected = detect(fromUrl('lang'), fromStorage('saknes_lang'), fromNavigator())
  if (detected) {
    if (locales.includes(detected)) return detected
    // Regional fallback: es-MX → es
    const base = detected.split('-')[0]
    if (locales.includes(base)) return base
  }
  return sourceLocale
}

export async function loadCatalog(locale) {
  try {
    const { messages } = await import(`../locales/${locale}/messages.js`)
    i18n.loadAndActivate({ locale, messages })
  } catch (e) {
    console.error(`Failed to load "${locale}" catalog, falling back to "${sourceLocale}"`, e)
    const { messages } = await import(`../locales/${sourceLocale}/messages.js`)
    i18n.loadAndActivate({ locale: sourceLocale, messages })
  }
  document.documentElement.lang = i18n.locale
  document.documentElement.dir = getDirection(i18n.locale)
}

export function saveLocale(locale) {
  localStorage.setItem('saknes_lang', locale)
}

// Detect and load the user's preferred locale
loadCatalog(detectLocale())

export { i18n }
