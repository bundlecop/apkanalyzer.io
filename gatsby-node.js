exports.modifyWebpackConfig = function({config, stage}) {
  config.loader('svgc', function(cfg) {
    cfg.test = /\.svgc$/
    cfg.loader = 'svg-react-loader'
    return cfg
  })
  return config
}
