const metalsmith = require('metalsmith');
const prismic = require('metalsmith-prismic');

function metalsmithPrismic (config, mode) {

  const smith = metalsmith(config.inputPath)
    .use(prismic({
      url: config.prismicUrl,
      accessToken: config.prismicToken,
      release: config.release,
      linkResolver: config.linkResolver
    }));

  const commonPlugins = config.plugins.common || [];
  const modePlugins = config.plugins[mode] || [];

  commonPlugins.forEach(smith.use.bind(smith));
  modePlugins.forEach(smith.use.bind(smith));

  return smith;
};

module.exports = metalsmithPrismic;
