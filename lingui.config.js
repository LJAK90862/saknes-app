import { locales, sourceLocale } from './src/i18n/locales.js'

/** @type {import('@lingui/conf').LinguiConfig} */
const config = {
  sourceLocale,
  locales: [...locales],
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
}

export default config
