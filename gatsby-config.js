module.exports = {
  siteMetadata: {
    title: `Android APK Analzyer`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-102221700-2`,
      },
    }
  ],
}
