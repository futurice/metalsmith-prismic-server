const fs = require('fs');
const path = require('path');
const rmdir = require('rimraf');

/**
 * Removes immediate child directories of the given directory which
 * are older than some given age.
 *
 * @param dir [string] the path of the base dir
 * @param age [number] the age threshold over which subdirs should be removed
 */
module.exports = function (dir, age, cb) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(childDirName => {
      const qualifiedPath = path.join(dir, childDirName);
      const lastModified = fs.statSync(qualifiedPath).mtime;
      if (lastModified < Date.now() - age) {
        rmdir.sync(qualifiedPath);
        cb && cb(qualifiedPath);
      }
    });
  }
};
