const fs = require('fs'),
  path = require('path'),
  glob = require('glob');

export function pglob(path, options) {
  return new Promise((fullfull, reject) => {
    glob(path, options, (err, files) => {
      if (err) {
        reject(err);
      } else {
        fullfull(files);
      }
    });
  });
}

export function kronosModules() {
  return pglob(
    path.join(__dirname, '..', 'node_modules/*/package.json'),
    {}
  ).then(files => {
    const modules = [];
    return Promise.all(
      files.map(
        file =>
          new Promise((fullfill, reject) => {
            fs.readFile(file, (err, data) => {
              if (err) {
                reject(`loading ${file}: ${err}`);
                return;
              }
              try {
                const p = JSON.parse(data);

                if (p.keywords) {
                  if (
                    p.keywords.find(
                      k =>
                        k === 'kronos-step' ||
                        k === 'kronos-service' ||
                        k === 'kronos-interceptor'
                    )
                  ) {
                    try {
                      modules.push(require(p.name));
                      fullfill();
                      return;
                    } catch (e) {
                      reject(`${file}: ${p.name} ${e}`);
                    }
                  }
                }
              } catch (e) {
                reject(e);
              }

              fullfill();
            });
          })
      )
    ).then(results => modules);
  });
}

export function assign(dest, value, attributePath) {
  const m = attributePath.match(/^(\w+)\.(.*)/);

  if (m) {
    const key = m[1];
    if (dest[key] === undefined) {
      dest[key] = {};
    }
    assign(dest[key], value, m[1]);
  } else {
    dest[attributePath] = value;
  }
}
