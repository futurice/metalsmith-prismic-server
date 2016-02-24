const metalsmith = require('metalsmith');
const prismic = require('metalsmith-prismic');
const env = require('process').env;

const DEFAULT_CONFIG = {
  plugins: [],
  inputPath: "./",
  prismicUrl: env.PRISMIC_URL,
  prismicToken: env.PRISMIC_TOKEN,
  release: 'master',
  linkResolver: null // required
};

function metalsmithPrismic (config) {
  config = Object.assign({}, DEFAULT_CONFIG, config);

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
