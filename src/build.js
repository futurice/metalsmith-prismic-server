function build(config, cb) {
  const smith = metalsmith(config, 'build')
    .destination(path.join(config.buildPath, "master"))
    .build(cb);
}

module.exports = build;
