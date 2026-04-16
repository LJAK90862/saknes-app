import { useLingui } from '@lingui/react'
import { loadCatalog, saveLocale } from '../i18n/i18n'
import { locales } from '../i18n/locales'

export default function LanguageSwitcher() {
  const { i18n } = useLingui()

  async function switchLocale() {
    const currentIndex = locales.indexOf(i18n.locale)
    const nextLocale = locales[(currentIndex + 1) % locales.length]
    await loadCatalog(nextLocale)
    saveLocale(nextLocale)
  }

  const nextLabel = i18n.locale === 'lv' ? 'EN' : 'LV'

  return (
    <button className="lang-toggle" onClick={switchLocale}>
      {nextLabel}
    </button>
  )
}
