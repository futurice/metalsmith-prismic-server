const _ = require('lodash');

/**
 * compose two predicates
 */
function pcomp(f, g) {
  return function () {
    return f.apply(null, arguments) && g.apply(null, arguments);
  }
}

/**
 * return metalsmith ware for carrying out the given replacement
 * on files for which the given fileFilter returns true
 */
function replace (regex, replacement, fileFilter) {
  if (fileFilter instanceof Array) {
    fileFilter = fileFilter.reduce(pcomp);
  } else if (!fileFilter) {
    fileFilter = () => true;
  }
  return files => {
    _.forEach(files, (file, path) => {
      if (fileFilter(file, path)) {
        file.contents = new Buffer(file.contents.toString().replace(regex, replacement));
      }
    });
  }
}

/**
 * return a predicate which matches files with the given extension(s);
 */
function filenameExtensionFilter (ext) {
  if (typeof ext === 'string') {
    return (_, path) => path.endsWith('.' + ext);
  } else if (ext instanceof Array) {
    return ext
      .map(filenameExtensionFilter)
      .reduce(pcomp);
  }
}

module.exports = {replace, filenameExtensionFilter};
