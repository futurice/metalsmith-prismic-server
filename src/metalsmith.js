const metalsmith = require('metalsmith');
const prismic = require('metalsmith-prismic');

function metalsmithPrismic (config) {

  const smith = metalsmith(config.inputPath)
    .use(prismic({
      url: config.prismicUrl,
      accessToken: config.prismicToken,
      release: config.release,
      linkResolver: config.linkResolver
    }));

  config.plugins.forEach(smith.use.bind(smith));

  return smith;
};

module.exports = metalsmithPrismic;
