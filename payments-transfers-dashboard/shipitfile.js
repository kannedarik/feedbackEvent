/* eslint-disable global-require */
/* eslint-disable no-param-reassign */
const axios = require('axios');
const moment = require('moment');

require('dotenv').config();

const flowHook = async (url, data) => {
  const response = await axios.post(url, data);
  return response;
};
import getEnv from './utility/env';

module.exports = (shipit) => {
  // Load shipit-deploy tasks
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      keepWorkspace: true,
      workspace: '.',
      gitUrl: 'https://github.com/Rupeekapp/sangraha',
      projectName: 'ledger-frontend',
      rsyncFrom: './dist',
      keepReleases: 5,
      deleteOnRollback: false,
      shallowClone: false,
    },
    dev: {
      deployTo: '/home/ubuntu/webapps/frontend/ledger-dev',
      servers: {
        user: 'ubuntu',
        host: getEnv('DEV_SERVER'),
      },
      key: getEnv('DEV_KEY_PATH'),
    },
    qa: {
      deployTo: '/home/ubuntu/webapps/frontend/ledger-qa',
      servers: {
        user: 'ubuntu',
        host: getEnv('QA_SERVER'),
      },
      key: getEnv('QA_KEY_PATH'),
    },
    uat: {
      deployTo: '/home/ubuntu/webapps/frontend/ledger-uat',
      servers: {
        user: 'ubuntu',
        host: getEnv('UAT_SERVER'),
      },
      key: getEnv('UAT_KEY_PATH'),
    },
    prod: {
      deployTo: '/home/ubuntu/webapps/frontend',
      servers: {
        user: 'ubuntu',
        host: getEnv('PROD_SERVER'),
      },
      key: getEnv('PROD_KEY_PATH'),
    },
  });

  // Listen to the on published event.
  // This happens right after the symlink for current is established
  shipit.on('published', () => {
    shipit.start('post-publish');
  });

  // First run
  // ================================================================
  // shipit.on('deploy', () => {
  //   shipit.start('init:remote');
  // });

  // Subsequent runs
  // ================================================================
  shipit.task('post-publish', ['terminal', 'google-sheet']);

  shipit.blTask('terminal', async () => {
    const res = await Promise.all([
      shipit.local('git log -1 --pretty=%B', { cwd: shipit.config.workspace }),
      shipit.local('git log -1 --pretty=%H', { cwd: shipit.config.workspace }),
      shipit.local('git config --global user.name', { cwd: shipit.config.workspace }),
      shipit.local('git rev-parse --abbrev-ref HEAD', { cwd: shipit.config.workspace }),
    ]);

    shipit.config.commitmsg = res[0].stdout.trim();
    shipit.config.commitid = res[1].stdout.trim();
    shipit.config.gitusername = res[2].stdout.trim();
    shipit.config.branch = res[3].stdout.trim();
  });

  // Google Sheet
  // ----------------------------------------------------------------
  shipit.blTask('google-sheet', async () => {
    await flowHook(getEnv('ZOHOFLOW_DEPLOY_URI'), {
      timestamp: moment().format('M/D/YYYY H:mm:ss'),
      name: shipit.config.projectName,
      environment: shipit.environment,
      server: shipit.config.servers.host,
      branch: shipit.config.branch,
      username: shipit.config.gitusername,
      commit: `${shipit.config.gitUrl}/commits/${shipit.config.commitid}`,
      message: shipit.config.commitmsg,
    });
  });

  shipit.blTask('init:remote', async () => {
    await shipit.remote(`mkdir -p ${shipit.config.deployTo}`);
  });
};
