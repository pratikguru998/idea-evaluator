// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Idea Evaluator',
  tagline: 'Score a business idea on 28 criteria and see it through four perspectives.',
  favicon: 'img/logo.svg',
  future: {v4: true},
  // GitHub Pages: https://<user>.github.io/<repo>/  (override locally with BASE_URL=/)
  url: 'https://pratikguru998.github.io',
  baseUrl: process.env.BASE_URL || '/idea-evaluator/',
  organizationName: 'pratikguru998',
  projectName: 'idea-evaluator',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},
  i18n: {defaultLocale: 'en', locales: ['en']},
  // OAuth client ID for "Save to Google Drive" (public, not a secret). Without one the button explains how to set it up.
  customFields: {googleClientId: process.env.GOOGLE_CLIENT_ID || ''},
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {sidebarPath: './sidebars.js', showLastUpdateTime: false},
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {respectPrefersColorScheme: true},
      navbar: {
        title: 'Idea Evaluator',
        logo: {alt: 'Idea Evaluator', src: 'img/logo.svg'},
        items: [
          {to: '/', label: '📝 Evaluate', position: 'left', activeBaseRegex: '^/(idea-evaluator/?)?$'},
          {to: '/compare', label: '⚖️ Compare', position: 'left'},
          {to: '/docs/how-it-works', label: '📖 How it works', position: 'left'},
          {href: 'https://github.com/pratikguru998/idea-evaluator', label: 'GitHub', position: 'right'},
        ],
      },
      footer: {
        style: 'dark',
        copyright: 'Idea Evaluator · free, static, private. Your ideas stay in your browser unless you save them to your own Google Drive.',
      },
      prism: {theme: prismThemes.github, darkTheme: prismThemes.dracula},
    }),
};

export default config;
