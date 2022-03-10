module.exports = {
  content: ['./.vitepress/theme/**/*.vue'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            }
          }
        }
      },
    },
  },
}
