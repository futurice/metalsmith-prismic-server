'use strict';

const metalsmith = require('./metalsmith');
const watch = require('metalsmith-watch');
const metalsmithExpress = require('metalsmith-express');
const open = require('open');
const fs = require('fs');
const path = require('path');

const DEAFULT_CONFIG = {
  port: 3000,
  liveReloadPort: 3001,
  open: true,
  buildPath: "./build",
  watchPaths: {
    'src/**/*': true
  },
};

function dev(config) {
  config = Object.assign({}, DEAFULT_CONFIG, config);

  const smith = metalsmith(config);
  smith
    .use(metalsmithExpress({
      port: config.port,
      liveReload: true,
      liveReloadPort: config.liveReloadPort,
    }))
    .use(watch({
      paths: config.watchPaths,
      livereload: config.liveReloadPort,
    }))
    .destination(path.join(config.buildPath, 'dev'))
    .build(err => {
      if (err) {
        throw err;
      } else if (config.open) {
        config.open = false;
        open('http://localhost:' + config.port + "/");
      }
    });
}

module.exports = dev;
