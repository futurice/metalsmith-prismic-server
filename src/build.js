const metalsmith = require('./metalsmith')
const path = require('path');
const DEFAULT_CONFIG = require('./config');

function build(config, cb) {
  config = Object.assign({}, DEFAULT_CONFIG, config);
  metalsmith(config, 'build')
    .destination(path.join(config.buildPath, "master"))
    .build(cb);
}

module.exports = build;
