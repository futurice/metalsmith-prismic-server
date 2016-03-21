const metalsmith = require('metalsmith');

function metalsmithPrismic (config, modes) {

  const smith = metalsmith(config.inputPath)
    .use(config.prismic({
      url: config.prismicUrl,
      accessToken: config.prismicToken,
      release: config.release,
      linkResolver: config.prismicLinkResolver
    }));

  const commonPlugins = config.plugins.common || [];

  commonPlugins.forEach(smith.use.bind(smith));
  if (typeof modes === 'string') {
    modes = [modes];
  }
  modes
    // get plugin objects
    .map(m => config.plugins[m] || [])
    // use them
    .forEach(plugins => plugins.forEach(smith.use.bind(smith)));

  return smith;
};

module.exports = metalsmithPrismic;
