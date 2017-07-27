const os = require('os'),
  path = require('path'),
  program = require('caporal'),
  systemdSocket = require('systemd-socket'),
  rebirth = require('rebirth'),
  address = require('network-address');

import { pglob, kronosModules, assign } from './util';
import { manager } from 'kronos-service-manager';
import { expand } from 'config-expander';

let logLevel;

const flowFileNames = [];
const configStatements = [];

program
  .version(require(path.join(__dirname, '..', 'package.json')).version)
  .description('run cluster node')
  .option('-f, --flow <file>', 'flow to be registered', name =>
    flowFileNames.push(name)
  )
  .option('-s, --start', 'start flow after registering')
  .option('-c, --config <file>', 'use config from file')
  .option('-d --define <key=value>', 'define (service) value', value =>
    configStatements.push(value)
  )
  .option('--debug', 'enable debugging')
  .option('--trace', 'enable tracing')
  .action(async (args, options, logger) => {
    if (options.debug) {
      logLevel = 'debug';
    } else if (options.trace) {
      logLevel = 'trace';
    }

    const constants = {
      basedir: path.dirname(options.config || process.cwd()),
      installdir: path.resolve(__dirname, '..'),
      networkAddress: address()
    };

    configStatements.forEach(value => {
      const m = value.match(/^([a-zA-Z_][a-zA-Z_0-9]*)=(.*)/);
      if (m) {
        constants[m[1]] = m[2];
      }
    });

    const [modules, config] = await Promise.all([
      kronosModules(),
      expand(
        options.config
          ? "${include('" + path.basename(options.config) + "')}"
          : {
              services: {
                registry: {
                  // consul
                  checkInterval: 60
                },
                'koa-admin': {
                  docRoot: "${installdir + '/docroot'}"
                }
              }
            },
        {
          constants
        }
      )
    ]);

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
      Object.keys(config.services).forEach(
        sn => (config.services[sn].logLevel = logLevel)
      );
    }

    const sds = systemdSocket();
    if (sds) {
      const as = config.services['koa-admin'];
      if (as !== undefined) {
        as.port = sds;
      }
    }

    const services = [
      config.services.kronos || {
        port: 10000
      }
    ];
    services[0].name = 'kronos';

    Object.keys(config.services).forEach(sn => {
      if (sn !== 'kronos') {
        const service = config.services[sn];
        service.name = sn;
        services.push(service);
      }
    });

    const m = await manager(services, modules);

    if (logLevel !== undefined) {
      Object.keys(m.services).forEach(
        sn => (m.services[sn].logLevel = logLevel)
      );
    }

    process.on('uncaughtException', err => m.error(err));
    process.on('unhandledRejection', reason => m.error(reason));
    process.on('SIGINT', () => {
      try {
        m.stop().then(() => process.exit());
      } catch (e) {
        console.error(e);
        process.exit();
      }
    });

    process.title = m.id;

    flowFileNames.forEach(name => {
      manager
        .loadFlowFromFile(name)
        .then(flow => {
          m.info(`Flow declared: ${flow}`);
          if (program.start) {
            m.info(`Starting ... ${flow}`);
            flow
              .start()
              .then(() => m.info(`Flow started: ${flow}`))
              .catch(error => m.error(`Flow started failed: ${error}`));
          }
        })
        .catch(error => m.error(`Flow initialization failed: ${error}`));
    });
  });

program.parse(process.argv);

process.on('SIGHUP', () => rebirth());
