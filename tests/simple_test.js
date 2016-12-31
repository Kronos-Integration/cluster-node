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
      path.join(__dirname, '../bin/cluster_node'), ['--trace', '--config', path.join(__dirname, '..',
        'config.json')], {
        cwd: path.join(__dirname, '..')
      }, (err, stdout, stderr) => {
        console.error(err);
        done();
      });

    child.stdout.on('data', data => {
      data = `${data}`;
      data = data.substring(0, data.length - 1);

      console.log(data);
      if (data.match(/running/) && data.match(/kronos/)) {
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
