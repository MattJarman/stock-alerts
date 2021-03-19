const common = [
  'test/e2e/features/**/*.feature',
  '--require-module ts-node/register',
  '--require test/e2e/step-definitions/**/*.ts',
  '--require test/e2e/Hooks.ts',
  '--format progress-bar',
  '--format @cucumber/pretty-formatter',
  '--no-strict',
  '--publish-quiet'
].join(' ')

module.exports = {
  default: common
}
