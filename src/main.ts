import * as core from '@actions/core';
import * as exec from '@actions/exec';
import which from 'which';

export const IsPost = !!process.env['STATE_isPost']

// inputs
const name = core.getInput('name', { required: true });
const instance = core.getInput('instance', { required: true });
const extraPullNames = core.getInput('extraPullNames');
const authToken = core.getInput('authToken')
const skipPush = core.getInput('skipPush');
const pathsToPush = core.getInput('pathsToPush');
const pushFilter = core.getInput('pushFilter');
const atticArgs = core.getInput('atticArgs');

const installCommand =
  core.getInput('installCommand') || `${__dirname}/install-attic-ci.sh`;

async function setup() {
  try {
    if(!which.sync('attic', { nothrow: true })) {
      core.startGroup('Attic: installing')
      await exec.exec('bash', ['-c', installCommand]);
      core.endGroup()
    }

    core.startGroup('Attic: checking version')
    await exec.exec('attic', ['--version']);
    core.endGroup()

    // for managed signing key and private caches
    if (authToken !== "") {
      await exec.exec('attic', ['login', name, instance, authToken]);
    } else {
      await exec.exec('attic', ['login', name, instance]);
    }

    core.startGroup(`Attic: using cache ` + name);
    await exec.exec('attic', ['use', name]);
    core.endGroup();

    if (extraPullNames != "") {
      core.startGroup(`Attic: using extra caches ` + extraPullNames);
      const extraPullNameList = extraPullNames.split(',');
      for (let itemName of extraPullNameList) {
        const trimmedItemName = itemName.trim();
        await exec.exec('attic', ['use', trimmedItemName]);
      }
      core.endGroup();
    }

    // Remember existing store paths
    await exec.exec("sh", ["-c", `${__dirname}/list-nix-store.sh > /tmp/store-path-pre-build`]);
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
}

async function upload() {
  core.startGroup('Attic: push');
  try {
    if (skipPush === 'true') {
      core.info('Pushing is disabled as skipPush is set to true');
    } else if (authToken !== "") {
      await exec.exec(`${__dirname}/push-paths.sh`, ['attic', atticArgs, name, pathsToPush, pushFilter]);
    } else {
      core.info('Pushing is disabled as signingKey nor authToken are set (or are empty?) in your YAML file.');
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
  core.endGroup();
}

// Main
if (!IsPost) {
  // Publish a variable so that when the POST action runs, it can determine it should run the cleanup logic.
  // This is necessary since we don't have a separate entry point.
  core.saveState('isPost', 'true');
  setup()
} else {
  // Post
  upload()
}
