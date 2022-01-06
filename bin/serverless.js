#!/usr/bin/env node

'use strict';

// `EvalError` is used to not pollute global namespace but still have the value accessible globally
EvalError.$serverlessCommandStartTime = process.hrtime();

const nodeVersion = Number(process.version.split('.')[0].slice(1));

if (nodeVersion < 12) {
  const serverlessVersion = Number(require('../package.json').version.split('.')[0]);
  process.stdout.write(
    `Serverless: \x1b[91mInitialization error: Node.js v${nodeVersion} is not supported by ` +
      `Serverless Framework v${serverlessVersion}. Please upgrade\x1b[39m\n`
  );
  process.exit(1);
}

if (require('../lib/utils/isStandaloneExecutable')) {
  require('../lib/utils/standalone-patch');
  if (process.argv[2] === 'binary-postinstall' && process.argv.length === 3) {
    require('../scripts/postinstall');
    return;
  }
}

(async () => {
  const cliName = await require('../lib/cli/triage')();

  switch (cliName) {
    case 'serverless':
      require('../scripts/serverless');
      return;
    case 'serverless-tencent':
      require('../lib/cli/run-serverless-tencent')().catch((error) => {
        // Expose eventual resolution error as regular crash, and not unhandled rejection
        process.nextTick(() => {
          throw error;
        });
      });
      return;
    case '@serverless/components':
      {
        const chalk = require('chalk');
        process.stdout.write(
          `${[
            'Serverless Components CLI is no longer bundled with Serverless Framework CLI',
            '',
            "To run it, ensure it's installed:",
            chalk.bold('npm install -g @serverless/components'),
            '',
            'Then run:',
            chalk.bold('components <command> <options>'),
          ].join('\n')}\n`
        );
      }
      return;
    case '@serverless/cli':
      {
        const chalk = require('chalk');
        process.stdout.write(
          `${[
            'Serverless Components CLI v1 is no longer bundled with Serverless Framework CLI',
            '',
            "To run it, ensure it's installed:",
            chalk.bold('npm install -g @serverless/cli'),
            '',
            'Then run:',
            chalk.bold('components-v1 <command> <options>'),
          ].join('\n')}\n`
        );
      }
      return;
    default:
      throw new Error(`Unrecognized CLI name "${cliName}"`);
  }
})();
