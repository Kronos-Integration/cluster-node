import test from 'ava';

const path = require('path');
const child_process = require('child_process');

test.cb('simple start', t => {
  t.plan(1);

  const child = child_process.spawn(
    path.join(__dirname, '../bin/kronos-cluster-node'),
    [
      '--trace',
      '--config',
      path.join(__dirname, '..', 'config', 'config.json')
    ],
    {
      cwd: path.join(__dirname, '..')
    },
    (err, stdout, stderr) => {
      console.error(err);
      t.fail(err);
      t.end();
    }
  );

  child.stdout.on('data', data => {
    data = `${data}`;
    data = data.substring(0, data.length - 1);

    console.log(data);
    if (data.match(/running/) && data.match(/kronos/)) {
      t.pass();
      t.end();
    }
  });

  child.stderr.on('data', data => {
    data = `${data}`;
    data.trim();
    console.log(`stderr: ${data}`);
  });

  child.on('close', code =>
    console.log(`child process exited with code ${code}`)
  );

  //console.log(`child:`, child);
  setTimeout(() => child.kill('SIGKILL'), 5000);
});
