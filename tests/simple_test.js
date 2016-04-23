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
  this.timeout(10000);

  it('simple start', done => {
    const child = child_process.spawn(
      path.join(__dirname, '../bin/cluster_node'), ['--trace', '--config', path.join(__dirname,
        '../config.json')], {
        cwd: path.join(__dirname, '..')
      }, (err, stdout, stderr) => {
        console.log(err);
        //assert.isNull(err);
        assert.match(stdout, /kronos transitioned from starting.*running/);

        done();
      });

    child.stdout.on('data', data => {
      console.log(`stdout: ${data}`);
      if (data.match(/kronos transitioned from starting.*running/)) {
        done();
      }
    });

    child.stderr.on('data', data => {
      console.log(`stderr: ${data}`);
    });

    child.on('close', code => {
      console.log(`child process exited with code ${code}`);
    });

    //console.log(`child:`, child);
    setTimeout(() => child.kill('SIGKILL'), 5000);
  });
});
