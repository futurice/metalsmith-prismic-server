const env = require('process').env;

module.exports = {
  /**
   * The port to run the server on
   */
  port: env.PORT,

  /**
   * The port to host the liveReload js file and service on. (dev server only)
   */
  liveReloadPort: 3001,

  /**
   * whether or not to open a browser on the local machine on startup. (dev
   * server only)
   */
  open: true,

  /**
   * The root of the project
   */
  inputPath: './',

  /**
   * The output path of the project (relative to inputPath)
   */
  buildPath: 'builds',

  /**
   * Specification of files to watch for changes. (dev server only)
   */
  watchPaths: {
    'src/**/*': '**/*',
    'layouts/**/*': '**/*',
    'partials/**/*': '**/*'
  },

  /**
   * Expiration age of generated previews (in ms, prod server only)
   */
  previewAge: 1000 * 60 * 60,

  /**
   * Plugins for metalsmith
   */
  plugins: {
    /**
     * Plugins used by all pipelines
     */
    common: [],
    /**
     * Plugins only used for the dev server pipeline
     */
    dev: [],
    /**
     * plugins only used for the build task of the prod server
     */
    build: [],
    /**
     * plugins only used for the preview task of the prod server
     */
    preview: []
  },

  /**
   * Url of prismic repo api
   */
  prismicUrl: env.PRISMIC_URL,

  /**
   * prismic repo access token
   */
  prismicToken: env.PRISMIC_TOKEN,

  /**
   * prismic repo build webhook secret
   */
  prismicSecret: env.PRISMIC_SECRET,

  /**
   * prismic repo branch to build
   */
  release: 'master',

  /**
   * link resolver (see: https://prismic.io/docs/link-resolver#?lang=node)
   * (required)
   */
  linkResolver: null,
};
