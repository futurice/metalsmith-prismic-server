const express = require('express');
const metalsmith = require('./metalsmith');
const bodyParser = require('body-parser');
const path = require('path');

const DEAFULT_CONFIG = {
  port: 3000,
  buildPath: "./builds"
};

function prod(config) {
  config = Object.assign({}, DEAFULT_CONFIG, config);

  const app = express();
  app.use(bodyParser.json())
  app.use('/builds', express.static(config.buildPath));

  build(app, config);
  preview(app, config);

  app.listen(config.port);
}

function reject(response, message) {
  console.error("Build rejected:", message);
  response.status(400).end();
}

function build(app, config) {
  const smith = metalsmith(config);
  smith.destination(path.join(config.buildPath, "master"));

  app.post('/build', (req, res) => {
    // authenticate api url and webhook secret
    if (config.prismicSecret !== req.body.secret) {
      reject(res, "mismatching secret");
    } else if (config.prismicUrl !== req.body.apiUrl) {
      reject(res, "mismatching api url");
    } else {
      smith.build(err => {
        if (err) {
          console.error("Build Failed", err);
          reject(res, "compilation error");
          // should this throw err?
        } else {
          cconsole.log("Build complete");
          res.status(200).end();
        }
      });
    }
  });
}

function preview(app, config) {
  app.get('/preview', (req, res) => {

  });
}
