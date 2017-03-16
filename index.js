const $fs = require('fs');
const $path = require('path');

const $validator = require('./src/validator');

if (process.argv[2] && process.argv[2].indexOf('.git') === 0) {
    const commitMessage = $fs.readFileSync($path.resolve('.', process.argv[2])).toString();
    try {
        $validator.validate(commitMessage);
        process.exit(0);
    } catch (e) {
        console.log('Commit message format failure, should follow this format:');
        console.log('    <type>(<scope>): <subject> <issue>');
        console.log(`Error: ${e.message}`);
        process.exit(1);
    }
}
else {
    module.exports = $validator;
}
