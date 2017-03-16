const $hook = require('./src/hook');
const $configure = require('./src/configure');
const $validator = require('./src/validator');

module.exports = {
    hook: $hook.hook,
    getCommitMessage: $hook.getCommitMessage,
    configure: $configure.configure,
    validate: $validator.validate
};
