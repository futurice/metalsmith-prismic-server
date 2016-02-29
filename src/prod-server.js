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

const PRISMIC_SCRIPT =
  `<script async
           type="text/javascript"
           src="//static.cdn.prismic.io/prismic.min.js"></script>\n`;

const DEAFULT_CONFIG = require('./config');

function prod(config) {
  config = Object.assign({}, DEAFULT_CONFIG, config);

  const app = express();
  app.use(bodyParser.json())
  app.use('/builds', express.static(config.buildPath));

  buildRoute(app, config);
  previewRoute(app, config);

  app.listen(config.port);

  // do initial build
  request.post({
    url: `http://localhost:${config.port}/build`,
    json: {
      apiUrl: config.prismicUrl,
      secret: config.prismicSecret
    }
  });
}

function reject(response, message) {
  console.error("Build rejected:", message);
  response.status(400).end();
}

function buildRoute(app, config) {
  app.post('/build', (req, res) => {
    // authenticate api url and webhook secret
    if (config.prismicSecret !== req.body.secret) {
      reject(res, "mismatching secret");
    } else if (config.prismicUrl !== req.body.apiUrl) {
      reject(res, "mismatching api url");
    } else {
      build(config, err => {
        if (err) {
          console.error("Build Failed", err);
          reject(res, "compilation error");
          // should this throw err?
        } else {
          console.log("Build complete");
          res.status(200).end();
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
      removeExpiredPreviews(previewsPath);
    },
    config.previewAge / 2
  );

  app.get('/preview', (req, res) => {
    const token = req.query.token;
    const hashSum = crypto.createHash('sha1');
    hashSum.update(token);
    const hash = hashSum.digest('hex');

    const htmlFilter = replace.filenameExtensionFilter('html');

    metalsmith(config, 'preview')
      .destination(path.join(
        config.buildPath,
        'preview',
        hash
      ))
      .use(replace.replace(
        /href="\//g,
        `href=\"/builds/preview/${hash}/`,
        htmlFilter
      ))
      .use(replace.replace(
        /<\/body>/g,
        PRISMIC_SCRIPT + '</body>',
        htmlFilter
      ))
      .build(err => {
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
                  res.redirect(302, `/builds/preview/${hash}/${redirectUrl}`);
                }
              );
            }
          }, config.prismicToken);
        }
      });
  });
}

function removeExpiredPreviews(dir) {
  fs.readDirSync(dir).forEach(previewName => {
    const previewPath = path.join(dir, previewName);
    const lastModified = fs.statSync(previewPath).mtime;
    if (lastModified < Date.now() - config.previewAge) {
      fs.rmdir(previewPath, () => {
        console.log(`preview ${previewName} expired and removed`);
      });
    }
  });
}

module.exports = prod;
