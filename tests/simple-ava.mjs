import test from "ava";
import { spawn } from "node:child_process";

test("simple start", async t => {
  t.plan(1);

  const child = spawn(
    new URL("../src/cluster-node-cli.mjs", import.meta.url).pathname,
    [
      "--trace",
      "--config",
      new URL("../config/config.json", import.meta.url).pathname
    ],
    {
      cwd: new URL("..", import.meta.url).pathname
    },
    (err, stdout, stderr) => {
      console.error(err);
      t.fail(err);
      t.end();
    }
  );

  child.stdout.on("data", data => {
    data = `${data}`;
    data = data.substring(0, data.length - 1);

    console.log(data);
    if (data.match(/running/) && data.match(/kronos/)) {
      t.pass();
      t.end();
    }
  });

  child.stderr.on("data", data => {
    data = `${data}`;
    data.trim();
    console.log(`stderr: ${data}`);
  });

  child.on("close", code =>
    console.log(`child process exited with code ${code}`)
  );

  //console.log(`child:`, child);
  setTimeout(() => child.kill("SIGKILL"), 5000);

  t.pass();
});
