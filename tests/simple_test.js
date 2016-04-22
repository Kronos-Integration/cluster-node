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
  it('simple start', done => {
    const child = child_process.exec([
      path.join(__dirname, '../bin/cluster_node'),
      '--trace'
    ].join(' '), (err, stdout, stderr) => {
      console.log(err);
      console.log(stdout);
      //assert.isNull(err);
      assert.match(stdout, /kronos transitioned from starting.*running/);

      done();
    });

    setTimeout(() => child.kill('SIGKILL'), 1000);
  });
});
