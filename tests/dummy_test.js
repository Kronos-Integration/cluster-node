/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  path = require('path'),
  child_process = require('child_process');

describe('cluster_node', function () {
  it('simple start', function (done) {

    const child = child_process.exec([
      path.join(__dirname, '../bin/cluster_node'),
      '--trace'
    ].join(' '), (err, stdout, stderr) => {
      console.log(err);
      console.log(stdout);
      //assert.isNull(err);
      //assert.isTrue(fs.existsSync(path.join(dir, "success.txt")), "did not find success.txt");
      //assert.match(stdout, /completed/, "Expected a success message");
      done();
    });

    setTimeout(() => {
      console.log(`send signal`);
      child.kill('SIGKILL');
    }, 1000);
  });
});
