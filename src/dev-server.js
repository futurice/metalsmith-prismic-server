'use strict';

const metalsmith = require('./metalsmith');
const watch = require('metalsmith-watch');
const metalsmithExpress = require('metalsmith-express');
const open = require('open');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

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
    .destination(path.join(smith.directory(), 'builds', 'dev'))
    .build(err => {
      if (err) {
        throw err;
      }
    });

  if (config.open) {
    setTimeout(() => open('http://localhost:' + config.port + "/"), 1000);
  }
}

module.exports = dev;
