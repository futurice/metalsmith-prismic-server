'use strict';

const fs = require('fs');
const path = require('path');
const removeOldDirs = require('../src/remove-old-dirs');
const rmdir = require('rimraf');

const assert = require('assert');

const TMP_DIR = 'test-tmp';

if (fs.existsSync(TMP_DIR)) {
  rmdir.sync(TMP_DIR);
}

describe('the removeOldDirs function', () => {
  it('removes all subdirectories of some given directory which exceed a given age', done => {
    // make the dir tree.
    fs.mkdirSync(TMP_DIR);

    fs.mkdirSync(path.join(TMP_DIR, 'a'));
    fs.mkdirSync(path.join(TMP_DIR, 'b'));
    fs.mkdirSync(path.join(TMP_DIR, 'c'));


    setTimeout(() => {

      fs.mkdirSync(path.join(TMP_DIR, 'd'));
      fs.mkdirSync(path.join(TMP_DIR, 'e'));

      assert(fs.existsSync(path.join(TMP_DIR, 'a')));
      assert(fs.existsSync(path.join(TMP_DIR, 'b')));
      assert(fs.existsSync(path.join(TMP_DIR, 'c')));
      assert(fs.existsSync(path.join(TMP_DIR, 'd')));
      assert(fs.existsSync(path.join(TMP_DIR, 'e')));

      let count = 0;
      removeOldDirs(TMP_DIR, 1000, () => count++);

      assert.equal(count, 3);

      assert(!fs.existsSync(path.join(TMP_DIR, 'a')));
      assert(!fs.existsSync(path.join(TMP_DIR, 'b')));
      assert(!fs.existsSync(path.join(TMP_DIR, 'c')));
      assert(fs.existsSync(path.join(TMP_DIR, 'd')));
      assert(fs.existsSync(path.join(TMP_DIR, 'e')));

      rmdir.sync(TMP_DIR);
      done();
    }, 1000);
  });
});
