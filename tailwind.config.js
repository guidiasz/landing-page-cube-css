const plugin = require('tailwindcss/plugin');
const postcss = require('postcss');
const postcssJs = require('postcss-js');

const clampGenerator = require('./src/css-utils/clamp-generator.js');
const tokensToTailwind = require('./src/css-utils/tokens-to-tailwind.js');

// Raw design tokens
const colorTokens = require('./src/design-tokens/colors.json');
const fontTokens = require('./src/design-tokens/fonts.json');
const spacingTokens = require('./src/design-tokens/spacing.json');
const textSizeTokens = require('./src/design-tokens/text-sizes.json');

// Process design tokens
const colors = tokensToTailwind(colorTokens.items);
const fontFamily = tokensToTailwind(fontTokens.items);
const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items));
const spacing = tokensToTailwind(clampGenerator(spacingTokens.items));

//simple design tokens
const fontWeight = {
  normal: 400,
  medium: 500,
  bold: 700,
};

const lineHeight = {
  tight: '1.2',
  normal: '1.6',
};

const measure = {
  long: '75ch',
  short: '65ch',
  compact: '35ch',
  title: '20ch',
};

const screens = {
  md: '53.4375em',
  lg: '80em',
};

module.exports = {
  content: ['./*.html', './src/**/*.{html,js,jsx,mdx,njk,twig,vue}'],
  presets: [],
  theme: {
    screens,
    colors,
    spacing,
    fontSize,
    fontFamily,
    fontWeight,
    lineHeight,
    measure,
    backgroundColor: ({ theme }) => theme('colors'),
    textColor: ({ theme }) => theme('colors'),
    margin: ({ theme }) => ({
      auto: 'auto',
      ...theme('spacing'),
    }),
    padding: ({ theme }) => theme('spacing'),
  },
  variantOrder: [
    'first',
    'last',
    'odd',
    'even',
    'visited',
    'checked',
    'empty',
    'read-only',
    'group-hover',
    'group-focus',
    'focus-within',
    'hover',
    'focus',
    'focus-visible',
    'active',
    'disabled',
  ],

  // Disables Tailwind's reset etc
  corePlugins: {
    preflight: false,
  },
  plugins: [
    // Generates custom property values from tailwind config
    plugin(function ({ addComponents, config }) {
      let result = '';

      const currentConfig = config();

      const groups = [
        { key: 'colors', prefix: 'color' },
        { key: 'spacing', prefix: 'space' },
        { key: 'fontSize', prefix: 'size' },
        { key: 'fontFamily', prefix: 'font' },
        { key: 'fontWeight', prefix: 'weight' },
        { key: 'measure', prefix: 'measure' },
        { key: 'lineHeight', prefix: 'leading' },
      ];

      groups.forEach(({ key, prefix }) => {
        const group = currentConfig.theme[key];

        if (!group) {
          return;
        }

        Object.keys(group).forEach((key) => {
          result += `--${prefix}-${key}: ${group[key]};`;
        });
      });

      addComponents({
        ':root': postcssJs.objectify(postcss.parse(result)),
      });
    }),

    // Generates custom utility classes
    plugin(function ({ addUtilities, config }) {
      const currentConfig = config();
      const customUtilities = [
        { key: 'spacing', prefix: 'flow-space', property: '--flow-space' },
        { key: 'spacing', prefix: 'gutter', property: '--gutter' },
        { key: 'spacing', prefix: 'gap-y', property: 'row-gap' },
        // { key: 'colors', prefix: 'spot-color', property: '--spot-color' },
      ];

      customUtilities.forEach(({ key, prefix, property }) => {
        const group = currentConfig.theme[key];

        if (!group) {
          return;
        }

        Object.keys(group).forEach((key) => {
          addUtilities({
            [`.${prefix}-${key}`]: postcssJs.objectify(postcss.parse(`${property}: ${group[key]}`)),
          });
        });
      });
    }),
  ],
};
