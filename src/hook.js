const $fs = require('fs');
const $path = require('path');

const $configure = require('./configure');
const $validator = require('./validator');

module.exports = {
    hook: hook,
    getCommitMessage: getCommitMessage
};

function hook () {

    const commitMessage = getCommitMessage();
    if (commitMessage !== null) {
        try {
            $validator.validate(commitMessage, $configure.configure());
        } catch (e) {
            console.log('Commit message format failure, should follow this format:');
            console.log('    <type>(<scope>): <subject> <issue>');
            throw e;
        }
    }
    else {
        throw new Error('Cannot run hook without receiving the argument containing the commit-msg path');
    }

}

function getCommitMessage () {
    if (process.argv[2] && process.argv[2].indexOf('.git') === 0) {
        return $fs.readFileSync($path.resolve('.', process.argv[2])).toString();
    }
    return null;
}
