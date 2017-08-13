import Typography from 'typography'


const typography = new Typography({
  baseFontSize: '22px',
  baseLineHeight: 1.45,
  headerFontFamily: ['Shadows Into Light', 'sans-serif'],
  bodyFontFamily: ['Open Sans', 'sans-serif'],
  googleFonts: [
    {
      name: 'Shadows Into Light',
      styles: [
        '400',
      ],
    },
    {
      name: 'Open Sans',
      styles: [
        '400',
      ],
    }
  ],
})

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography