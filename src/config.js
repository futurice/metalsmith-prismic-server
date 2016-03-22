const env = require('process').env;
const prismic = require('metalsmith-prismic');

module.exports = {
  /**
   * The port to run the server on
   */
  port: env.PORT || 3000,

  /**
   * The port to host the liveReload js file and service on. (dev server only)
   */
  liveReloadPort: 3001,

  /**
   * whether or not to open a browser on the local machine on startup. (dev
   * server only)
   */
  open: env.OPEN_BROWSER === 'true' || !env.OPEN_BROWSER,

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
     * plugins used when building the master project
     */
    build: [],
    /**
     * plugins only used by the live production server
     */
    deploy: [],
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
   * link resolver (see: https://prismic.io/docs/link-resolver#?lang=node
   * and https://github.com/mbanting/metalsmith-prismic)
   * (optional)
   */
  linkResolver: null,

  /**
   * Metalsmith prismic plugin to use
   */
   prismic: prismic,

   /**
    * Do initial build/deploy when prod server starts.
    */
  doInitialBuild: true,
};
