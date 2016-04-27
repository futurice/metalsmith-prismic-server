'use strict';

const express = require('express');
const metalsmith = require('./metalsmith');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const request = require('request');
const replace = require('./metalsmith-replace');
const crypto = require('crypto');
const fs = require('fs');
const build = require('./build');
const Prismic = require('prismic.io');
const removeOldDirs = require('./remove-old-dirs');


const PRISMIC_SCRIPT =
  `<script async
           type="text/javascript"
           src="//static.cdn.prismic.io/prismic.min.js"></script>\n`;

const DEAFULT_CONFIG = require('./config');

function prod(config) {
  config = Object.assign({}, DEAFULT_CONFIG, config);


  function init() {
    const app = express();
    app.use(bodyParser.json());
    app.use('/builds', express.static(config.buildPath));

    buildRoute(app, config);
    previewRoute(app, config);

    app.listen(config.port);
  }

  if (config.doInitialBuild) {
    // do initial build
    build(config, ['build', 'deploy'], err => {
      if (err) {
        throw err;
      } else {
        init();
      }
    });
  } else {
    init();
  }
}

function reject(response, message) {
  console.error("Build rejected:", message);
  response.status(400).end();
}

function buildRoute(app, config) {
  app.post('/build', (req, res) => {
    // authenticate webhook secret
    if (config.prismicSecret !== req.body.secret) {
      reject(res, "mismatching secret");
    // API URL check will fail when Prismic CDN is used, so the check is removed
    } else {
      // complete immediately to avoid timeouts
      res.status(202).end();

      build(config, ['build', 'deploy'], err => {
        if (err) {
          console.error("Build Failed", err);
        } else {
          console.log("Build complete");
        }
      });
    }
  });
}

let previewCleanupInterval = null;

function previewRoute(app, config) {

  previewCleanupInterval = setInterval(
    () => {
      // need to qualify build path by input path to get direct access to
      // previews
      const previewsPath = metalsmith(config, 'preview')
        .destination(path.join(config.buildPath, 'preview'))
        .destination();
      removeOldDirs(previewsPath, config.previewAge, previewPath => {
        console.log(`preview expired and removed: ${previewPath}`);
      });
    },
    config.cleanupIntervalLength
  );

  app.get('/preview', (req, res) => {
    let token, hash;
    if (req.query.token) {
      token = req.query.token;
      const hashSum = crypto.createHash('sha1');
      hashSum.update(token);
      hash = hashSum.digest('hex');
    } else {
      token = hash = 'master';
    }

    const htmlFilter = replace.filenameExtensionFilter('html');

    const previewConfig = Object.assign({}, config, {release: token});

    const smith = metalsmith(previewConfig, 'preview')
      .destination(path.join(
        config.buildPath,
        'preview',
        hash
      ))
      .use(replace.replace(
        /href="\//g,
        `href=\"/builds/preview/${hash}/`,
        htmlFilter
      ));

    if (hash !== 'master') {
      smith.use(replace.replace(
        /<\/body>/g,
        PRISMIC_SCRIPT + '</body>',
        htmlFilter
      ))
    }

    smith.build(err => {
      if (err) {
        if (err.message.startsWith('Unexpected status code [404]')) {
          res.status(404).end();
        } else {
          console.error(err);
          res.status(500).end();
        }
      } else {
        console.log('Preview built: ', hash);

        Prismic.api(config.prismicUrl, (err, api) => {
          if (err) {
            console.error(err);
            res.status(500).end();
          } else {
            console.log("preview Session", token)
            api.previewSession(
              token,
              config.prismicLinkResolver,
              '/',
              (err, redirectUrl) => {
                console.log("setting cookie")
                if (err) {
                  console.error(err);
                }
                res.cookie('io.prismic.preview', token, {
                  httpOnly: false,
                  maxAge: config.previewAge,
                  path: `/builds/preview/${hash}`
                });
                let qualified = `/builds/preview/${hash}/`;
                if (redirectUrl) {
                  qualified = path.join(qualified, redirectUrl);
                }
                res.redirect(302, qualified);
              }
            )
          }
        }, config.prismicToken);
      }
    });
  });
}


module.exports = prod;
