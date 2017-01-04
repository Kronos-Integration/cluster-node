/* jslint node: true, esnext: true */

'use strict';

const os = require('os'),
  path = require('path'),
  commander = require('commander'),
  systemdSocket = require('systemd-socket'),
  rebirth = require('rebirth'),
  address = require('network-address');

import {
  pglob, kronosModules, assign
}
from './util';

import {
  manager
}
from 'kronos-service-manager';

import {
  expand
}
from 'config-expander';

require('pkginfo')(module, 'version');

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

process.on('SIGHUP', () => rebirth());

const constants = {
  basedir: path.dirname(commander.config || process.cwd()),
  installdir: path.resolve(__dirname, '..'),
  networkAddress: address()
};

configStatements.forEach(value => {
  const m = value.match(/^([a-zA-Z_][a-zA-Z_0-9]*)=(.*)/);
  if (m) {
    constants[m[1]] = m[2];
  }
});

Promise.all([kronosModules(), expand(commander.config ? "${include('" + path.basename(commander.config) + "')}" : {
  services: {
    'registry': {
      // consul
      checkInterval: '60s'
    }
  }
}, {
  constants
})]).then(results => {
  const [modules, config] = results;

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

  if (logLevel !== undefined) {
    Object.keys(config.services).forEach(sn => config.services[sn].logLevel = logLevel);
  }

  const sds = systemdSocket();
  if (sds) {
    const as = config.services['koa-admin'];
    if (as !== undefined) {
      as.port = sds;
    }
  }

  const services = [config.services.kronos || {
    port: 10000
  }];
  services[0].name = 'kronos';

  Object.keys(config.services).forEach(sn => {
    if (sn !== 'kronos') {
      const service = config.services[sn];
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
