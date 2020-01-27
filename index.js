const core = require('@actions/core');

const chooseSandbox = labels => {
  const sandboxes = core.getInput('available_sanboxes') || [
    'sandbox1',
    'sandbox2',
    'sandbox3'
  ];
  for (label of labels) {
    if (sandboxes.includes(label)) {
      return label;
    }
  }
  if (getBranchName() === 'master') {
    return core.getInput('master_environment_name') || 'T2gpWebDocker-env';
  }
  return '';
};

const getBranchName = () => {
  const eventName = process.env.GITHUB_EVENT_NAME;
  const ref = process.env.GITHUB_REF;
  let branchName;
  if (eventName === 'push') {
    branchName = ref.split('/').pop();
  } else {
    branchName = process.env.GITHUB_HEAD_REF;
  }
  return branchName;
};

const setBranchName = () => {
  core.setOutput('branch_name', getBranchName());
};

const setSandbox = () => {
  const labels = JSON.parse(core.getInput('labels'));
  const sandbox = chooseSandbox(labels);
  core.setOutput('environment_name', sandbox);
};

const setVersion = () =>
  core.setOutput('version', process.env.GITHUB_SHA.substring(0, 8));

const setUrl = () => {
  const labels = JSON.parse(core.getInput('labels'));
  const sandbox = chooseSandbox(labels);
  const urlMappings = JSON.parse(core.getInput('url_mappings'));
  if (sandbox && urlMappings) {
    core.setOutput('url', urlMappings[sandbox]);
  }
};

const main = () => {
  try {
    console.log('run build info action.');

    setBranchName();
    setSandbox();
    setVersion();
    setUrl();

    console.log('build info action done.');
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
