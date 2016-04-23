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
        done();
      });

    child.stdout.on('data', data => {
      data = `${data}`;
      data.replace(/(\r\n|\n|\r)/gm, '');
      data.trim();
      console.log(data);
      if (data.match(/kronos.*transitioned.*running/)) {
        done();
      }
    });

    child.stderr.on('data', data => {
      data = `${data}`;
      data.trim();
      console.log(`stderr: ${data}`);
    });

    child.on('close', code => {
      console.log(`child process exited with code ${code}`);
    });

    //console.log(`child:`, child);
    setTimeout(() => child.kill('SIGKILL'), 5000);
  });
});
