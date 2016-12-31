/* jslint node: true, esnext: true */

'use strict';

const os = require('os'),
  fs = require('fs'),
  path = require('path'),
  commander = require('commander'),
  systemdSocket = require('systemd-socket'),
  rebirth = require('rebirth'),
  glob = require('glob'),
  address = require('network-address');

import {
  manager
}
from 'kronos-service-manager';

require('pkginfo')(module, 'version');

import {
  expand as configExpand
}
from 'config-expander';

let logLevel;

const flowFileNames = [];
const configStatements = [];

commander
  .version(module.exports.version)
  .description('run cluster node')
  .option('-f, --flow <file>', 'flow to be registered', name => flowFileNames.push(name))
  .option('-s, --start', 'start flow after registering')
  .option('-c, --config <file>', 'use config from file')
  .option('-d --define <service.path.to.key=value> or <key=value>', 'define (service) value', value => configStatements
    .push(value))
  .option('--debug', 'enable debugging')
  .option('--trace', 'enable tracing')
  .parse(process.argv);

if (commander.debug) {
  logLevel = 'debug';
} else if (commander.trace) {
  logLevel = 'trace';
}

const cfg = (commander.config ? new Promise((fullfill, reject) => {
  fs.readFile(commander.config, (err, data) => {
    if (err) reject(err);
    else
      fullfill(JSON.parse(data));
  });
}) : Promise.resolve({
  services: {
    'registry': {
      // consul
      checkInterval: '60s'
    }
  }
})).then(config => expand(config));

process.on('SIGHUP', () => rebirth());

function pglob(path, options) {
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

function kronosModules() {
  return pglob(path.join(__dirname, '..', 'node_modules/*/package.json'), {}).then(files => {
    const modules = [];
    return Promise.all(files.map(file =>
      new Promise((fullfill, reject) => {
        fs.readFile(file, (err, data) => {
          if (err) {
            reject(`loading ${file}: ${err}`);
            return;
          }
          try {
            const p = JSON.parse(data);

            if (p.keywords) {
              if (p.keywords.find(k =>
                  k === 'kronos-step' || k === 'kronos-service' || k === 'kronos-interceptor')) {
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
    )).then(results => modules);
  });
}

Promise.all([kronosModules(), cfg]).then(results => {
  const modules = results[0];
  const cfg = results[1];

  if (logLevel !== undefined) {
    Object.keys(cfg.services).forEach(sn => cfg.services[sn].logLevel = logLevel);
  }

  const sds = systemdSocket();
  if (sds) {
    const as = cfg.services['koa-admin'];
    if (as !== undefined) {
      as.port = sds;
    }
  }

  const services = [cfg.services.kronos || {
    port: 10000
  }];
  services[0].name = 'kronos';

  Object.keys(cfg.services).forEach(sn => {
    if (sn !== 'kronos') {
      const service = cfg.services[sn];
      service.name = sn;
      services.push(service);
    }
  });

  manager(services, modules).then(manager => {
    if (logLevel !== undefined) {
      Object.keys(manager.services).forEach(sn => manager.services[sn].logLevel = logLevel);
    }

    process.on('uncaughtException', err => manager.error(err));
    process.on('unhandledRejection', reason => manager.error(reason));
    process.on('SIGINT', () => {
      try {
        manager.stop().then(() => process.exit());
      } catch (e) {
        console.error(e);
        process.exit();
      }
    });

    process.title = manager.id;

    flowFileNames.forEach(name => {
      manager.loadFlowFromFile(name).then(flow => {
        manager.info(`Flow declared: ${flow}`);
        if (commander.start) {
          manager.info(`Starting ... ${flow}`);
          flow.start().then(() => manager.info(`Flow started: ${flow}`)).catch(error =>
            manager.error(
              `Flow started failed: ${error}`));
        }
      }).catch(error => manager.error(`Flow initialization failed: ${error}`));
    });
  });
}).catch(console.error);


function assign(dest, value, attributePath) {
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

function expand(config) {
  configStatements.forEach(value => {
    const m = value.match(/^([a-zA-Z_][a-zA-Z_0-9]*)=(.*)/);
    if (m) {
      config.properties[m[1]] = m[2];
    }
  });

  config = configExpand(config, {
    constants: {
      basedir: path.dirname(commander.config || process.cwd()),
      networkAddress: address()
    }
  });

  configStatements.forEach(value => {
    const m = value.match(/^([^\.]+).([^=]+)=(.*)/);
    if (m) {
      const serviceName = m[1];
      const attributeName = m[2];
      const value = m[3];

      let service = config.services[serviceName];
      if (!service) {
        service = config.services[serviceName] = {};
      }

      assign(service, value, attributeName);
    }
  });

  return config;
}
